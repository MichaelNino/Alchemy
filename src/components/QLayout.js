import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QLayout extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 }));
        
        // Apply padding
        this.widget.margin_top = 10;
        this.widget.margin_bottom = 10;
        this.widget.margin_start = 10;
        this.widget.margin_end = 10;
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget);
    }
}
