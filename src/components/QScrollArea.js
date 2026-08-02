import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QScrollArea extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.ScrolledWindow());
        
        this.widget.add_css_class('q-scroll-area');
        this.widget.hexpand = true;
        this.widget.vexpand = true;
        
        // Hide scrollbars when not needed
        this.widget.set_policy(
            props.horizontal ? Gtk.PolicyType.AUTOMATIC : Gtk.PolicyType.NEVER,
            props.vertical !== false ? Gtk.PolicyType.AUTOMATIC : Gtk.PolicyType.NEVER
        );
        
        this.mainBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.set_child(this.mainBox);
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.mainBox.append(childComponent.widget || childComponent);
    }
}
