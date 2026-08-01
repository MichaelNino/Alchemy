import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QBtn extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Button());
        
        if (props.label !== undefined) {
            if (props.label.value !== undefined) {
                // It's a ref
                this.bindProp('label', props.label);
            } else {
                this.widget.label = props.label;
            }
        }
        
        if (props.icon !== undefined) {
            if (props.icon.value !== undefined) {
                this.bindProp('icon_name', props.icon);
            } else {
                this.widget.icon_name = props.icon;
            }
        }
        
        if (props.onClick) {
            this.on('clicked', props.onClick);
        }
    }
}
