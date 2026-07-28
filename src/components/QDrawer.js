import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QDrawer extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Revealer({
            transition_type: Gtk.RevealerTransitionType.SLIDE_RIGHT,
            transition_duration: 300
        }));
        
        this.box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.box.add_css_class('background');
        this.box.width_request = 250;
        
        // Add a separator for visual distinction
        const separator = new Gtk.Separator({ orientation: Gtk.Orientation.VERTICAL });
        const container = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        container.append(this.box);
        container.append(separator);
        
        this.widget.set_child(container);
        
        if (props.modelValue) {
            this.widget.reveal_child = props.modelValue.value;
            
            effect(() => {
                this.widget.reveal_child = props.modelValue.value;
            });
        }
    }

    append(childComponent) {
        this.children.push(childComponent);
        this.box.append(childComponent.widget);
    }
}
