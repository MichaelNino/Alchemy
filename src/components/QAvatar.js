import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QAvatar extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Frame());
        
        this.widget.add_css_class('avatar');
        
        this.box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        this.box.set_halign(Gtk.Align.CENTER);
        this.box.set_valign(Gtk.Align.CENTER);
        this.widget.set_child(this.box);
        
        if (props.size) {
            this.widget.width_request = props.size;
            this.widget.height_request = props.size;
        }
    }

    append(childComponent) {
        this.children.push(childComponent);
        this.box.append(childComponent.widget);
    }
}
