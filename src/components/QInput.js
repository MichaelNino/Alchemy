import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QInput extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Entry());
        
        if (props.placeholder) {
            this.widget.placeholder_text = props.placeholder;
        }

        if (props.modelValue !== undefined) {
            // Initial value
            this.widget.text = props.modelValue.value;
            
            // Update ref on widget change
            this.on('changed', () => {
                if (props.modelValue.value !== this.widget.text) {
                    props.modelValue.value = this.widget.text;
                }
            });
            
            // Update widget on ref change
            effect(() => {
                if (this.widget.text !== props.modelValue.value) {
                    this.widget.text = props.modelValue.value;
                }
            });
        }
    }
}
