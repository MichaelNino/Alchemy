import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QToggle extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 }));
        
        this.switchWidget = new Gtk.Switch({ valign: Gtk.Align.CENTER });
        this.labelWidget = new Gtk.Label({ valign: Gtk.Align.CENTER });
        
        this.widget.append(this.switchWidget);
        this.widget.append(this.labelWidget);

        if (props.label !== undefined) {
            if (props.label.value !== undefined) {
                effect(() => {
                    this.labelWidget.label = props.label.value;
                });
            } else {
                this.labelWidget.label = props.label;
            }
        }

        if (props.modelValue !== undefined) {
            this.switchWidget.active = props.modelValue.value;
            
            this.switchWidget.connect('notify::active', () => {
                if (props.modelValue.value !== this.switchWidget.active) {
                    props.modelValue.value = this.switchWidget.active;
                }
            });
            
            effect(() => {
                if (this.switchWidget.active !== props.modelValue.value) {
                    this.switchWidget.active = props.modelValue.value;
                }
            });
        }
    }
}
