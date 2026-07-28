import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QSelect extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.DropDown());
        
        if (props.options) {
            const model = Gtk.StringList.new(props.options);
            this.widget.set_model(model);
        }
        
        if (props.modelValue !== undefined) {
            if (props.options) {
                const idx = props.options.indexOf(props.modelValue.value);
                if (idx >= 0) {
                    this.widget.selected = idx;
                }
            }
            
            this.widget.connect('notify::selected-item', () => {
                const item = this.widget.get_selected_item();
                if (item) {
                    props.modelValue.value = item.get_string();
                }
            });
            
            effect(() => {
                if (props.options) {
                    const idx = props.options.indexOf(props.modelValue.value);
                    if (idx >= 0 && this.widget.selected !== idx) {
                        this.widget.selected = idx;
                    }
                }
            });
        }
    }
}
