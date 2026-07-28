import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QCardSection extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 }));
        
        this.widget.margin_top = 16;
        this.widget.margin_bottom = 16;
        this.widget.margin_start = 16;
        this.widget.margin_end = 16;
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget);
    }
}
