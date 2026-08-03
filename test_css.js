import Gtk from 'gi://Gtk?version=4.0';

const provider = new Gtk.CssProvider();
try {
    if (provider.load_from_string) {
        provider.load_from_string('.test { background-color: white; }');
        console.log("load_from_string worked");
    } else {
        provider.load_from_data('.test { background-color: white; }', -1);
        console.log("load_from_data worked");
    }
} catch (e) {
    console.error(e);
}
