imports.gi.versions.Gtk = '4.0';
const { Gtk, GLib, GObject } = imports.gi;

const QLayout = GObject.registerClass(
class QLayout extends Gtk.Box {
    _init() {
        super._init({ orientation: Gtk.Orientation.HORIZONTAL });
    }
    vfunc_size_allocate(width, height, baseline) {
        super.vfunc_size_allocate(width, height, baseline);
        print(`Size: ${width}x${height}`);
    }
});

const app = new Gtk.Application({ application_id: 'org.test.drawer' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app });
    const layout = new QLayout();
    win.set_child(layout);
    win.present();
    
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
});
app.run([]);
