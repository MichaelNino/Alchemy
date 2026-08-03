import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk?version=4.0';

const app = new Gtk.Application({ application_id: 'org.alchemy.bgimagetest2' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'CSS BG Test 2', default_width: 200, default_height: 200 });
    
    const box = new Gtk.Box();
    box.width_request = 100;
    box.height_request = 100;
    box.halign = Gtk.Align.CENTER;
    box.valign = Gtk.Align.CENTER;
    
    const provider = new Gtk.CssProvider();
    const css = `
        .q-image {
            border-radius: 50px;
            background-color: blue;
            background-image: url('file:///usr/share/backgrounds/vale1ntin0omf-Electric_Veins_of_the_Storm.jpg');
            background-size: cover;
            background-position: center;
        }
    `;
    provider.load_from_data(css, css.length);
    box.add_css_class('q-image');
    box.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

    win.set_child(box);
    win.present();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
        app.quit();
        return false;
    });
});
app.run([]);
