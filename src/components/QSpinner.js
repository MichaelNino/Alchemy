import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QSpinner extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Spinner());
        
        this.widget.start();
        
        if (props.size) {
            this.widget.width_request = props.size;
            this.widget.height_request = props.size;
        }

        if (props.spinning !== undefined) {
            effect(() => {
                const isSpinning = props.spinning.value !== undefined ? props.spinning.value : props.spinning;
                if (isSpinning) {
                    this.widget.start();
                    this.widget.set_visible(true);
                } else {
                    this.widget.stop();
                    this.widget.set_visible(false);
                }
            });
        }
    }
}
