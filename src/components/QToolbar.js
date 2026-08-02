import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QToolbar extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.HeaderBar());
        
        if (props.title) {
            const titleLabel = new Gtk.Label({ 
                label: `<b>${props.title}</b>`, 
                use_markup: true 
            });
            this.widget.set_title_widget(titleLabel);
        }
        
        this.widget.hexpand = true;
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.pack_end(childComponent.widget);
    }
    
    prepend(childComponent) {
        this.children.push(childComponent);
        this.widget.pack_start(childComponent.widget);
    }
}
