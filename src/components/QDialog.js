import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QDialog extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Window({
            modal: true,
            hide_on_close: true,
            default_width: 300,
            default_height: 200,
        }));
        
        this.box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.set_child(this.box);
        
        this.widget.connect('close-request', () => {
            if (props.modelValue) {
                props.modelValue.value = false;
            }
            return true; // prevent destruction
        });

        if (props.modelValue) {
            effect(() => {
                if (props.modelValue.value) {
                    this.widget.present();
                } else {
                    this.widget.set_visible(false);
                }
            });
        }
    }

    mount(parentWidget) {
        const root = parentWidget.get_root();
        if (root instanceof Gtk.Window) {
            this.widget.set_transient_for(root);
        }
        // We do NOT append to the parent widget since this is a top-level window.
    }

    append(childComponent) {
        this.children.push(childComponent);
        this.box.append(childComponent.widget);
    }
}
