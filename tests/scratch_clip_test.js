import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';

const app = new Gtk.Application({ application_id: 'org.alchemy.cliptest' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'Clip Test', default_width: 200, default_height: 200 });
    
    // Test Box with overflow hidden
    const box = new Gtk.Box();
    box.width_request = 100;
    box.height_request = 100;
    box.overflow = Gtk.Overflow.HIDDEN;
    box.halign = Gtk.Align.CENTER;
    box.valign = Gtk.Align.CENTER;

    const provider = new Gtk.CssProvider();
    provider.load_from_data('.avatar { border-radius: 100px; }', -1);
    box.add_css_class('avatar');
    box.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

    // Inner pic
    const pic = new Gtk.Box();
    pic.width_request = 100;
    pic.height_request = 100;
    const picProv = new Gtk.CssProvider();
    picProv.load_from_data('.pic { background-color: red; }', -1);
    pic.add_css_class('pic');
    pic.get_style_context().add_provider(picProv, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

    box.append(pic);
    win.set_child(box);
    win.present();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
        app.quit();
        return false;
    });
});
app.run([]);
