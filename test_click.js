imports.gi.versions.Gtk = '4.0';
const { Gtk, Gdk, GLib } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.test.click' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 200, default_height: 200 });
    const box = new Gtk.Box();
    const label = new Gtk.Label({ label: 'Click me!' });
    box.append(label);
    
    const click = new Gtk.GestureClick();
    click.connect('pressed', (gesture, n_press, x, y) => {
        const event = gesture.get_current_event();
        const modifiers = event.get_modifier_state();
        const isCtrl = (modifiers & Gdk.ModifierType.CONTROL_MASK) !== 0;
        const isShift = (modifiers & Gdk.ModifierType.SHIFT_MASK) !== 0;
        print(`Clicked! Ctrl: ${isCtrl}, Shift: ${isShift}`);
        app.quit();
    });
    box.add_controller(click);
    win.set_child(box);
    
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
        // We can't fake a click easily, but syntax is correct
        print('Ready');
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
    win.present();
});
app.run([]);
