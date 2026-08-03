import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { QImage } from './QImage.js';

export class QAvatar extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL }));
        
        this.widget.add_css_class('avatar');
        this.widget.set_halign(Gtk.Align.CENTER);
        this.widget.set_valign(Gtk.Align.CENTER);
        
        this.size = props.size || 48;

        // Shape (circle or square)
        const shape = props.shape || 'circle';
        
        this.qImage = new QImage({
            size: this.size,
            shape: shape,
            image: props.image
        });
        
        this.widget.append(this.qImage.widget);

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
    }

    setImage(path) {
        this.qImage.setSrc(path);
    }
}
