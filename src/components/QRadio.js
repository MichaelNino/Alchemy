import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QRadio extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.CheckButton());
        
        if (props.label !== undefined) {
            if (props.label.value !== undefined) {
                this.bindProp('label', props.label);
            } else {
                this.widget.label = props.label;
            }
        }
        
        if (props.group) {
            this.widget.set_group(props.group.widget);
        }

        if (props.modelValue !== undefined && props.val !== undefined) {
            this.widget.active = (props.modelValue.value === props.val);
            
            this.on('toggled', () => {
                if (this.widget.active && props.modelValue.value !== props.val) {
                    props.modelValue.value = props.val;
                }
            });
            
            effect(() => {
                const shouldBeActive = (props.modelValue.value === props.val);
                if (this.widget.active !== shouldBeActive) {
                    this.widget.active = shouldBeActive;
                }
            });
        }
    }
}
