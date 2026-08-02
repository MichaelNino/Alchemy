imports.gi.versions.Gtk = '4.0';
const { Gtk, GLib } = imports.gi;
const app = new Gtk.Application({ application_id: 'org.test.tracker' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 300, default_height: 200 });
    const overlay = new Gtk.Overlay();
    const tracker = new Gtk.DrawingArea();
    tracker.set_draw_func((area, cr, w, h) => {
        print(`Tracker Size: ${w}x${h}`);
    });
    overlay.set_child(new Gtk.Label({ label: 'Main Content' }));
    overlay.add_overlay(tracker);
    win.set_child(overlay);
    win.present();
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
});
app.run([]);
