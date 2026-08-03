import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import { QFileDialog } from './src/components/QFileDialog.js';

const app = new Gtk.Application({ application_id: 'org.alchemy.navtest' });

app.connect('activate', () => {
    const dialog = new QFileDialog({
        title: 'Test',
        allowedLocations: [
            { name: 'Home', path: '/home/michael/' }
        ]
    });
    
    console.log("Root:", dialog.currentRoot.path);
    console.log("Current (Initial):", dialog.currentPath);
    
    // Navigate into Pictures
    dialog._loadDirectory('/home/michael//Pictures');
    console.log("Current (After Nav In):", dialog.currentPath);
    console.log("Up button sensitive:", dialog.upBtn.sensitive);
    
    // Navigate Up
    dialog._navigateUp();
    console.log("Current (After Nav Up):", dialog.currentPath);
    console.log("Up button sensitive:", dialog.upBtn.sensitive);
    
    app.quit();
});

app.run([]);
