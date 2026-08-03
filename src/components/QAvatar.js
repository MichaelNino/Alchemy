import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { QImage } from './QImage.js';

export class QAvatar extends BaseComponent {
    constructor(props = {}) {
        // Use Overlay so fallback icons and the image can stack correctly
        super(new Gtk.Overlay());
        
        this.widget.add_css_class('avatar');
        this.widget.set_halign(Gtk.Align.CENTER);
        this.widget.set_valign(Gtk.Align.CENTER);
        
        this.size = props.size || 48;
        const shape = props.shape || 'circle';
        
        // The QImage is the main background child
        this.qImage = new QImage({
            size: this.size,
            shape: shape,
            image: props.image
        });
        this.widget.set_child(this.qImage.widget);
        
        this._overlays = [];

        // Editable (click to open QFileDialog) unless readonly is true
        if (!props.readonly) {
            this.widget.add_css_class('clickable');
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
        // Hide fallback icons (overlays) when an image is loaded
        for (const overlay of this._overlays) {
            overlay.widget.set_visible(false);
        }
        this.qImage.setSrc(path);
    }

    append(childComponent) {
        this.children.push(childComponent);
        this._overlays.push(childComponent);
        
        // Overlays usually expand to fill, but we center them
        childComponent.widget.set_halign(Gtk.Align.CENTER);
        childComponent.widget.set_valign(Gtk.Align.CENTER);
        
        this.widget.add_overlay(childComponent.widget);
    }
}
