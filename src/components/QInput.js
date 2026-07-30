import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QInput extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 }));
        
        this.entry = new Gtk.Entry();
        this.errorLabel = new Gtk.Label({ xalign: 0 });
        this.errorLabel.visible = false;
        
        this.widget.append(this.entry);
        this.widget.append(this.errorLabel);

        this.rules = props.rules || [];
        this.hasError = false;

        if (props.placeholder) {
            this.entry.placeholder_text = props.placeholder;
        }

        if (props.modelValue !== undefined) {
            this.entry.text = props.modelValue.value;
            
            this.entry.connect('changed', () => {
                if (props.modelValue.value !== this.entry.text) {
                    props.modelValue.value = this.entry.text;
                }
                this.validate();
            });
            
            effect(() => {
                if (this.entry.text !== props.modelValue.value) {
                    this.entry.text = props.modelValue.value;
                }
            });
        }
        
        this.validate = () => {
            if (!this.rules || this.rules.length === 0) return true;
            
            for (let rule of this.rules) {
                const result = rule(this.entry.text);
                if (typeof result === 'string') {
                    this.hasError = true;
                    this.entry.add_css_class('error');
                    this.errorLabel.set_markup(`<span foreground="red" size="small">${result}</span>`);
                    this.errorLabel.visible = true;
                    return false;
                }
            }
            
            this.hasError = false;
            this.entry.remove_css_class('error');
            this.errorLabel.visible = false;
            return true;
        };
    }
}
