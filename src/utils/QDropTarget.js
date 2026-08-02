import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GObject from 'gi://GObject';

/**
 * Attaches Drag-and-Drop target capabilities to any Alchemy component.
 */
export class QDropTarget {
    constructor(component, options = {}) {
        this.component = component;
        this.actions = options.actions !== undefined ? options.actions : Gdk.DragAction.COPY | Gdk.DragAction.MOVE;
        
        this.dropTarget = new Gtk.DropTarget({ actions: this.actions });
        
        // We accept string payloads by default
        this.dropTarget.set_gtypes([GObject.TYPE_STRING]);

        this.dropTarget.connect('drop', (target, value, x, y) => {
            if (options.onDrop) {
                // GTK passes value as GValue in some bindings, but GJS usually automatically unpacks primitive strings
                // We'll pass it directly to the callback
                let payload = value;
                try {
                    // Try to parse JSON in case the payload was an object stringified by QDragSource
                    payload = JSON.parse(value);
                } catch(e) {
                    // It's just a raw string, ignore
                }
                
                options.onDrop(payload, x, y);
            }
            return true;
        });
        
        if (options.onEnter) {
            this.dropTarget.connect('enter', options.onEnter);
        }
        if (options.onLeave) {
            this.dropTarget.connect('leave', options.onLeave);
        }

        // Attach controller to the GTK widget
        this.component.widget.add_controller(this.dropTarget);
    }
}
