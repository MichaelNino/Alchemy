import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';

const app = new Gtk.Application({ application_id: 'org.alchemy.avatartest2' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'Avatar Test', default_width: 200, default_height: 200 });
    
    const frame = new Gtk.Frame();
    
    const click = new Gtk.GestureClick();
    click.connect('pressed', () => {
        console.log("CLICKED!");
    });
    frame.add_controller(click);

    const pic = new Gtk.Box();
    pic.width_request = 100;
    pic.height_request = 100;
    const provider = new Gtk.CssProvider();
    provider.load_from_data('.pic { background-color: blue; }', -1);
    pic.add_css_class('pic');
    pic.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

    frame.set_child(pic);
    win.set_child(frame);
    
    win.present();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
        app.quit();
        return false;
    });
});
app.run([]);
