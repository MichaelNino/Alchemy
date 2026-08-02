import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { QRadio } from './QRadio.js';
import { effect } from '../reactivity.js';

export class QOptionGroup extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ 
            orientation: Gtk.Orientation.VERTICAL, 
            spacing: 4 
        }));

        this.hasError = false;
        this.rules = props.rules || [];
        
        // Inner container for the actual buttons
        this.container = new Gtk.Box({ 
            orientation: props.inline ? Gtk.Orientation.HORIZONTAL : Gtk.Orientation.VERTICAL, 
            spacing: props.inline ? 15 : 4 
        });
        
        this.errorLabel = new Gtk.Label({ xalign: 0 });
        this.errorLabel.visible = false;
        
        this.widget.append(this.container);
        this.widget.append(this.errorLabel);

        const options = props.options || [];
        
        let firstRadio = null;

        options.forEach(opt => {
            const radio = new QRadio({
                label: opt.label,
                val: opt.value,
                modelValue: props.modelValue
            });
            
            // GTK radio grouping logic requires passing the first radio's widget to others
            if (!firstRadio) {
                firstRadio = radio;
            } else {
                radio.widget.set_group(firstRadio.widget);
            }

            this.container.append(radio.widget);
            this.children.push(radio); // Track child for QForm (though validate is handled here)
        });

        // Validation logic
        this.validate = () => {
            if (!this.rules || this.rules.length === 0) return true;
            
            const currentValue = props.modelValue ? props.modelValue.value : null;
            
            for (let rule of this.rules) {
                const result = rule(currentValue);
                if (typeof result === 'string') {
                    this.hasError = true;
                    this.errorLabel.set_markup(`<span foreground="red" size="small">${result}</span>`);
                    this.errorLabel.visible = true;
                    return false;
                }
            }
            
            this.hasError = false;
            this.errorLabel.visible = false;
            return true;
        };

        // Re-validate when model changes
        if (props.modelValue && this.rules && this.rules.length > 0) {
            effect(() => {
                // Access value to track dependency
                const val = props.modelValue.value;
                if (this.hasError) {
                    this.validate();
                }
            });
        }
    }
}
