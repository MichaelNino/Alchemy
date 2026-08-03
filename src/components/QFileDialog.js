import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { BaseComponent } from '../component.js';
import { QSplitter } from './QSplitter.js';
import { QRow } from './QGrid.js';
import { QCol } from './QGrid.js';
import { QBtn } from './QBtn.js';

export class QFileDialog extends BaseComponent {
    constructor(props = {}) {
        const dialog = new Gtk.Window({
            title: props.title || 'Open File',
            default_width: 800,
            default_height: 600,
            modal: true
        });

        super(dialog);
        this.dialog = dialog;

        this.allowedLocations = props.allowedLocations || [];
        this.filters = props.filters || [];
        this.selectDirectories = props.selectDirectories || false;
        this.onAccept = props.onAccept || null;

        // Ensure we have at least one allowed location to prevent errors
        if (this.allowedLocations.length === 0) {
            this.allowedLocations.push({ name: 'Home', path: GLib.get_home_dir() });
        }

        this.currentRoot = this.allowedLocations[0];
        this.currentPath = this.currentRoot.path;
        this.selectedFile = null;

        this._buildUI();
        this._loadDirectory(this.currentPath);
    }

    _buildUI() {
        const mainBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
        this.dialog.set_child(mainBox);

        // Header / Path Bar
        const header = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        header.add_css_class('toolbar');
        header.margin_start = 10;
        header.margin_end = 10;
        header.margin_top = 10;
        header.margin_bottom = 10;

        this.upBtn = new Gtk.Button({ icon_name: 'go-up-symbolic' });
        this.upBtn.connect('clicked', () => this._navigateUp());
        header.append(this.upBtn);

        this.pathLabel = new Gtk.Label({ label: '', xalign: 0 });
        this.pathLabel.hexpand = true;
        header.append(this.pathLabel);

        mainBox.append(header);

        // Splitter: Shortcuts vs File List
        const paned = new Gtk.Paned({ orientation: Gtk.Orientation.HORIZONTAL });
        paned.set_position(200); // Sidebar width
        paned.hexpand = true;
        paned.vexpand = true;
        mainBox.append(paned);

        // Sidebar (Shortcuts)
        const sidebarScroll = new Gtk.ScrolledWindow({
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });
        sidebarScroll.set_size_request(150, -1);
        const sidebarList = new Gtk.ListBox({ selection_mode: Gtk.SelectionMode.SINGLE });
        sidebarList.add_css_class('navigation-sidebar');
        
        this.allowedLocations.forEach(loc => {
            const row = new Gtk.ListBoxRow();
            const lbl = new Gtk.Label({ label: loc.name, xalign: 0 });
            lbl.margin_start = 10;
            lbl.margin_top = 5;
            lbl.margin_bottom = 5;
            row.set_child(lbl);
            // Store path in row
            row._path = loc.path;
            row._loc = loc;
            sidebarList.append(row);
        });

        sidebarList.connect('row-activated', (list, row) => {
            this.currentRoot = row._loc;
            this._loadDirectory(row._path);
        });
        
        // Select first by default
        const firstRow = sidebarList.get_row_at_index(0);
        if (firstRow) sidebarList.select_row(firstRow);

        sidebarScroll.set_child(sidebarList);
        paned.set_start_child(sidebarScroll);

        // Main File List
        this.fileScroll = new Gtk.ScrolledWindow({
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            hexpand: true,
            vexpand: true
        });
        this.fileScroll.set_size_request(400, -1);

        this.fileList = new Gtk.ListBox({ selection_mode: Gtk.SelectionMode.SINGLE });
        this.fileScroll.set_child(this.fileList);
        paned.set_end_child(this.fileScroll);

        this.fileList.connect('row-activated', (list, row) => {
            const fileInfo = row._fileInfo;
            const isDir = fileInfo.get_file_type() === Gio.FileType.DIRECTORY;
            
            if (isDir) {
                this._loadDirectory(row._path);
            } else {
                this._selectFile(row._path, fileInfo.get_name());
            }
        });

        // Footer
        const footer = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        footer.margin_start = 10;
        footer.margin_end = 10;
        footer.margin_top = 10;
        footer.margin_bottom = 10;

        this.selectedFileLabel = new Gtk.Label({ label: 'No file selected', xalign: 0 });
        this.selectedFileLabel.hexpand = true;
        footer.append(this.selectedFileLabel);

        const cancelBtn = new Gtk.Button({ label: 'Cancel' });
        cancelBtn.connect('clicked', () => this.dialog.close());
        footer.append(cancelBtn);

        this.openBtn = new Gtk.Button({ label: 'Open' });
        this.openBtn.add_css_class('suggested-action');
        this.openBtn.sensitive = false; // Disabled until selection
        this.openBtn.connect('clicked', () => {
            if (this.selectedFile && this.onAccept) {
                this.onAccept(this.selectedFile);
                this.dialog.close();
            }
        });
        footer.append(this.openBtn);

        mainBox.append(footer);
    }

