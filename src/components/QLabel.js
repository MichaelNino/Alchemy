import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QLabel extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Label({ 
            xalign: 0, 
            use_markup: props.useMarkup || false,
            wrap: props.wrap !== false
        }));
        if (props.label !== undefined) {
            if (props.label.value !== undefined) {
                effect(() => {
                    const text = String(props.label.value);
                    if (props.useMarkup) {
                        this.widget.set_markup(text);
                    } else {
                        this.widget.label = text;
                    }
                });
            } else {
                if (props.useMarkup) {
                    this.widget.set_markup(String(props.label));
                } else {
                    this.widget.label = String(props.label);
                }
            }
        }
    }
}
