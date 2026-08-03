import Gtk from 'gi://Gtk?version=4.0';

const provider = new Gtk.CssProvider();
provider.load_from_string('* { background-color: red; border-radius: 50%; min-width: 8px; min-height: 8px; }');
console.log("Valid CSS for dot");
