imports.gi.versions.Gtk = '4.0';
const { Gtk, GLib } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.test.wrap3' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 200, default_height: 200 });
    
    const scrolled = new Gtk.ScrolledWindow();
    scrolled.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
    
    const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
    
    const label = new Gtk.Label({ 
        label: 'Welcome to the comprehensive showcase of Alchemy. Use the sidebar to explore all native GTK4 components wrapped in a familiar.', 
        wrap: true,
        xalign: 0
    });
    box.append(label);
    
    // Test if Viewport forces wrapping
    scrolled.set_child(box);
    
    win.set_child(scrolled);
    win.present();
    
    // Print the size of the label to see if it wrapped (height > single line height)
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        console.log("Label width:", label.get_width());
        console.log("Label height:", label.get_height());
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
});
app.run([]);
