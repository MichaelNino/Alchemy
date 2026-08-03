import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QItem extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 }));
        
        this.widget.margin_top = 8;
        this.widget.margin_bottom = 8;
        this.widget.margin_start = 16;
        this.widget.margin_end = 16;

        if (props.icon || props.gicon) {
            const imgOpts = {};
            if (props.icon) imgOpts.icon_name = props.icon;
            if (props.gicon) imgOpts.gicon = props.gicon;
            const iconImg = new Gtk.Image(imgOpts);
            this.widget.append(iconImg);
        }
        
        // Quasar allows clicking on items. In GTK, if the item is in a ListBox, 
        // the ListBoxRow handles selection. We'll leave it as a Box for layout.
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget);
    }
}
