import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const app = new Gtk.Application({ application_id: 'org.alchemy.filetest' });

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, title: 'File Test' });
    
    try {
        if (Gtk.FileDialog) {
            console.log("Gtk.FileDialog is available.");
        }
    } catch (e) {
        console.log("Gtk.FileDialog NOT available.");
    }
    
    win.present();
    
    // Close immediately for test
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
        app.quit();
        return false;
    });
});

app.run([]);
