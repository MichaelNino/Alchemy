import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';

const app = new Gtk.Application({ application_id: 'org.alchemy.bgimagetest' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'CSS BG Test', default_width: 200, default_height: 200 });
    
    const box = new Gtk.Box();
    box.width_request = 100;
    box.height_request = 100;
    box.halign = Gtk.Align.CENTER;
    box.valign = Gtk.Align.CENTER;
    
    // We don't have an image, let's just make sure it doesn't crash and parse errors aren't thrown
    const provider = new Gtk.CssProvider();
    const css = `
        .q-image {
            border-radius: 50px;
            background-color: blue;
            background-image: url('file:///nonexistent/image.png');
            background-size: cover;
            background-position: center;
        }
    `;
    provider.load_from_data(css, -1);
    box.add_css_class('q-image');
    box.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

    win.set_child(box);
    win.present();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
        app.quit();
        return false;
    });
});
app.run([]);
