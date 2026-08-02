imports.gi.versions.Gtk = '4.0';
const { Gtk, GLib, Pango } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.test.wrap2' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 200, default_height: 200 });
    
    const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
    
    const label = new Gtk.Label({ 
        label: 'Welcome to the comprehensive showcase of Alchemy. Use the sidebar to explore all native GTK4 components wrapped in a familiar.', 
        wrap: true,
        xalign: 0
    });
    box.append(label);
    
    win.set_child(box);
    win.present();
    
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
});
app.run([]);
