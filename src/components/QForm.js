import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QForm extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 }));
        
        if (props.onSubmit) {
            this.onSubmit = props.onSubmit;
        }
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget);
    }
    
    validate() {
        let isValid = true;
        
        const checkValidation = (components) => {
            for (const comp of components) {
                if (typeof comp.validate === 'function') {
                    const result = comp.validate();
                    if (!result) isValid = false;
                }
                if (comp.children && comp.children.length > 0) {
                    checkValidation(comp.children);
                }
            }
        };
        
        checkValidation(this.children);
        return isValid;
    }
    
    submit() {
        if (this.validate()) {
            if (this.onSubmit) {
                this.onSubmit();
            }
        }
    }
}
