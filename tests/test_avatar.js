import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import { QAvatar } from './src/components/QAvatar.js';
import { QIcon } from './src/components/QIcon.js';

const app = new Gtk.Application({ application_id: 'org.alchemy.qavatartest' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'QAvatar Test', default_width: 200, default_height: 200 });
    
    const box = new Gtk.Box({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
    
    const avatar = new QAvatar({ size: 80 });
    avatar.append(new QIcon({ name: 'applications-engineering-symbolic', size: 48 }));
    box.append(avatar.widget);
    
    win.set_child(box);
    win.present();

    // After 1 second, dynamically set the image just like the file dialog would
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        console.log("Setting avatar image...");
        avatar.setImage('/usr/share/backgrounds/vale1ntin0omf-Electric_Veins_of_the_Storm.jpg');
        return false;
    });

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
        app.quit();
        return false;
    });
});
app.run([]);
