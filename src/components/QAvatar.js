import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QAvatar extends BaseComponent {
    constructor(props = {}) {
        // Use Box as the main widget so we can easily clip its contents
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL }));
        
        this.widget.add_css_class('avatar');
        this.widget.set_halign(Gtk.Align.CENTER);
        this.widget.set_valign(Gtk.Align.CENTER);
        
        // Ensure clipping happens so circular/square shape is enforced on the image
        this.widget.overflow = Gtk.Overflow.HIDDEN;
        
        this.size = props.size || 48;
        this.widget.width_request = this.size;
        this.widget.height_request = this.size;

        // Shape (circle or square)
        const shape = props.shape || 'circle';
        this._applyShapeCSS(shape, this.size);

        // Editable (click to open QFileDialog) unless readonly is true
        if (!props.readonly) {
            this.widget.add_css_class('clickable'); // Cursor pointer if supported
            const click = new Gtk.GestureClick();
            click.connect('pressed', () => {
                const GLib = imports.gi.GLib;
                
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

        // Image loading
        if (props.image) {
            this.setImage(props.image);
        }
    }

    _applyShapeCSS(shape, size) {
        const provider = new Gtk.CssProvider();
        let css = '';
        if (shape === 'circle') {
            css = `.avatar { border-radius: ${Math.max(size, 100)}px; }`;
        } else {
            css = `.avatar { border-radius: 8px; }`;
        }
        provider.load_from_data(css, css.length);
        this.widget.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    }

    setImage(path) {
        // Clear existing children
        let child = this.widget.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.widget.remove(child);
            child = next;
        }

        const picture = Gtk.Picture.new_for_filename(path);
        picture.can_shrink = true;
        picture.content_fit = Gtk.ContentFit.COVER;
        picture.width_request = this.size;
        picture.height_request = this.size;
        
        // Ensure picture itself is un-focusable so clicks pass through, though GtkPicture doesn't take focus anyway
        
        this.widget.append(picture);
    }

    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget);
    }
}
