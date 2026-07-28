import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QSlider extends BaseComponent {
    constructor(props = {}) {
        const min = props.min !== undefined ? props.min : 0;
        const max = props.max !== undefined ? props.max : 100;
        const step = props.step !== undefined ? props.step : 1;
        
        super(Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, min, max, step));
        
        this.widget.set_draw_value(true);
        this.widget.hexpand = true;

        if (props.modelValue !== undefined) {
            this.widget.set_value(props.modelValue.value);
            
            this.widget.connect('value-changed', () => {
                if (props.modelValue.value !== this.widget.get_value()) {
                    props.modelValue.value = this.widget.get_value();
                }
            });
            
            effect(() => {
                if (this.widget.get_value() !== props.modelValue.value) {
                    this.widget.set_value(props.modelValue.value);
                }
            });
        }
    }
}