    _loadDirectory(path) {
        this.currentPath = path;
        this.selectedFile = null;
        this.selectedFileLabel.label = 'No file selected';
        this.openBtn.sensitive = false;

        // Update Breadcrumb/PathLabel
        let displayPath = this.currentRoot.name;
        if (this.currentPath !== this.currentRoot.path) {
            let rel = this.currentPath.substring(this.currentRoot.path.length);
            displayPath += rel;
        }
        this.pathLabel.label = displayPath;

        // Disable UP if at root of jail
        this.upBtn.sensitive = (this.currentPath !== this.currentRoot.path);

        // Clear list
        let child = this.fileList.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.fileList.remove(child);
            child = next;
        }
        
        // Add ".." entry if not at root
        if (this.currentPath !== this.currentRoot.path) {
            this._addUpRow();
        }

        const dir = Gio.File.new_for_path(this.currentPath);
        
        // Read async
        dir.enumerate_children_async(
            'standard::name,standard::type,standard::icon',
            Gio.FileQueryInfoFlags.NONE,
            GLib.PRIORITY_DEFAULT,
            null,
            (source, res) => {
                try {
                    const enumerator = source.enumerate_children_finish(res);
                    this._readNextFiles(enumerator);
                } catch (e) {
                    console.error("Error reading directory:", e);
                }
            }
        );
    }
    
    _addUpRow() {
        const row = new Gtk.ListBoxRow();
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        box.margin_start = 10;
        box.margin_end = 10;
        box.margin_top = 5;
        box.margin_bottom = 5;

        const icon = new Gtk.Image({ icon_name: 'go-up-symbolic' });
        box.append(icon);

        const lbl = new Gtk.Label({ label: '.. (Up)', xalign: 0 });
        box.append(lbl);

        row.set_child(box);
        
        // Mock a fileInfo so row-activated knows it's a directory
        row._fileInfo = {
            get_file_type: () => Gio.FileType.DIRECTORY,
            get_name: () => '..'
        };
        
        // Set the path to the parent directory
        const currentFile = Gio.File.new_for_path(this.currentPath);
        const parent = currentFile.get_parent();
        if (parent) {
            row._path = parent.get_path();
        } else {
            row._path = this.currentRoot.path;
        }
        
        this.fileList.append(row);
    }

    _readNextFiles(enumerator) {
        enumerator.next_files_async(
            50, // read in chunks
            GLib.PRIORITY_DEFAULT,
            null,
            (source, res) => {
                try {
                    const infos = source.next_files_finish(res);
                    if (infos.length > 0) {
                        infos.forEach(info => {
                            if (this._matchesFilter(info)) {
                                this._addFileRow(info);
                            }
                        });
                        // Continue reading
                        this._readNextFiles(source);
                    } else {
                        source.close(null); // done
                    }
                } catch (e) {
                    console.error("Error enumerating files:", e);
                }
            }
        );
    }

    _matchesFilter(info) {
        const name = info.get_name();
        // Always show dirs so user can navigate
        if (info.get_file_type() === Gio.FileType.DIRECTORY) {
            return true;
        }
        // If selecting directories only, hide files
        if (this.selectDirectories) {
            return false;
        }
        // No filters = match all
        if (this.filters.length === 0) {
            return true;
        }
        
        // Simple glob matching (*.ext)
        for (let filter of this.filters) {
            if (filter === '*') return true;
            if (filter.startsWith('*.')) {
                const ext = filter.substring(1);
                if (name.endsWith(ext)) return true;
            }
        }
        
        return false;
    }

    _addFileRow(info) {
        const row = new Gtk.ListBoxRow();
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        box.margin_start = 10;
        box.margin_end = 10;
        box.margin_top = 5;
        box.margin_bottom = 5;

        // Use GIO's native icon resolution (based on file type, extension, etc.)
        const gicon = info.get_icon();
        const icon = new Gtk.Image({ gicon: gicon });
        box.append(icon);

        const lbl = new Gtk.Label({ label: info.get_name(), xalign: 0 });
        box.append(lbl);

        row.set_child(box);
        row._fileInfo = info;
        row._path = GLib.build_filenamev([this.currentPath, info.get_name()]);
        
        this.fileList.append(row);
    }

    _navigateUp() {
        if (this.currentPath === this.currentRoot.path) return; // Jailed
        
        const currentFile = Gio.File.new_for_path(this.currentPath);
        const parent = currentFile.get_parent();
        if (!parent) return;

        const parentPath = parent.get_path();
        
        // Remove trailing slashes for safety comparison
        const cleanParent = parentPath.replace(/\/$/, "");
        const cleanRoot = this.currentRoot.path.replace(/\/$/, "");

        // Only allow upward navigation if the new parent is the root or a child of the root
        if (cleanParent !== cleanRoot && !cleanParent.startsWith(cleanRoot + '/')) {
            this._loadDirectory(this.currentRoot.path);
            return;
        }
        
        this._loadDirectory(parentPath);
    }

    _selectFile(path, name) {
        this.selectedFile = path;
        this.selectedFileLabel.label = name;
        this.openBtn.sensitive = true;
    }

    show() {
        this.dialog.present();
    }
}
