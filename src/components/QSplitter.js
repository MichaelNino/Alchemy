import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QSplitter extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Paned({ 
            orientation: props.horizontal ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL 
        }));
        
        this.widget.hexpand = true;
        this.widget.vexpand = true;
        
        // Quasar default initial split is usually 50%, but we can accept a ratio or position
        if (props.initialPosition) {
            this.widget.set_position(props.initialPosition);
        }
        
        this.widget.add_css_class('q-splitter');
    }
    
    setBefore(childComponent) {
        this.widget.set_start_child(childComponent.widget || childComponent);
    }
    
    setAfter(childComponent) {
        this.widget.set_end_child(childComponent.widget || childComponent);
    }
}
