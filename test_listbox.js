imports.gi.versions.Gtk = '4.0';
const { Gtk, GLib, Gio } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.test.listbox' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 400, default_height: 400 });
    const list = new Gtk.ListBox({ selection_mode: Gtk.SelectionMode.MULTIPLE });
    
    for(let i=0; i<10; i++) {
        const row = new Gtk.ListBoxRow();
        row.set_child(new Gtk.Label({ label: 'Item ' + i, margin_top: 10, margin_bottom: 10 }));
        list.append(row);
    }
    
    win.set_child(list);
    win.present();
});
app.run([]);
