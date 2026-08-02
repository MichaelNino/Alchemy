import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QFile extends BaseComponent {
    constructor(props = {}) {
        const entry = new Gtk.Entry();
        entry.editable = false;
        entry.placeholder_text = props.label || 'Select file...';
        entry.set_icon_from_icon_name(Gtk.EntryIconPosition.SECONDARY, 'folder-open-symbolic');
        entry.set_icon_activatable(Gtk.EntryIconPosition.SECONDARY, true);
        
        super(entry);
        
        this.modelValue = props.modelValue;
        this.multiple = props.multiple || false;
        this.accept = props.accept; 
        
        const openDialog = () => {
            const dialog = new Gtk.FileDialog();
            const root = this.widget.get_root();
            
            if (this.accept) {
                const filter = new Gtk.FileFilter();
                filter.set_name("Accepted Files");
                this.accept.split(',').forEach(rule => {
                    rule = rule.trim();
                    if (rule.startsWith('.')) {
                        filter.add_pattern('*' + rule);
                    } else if (rule.includes('/')) {
                        filter.add_mime_type(rule);
                    } else {
                        filter.add_pattern(rule);
                    }
                });
                
                // Gtk.FileDialog expects a Gio.ListModel of Gtk.FileFilter
                const filterList = Gio.ListStore.new(Gtk.FileFilter);
                filterList.append(filter);
                dialog.set_filters(filterList);
                dialog.set_default_filter(filter);
            }
            
            if (this.multiple) {
                dialog.open_multiple(root, null, (dlg, res) => {
                    try {
                        const files = dlg.open_multiple_finish(res);
                        let paths = [];
                        for (let i = 0; i < files.get_n_items(); i++) {
                            const f = files.get_item(i);
                            paths.push(f.get_path());
                        }
                        if (this.modelValue) this.modelValue.value = paths;
                    } catch(e) {
                        // User canceled or error
                    }
                });
            } else {
                dialog.open(root, null, (dlg, res) => {
                    try {
                        const file = dlg.open_finish(res);
                        if (this.modelValue) this.modelValue.value = file.get_path();
                    } catch(e) {
                        // User canceled or error
                    }
                });
            }
        };

        // Trigger on icon click
        entry.connect('icon-press', openDialog);
        
        // Trigger on widget click
        const click = new Gtk.GestureClick();
        click.connect('pressed', openDialog);
        entry.add_controller(click);
        
        if (this.modelValue) {
            effect(() => {
                const val = this.modelValue.value;
                if (Array.isArray(val)) {
                    // Extract just the filenames for cleaner display
                    const filenames = val.map(p => {
                        const parts = p.split('/');
                        return parts[parts.length - 1];
                    });
                    entry.text = filenames.join(', ');
                } else {
                    if (val) {
                        const parts = String(val).split('/');
                        entry.text = parts[parts.length - 1];
                    } else {
                        entry.text = '';
                    }
                }
            });
        }
    }
}
