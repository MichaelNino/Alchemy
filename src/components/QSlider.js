import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QSlider extends BaseComponent {
    constructor(props = {}) {
        const getVal = (val, def) => (val !== undefined ? (val.value !== undefined ? val.value : val) : def);
        const initialMin = getVal(props.min, 0);
        let initialMax = getVal(props.max, 100);
        const initialStep = getVal(props.step, 1);
        
        // Ensure max is strictly greater than min for Gtk.Scale.new_with_range
        if (initialMax <= initialMin) {
            initialMax = initialMin + 1;
        }
        
        super(Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, initialMin, initialMax, initialStep));
        
        // Make them reactive if they are refs/computeds
        if (props.min && props.min.value !== undefined) effect(() => { this.widget.get_adjustment().set_lower(props.min.value); });
        if (props.max && props.max.value !== undefined) effect(() => { 
            let maxVal = props.max.value;
            let minVal = this.widget.get_adjustment().get_lower();
            if (maxVal <= minVal) maxVal = minVal + 1;
            this.widget.get_adjustment().set_upper(maxVal); 
        });
        if (props.step && props.step.value !== undefined) effect(() => { this.widget.get_adjustment().set_step_increment(props.step.value); });
        
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
