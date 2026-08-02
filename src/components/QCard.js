import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QCard extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Frame());
        
        this.box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.set_child(this.box);
        
        this.widget.margin_top = 10;
        this.widget.margin_bottom = 10;
        this.widget.margin_start = 10;
        this.widget.margin_end = 10;
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.box.append(childComponent.widget || childComponent);
    }
}
