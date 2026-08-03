import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QAvatar extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Frame());
        
        this.widget.add_css_class('avatar');
        
        this.box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        this.box.set_halign(Gtk.Align.CENTER);
        this.box.set_valign(Gtk.Align.CENTER);
        this.widget.set_child(this.box);
        
        this.size = props.size || 48;
        this.widget.width_request = this.size;
        this.widget.height_request = this.size;

        // Shape (circle or square)
        const shape = props.shape || 'circle';
        this._applyShapeCSS(shape, this.size);

        // Image loading
        if (props.image) {
            this.setImage(props.image);
        }

        // Editable (click to open QFileDialog)
        if (props.editable) {
            this.widget.add_css_class('clickable'); // Cursor pointer if supported
            const click = new Gtk.GestureClick();
            click.connect('pressed', () => {
                const GLib = imports.gi.GLib;
                
                // Note: requires QFileDialog to be available
                import('./QFileDialog.js').then(({ QFileDialog }) => {
                    const dialog = new QFileDialog({
                        title: 'Select Avatar Image',
                        allowedLocations: [
                            { name: 'Home', path: GLib.get_home_dir() },
                            { name: 'Pictures', path: GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) || GLib.get_home_dir() + '/Pictures' }
                        ],
                        filters: ['*.png', '*.jpg', '*.jpeg', '*.svg'],
                        onAccept: (path) => {
                            this.setImage(path);
                            if (props.onImageSelect) {
                                props.onImageSelect(path);
                            }
                        }
                    });
                    dialog.show();
                }).catch(e => console.error(e));
            });
            this.widget.add_controller(click);
        }
    }

    _applyShapeCSS(shape, size) {
        const provider = new Gtk.CssProvider();
        let css = '';
        if (shape === 'circle') {
            css = `.avatar { border-radius: ${Math.max(size, 100)}px; overflow: hidden; }`;
        } else {
            css = `.avatar { border-radius: 8px; overflow: hidden; }`;
        }
        provider.load_from_data(css);
        this.widget.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    }

    setImage(path) {
        // Clear existing children
        let child = this.box.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.box.remove(child);
            child = next;
        }

        const picture = Gtk.Picture.new_for_filename(path);
        picture.can_shrink = true;
        picture.content_fit = Gtk.ContentFit.COVER;
        picture.width_request = this.size;
        picture.height_request = this.size;
        this.box.append(picture);
    }

    append(childComponent) {
        this.children.push(childComponent);
        this.box.append(childComponent.widget);
    }
}
