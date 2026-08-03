import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { QFileDialog } from './src/components/QFileDialog.js';

const app = new Gtk.Application({ application_id: 'org.alchemy.filedialogtest' });

app.connect('activate', () => {
    const dialog = new QFileDialog({
        title: 'Test',
        allowedLocations: [
            { name: 'Home', path: GLib.get_home_dir() }
        ],
        filters: ['*']
    });
    dialog.show();
});

app.run([]);
