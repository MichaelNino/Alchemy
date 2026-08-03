import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import Gsk from 'gi://Gsk?version=4.0';
import Graphene from 'gi://Graphene';
import GLib from 'gi://GLib';

const CircularImage = GObject.registerClass(
class CircularImage extends Gtk.Widget {
    _init(props = {}) {
        super._init(props);
        this._texture = null;
        this.radius = 0;
    }

    setTexture(path) {
        try {
            this._texture = Gdk.Texture.new_from_filename(path);
            this.queue_draw();
        } catch (e) {
            console.error(e);
        }
    }

    vfunc_measure(orientation, for_size) {
        return [80, 80, -1, -1];
    }

    vfunc_snapshot(snapshot) {
        if (!this._texture) return;

        const w = this.get_width();
        const h = this.get_height();
        
        const bounds = new Graphene.Rect();
        bounds.init(0, 0, w, h);
        
        // Circular radius is half the size
        this.radius = Math.min(w, h) / 2;

        const rounded = new Gsk.RoundedRect();
        rounded.init_from_rect(bounds, this.radius);

        snapshot.push_rounded_clip(rounded);
        snapshot.append_texture(this._texture, bounds);
        snapshot.pop();
    }
});

const app = new Gtk.Application({ application_id: 'org.alchemy.cliptest' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'Clip Test', default_width: 200, default_height: 200 });
    
    const img = new CircularImage();
    img.setTexture('/usr/share/backgrounds/vale1ntin0omf-Electric_Veins_of_the_Storm.jpg');
    
    img.set_halign(Gtk.Align.CENTER);
    img.set_valign(Gtk.Align.CENTER);
    img.set_size_request(100, 100);

    win.set_child(img);
    win.present();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
        app.quit();
        return false;
    });
});
app.run([]);
