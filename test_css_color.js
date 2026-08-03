import Gtk from 'gi://Gtk?version=4.0';

const provider = new Gtk.CssProvider();
provider.load_from_string('.test { background-color: white; color: black; }');
console.log("load_from_string worked with color");
