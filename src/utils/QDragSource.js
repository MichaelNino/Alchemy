import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GObject from 'gi://GObject';

/**
 * Attaches Drag-and-Drop source capabilities to any Alchemy component.
 */
export class QDragSource {
    constructor(component, options = {}) {
        this.component = component;
        this.payload = options.payload !== undefined ? options.payload : '';
        this.actions = options.actions !== undefined ? options.actions : Gdk.DragAction.COPY | Gdk.DragAction.MOVE;

        this.dragSource = new Gtk.DragSource({ actions: this.actions });
        
        this.dragSource.connect('prepare', (source, x, y) => {
            const val = new GObject.Value();
            val.init(GObject.TYPE_STRING);
            
            // Resolve reactive refs if present
            const finalPayload = this.payload.value !== undefined ? this.payload.value : this.payload;
            // Stringify objects if necessary
            const strPayload = typeof finalPayload === 'string' ? finalPayload : JSON.stringify(finalPayload);
            
            val.set_string(strPayload);
            return Gdk.ContentProvider.new_for_value(val);
        });
        
        if (options.onDragStart) {
            this.dragSource.connect('drag-begin', options.onDragStart);
        }
        
        if (options.onDragEnd) {
            this.dragSource.connect('drag-end', options.onDragEnd);
        }

        // Attach controller to the GTK widget
        this.component.widget.add_controller(this.dragSource);
    }
}
