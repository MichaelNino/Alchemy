import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';

export const QNotify = {
    create(message) {
        const win = new Gtk.Window({
            decorated: false,
            focusable: false,
            modal: false
        });
        
        const label = new Gtk.Label({ 
            label: message, 
            margin_top: 15, 
            margin_bottom: 15, 
            margin_start: 25, 
            margin_end: 25 
        });
        
        const frame = new Gtk.Frame();
        frame.set_child(label);
        
        // Make it look like a toast
        frame.add_css_class('app-notification');
        
        win.set_child(frame);
        win.present();
        
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2500, () => {
            win.close();
            return GLib.SOURCE_REMOVE;
        });
    }
};
