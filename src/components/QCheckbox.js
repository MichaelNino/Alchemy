import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QCheckbox extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.CheckButton());
        
        if (props.label !== undefined) {
            if (props.label.value !== undefined) {
                this.bindProp('label', props.label);
            } else {
                this.widget.label = props.label;
            }
        }

        if (props.modelValue !== undefined) {
            this.widget.active = props.modelValue.value;
            
            this.on('toggled', () => {
                if (props.modelValue.value !== this.widget.active) {
                    props.modelValue.value = this.widget.active;
                }
            });
            
            effect(() => {
                if (this.widget.active !== props.modelValue.value) {
                    this.widget.active = props.modelValue.value;
                }
            });
        }
    }
}
