imports.gi.versions.Gtk = '4.0';
const { Gtk, Gdk, GLib } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.test.state' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 200, default_height: 200 });
    const list = new Gtk.ListBox();
    
    const row = new Gtk.ListBoxRow();
    row.set_child(new Gtk.Label({ label: 'Selected Row' }));
    
    // Attempt to set state
    row.set_state_flags(Gtk.StateFlags.SELECTED, false);
    
    list.append(row);
    win.set_child(list);
    win.present();
    
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
});
app.run([]);
