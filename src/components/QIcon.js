import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QIcon extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Image());
        
        if (props.name) {
            if (props.name.value !== undefined) {
                effect(() => {
                    this.widget.set_from_icon_name(String(props.name.value));
                });
            } else {
                this.widget.set_from_icon_name(String(props.name));
            }
        }
        
        if (props.size) {
            this.widget.pixel_size = props.size;
        }
    }
}
