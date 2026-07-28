import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QList extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE
        }));
        
        this.widget.margin_top = 4;
        this.widget.margin_bottom = 4;
    }

    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget);
    }
}
