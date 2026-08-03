import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import { QImage } from './src/components/QImage.js';

const app = new Gtk.Application({ application_id: 'org.alchemy.qimagetest' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'QImage Test', default_width: 200, default_height: 200 });
    
    const img = new QImage({ shape: 'circle', size: 100 });
    // initially no image
    
    win.set_child(img.widget);
    win.present();

    // After 1 second, dynamically set the image
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        console.log("Setting image...");
        img.setSrc('/usr/share/backgrounds/vale1ntin0omf-Electric_Veins_of_the_Storm.jpg');
        return false;
    });

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
        app.quit();
        return false;
    });
});
app.run([]);
