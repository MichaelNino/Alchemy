import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QProgressBar extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.ProgressBar());
        
        if (props.value !== undefined) {
            effect(() => {
                let val = props.value.value !== undefined ? props.value.value : props.value;
                this.widget.fraction = Math.min(Math.max(val, 0.0), 1.0);
            });
        }
    }
}
