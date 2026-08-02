imports.gi.versions.Gtk = '4.0';
const { Gtk, GLib, Gio } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.test.listboxclick' });
app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({ application: app, default_width: 400, default_height: 400 });
    const list = new Gtk.ListBox({ selection_mode: Gtk.SelectionMode.MULTIPLE });
    
    for(let i=0; i<3; i++) {
        const row = new Gtk.ListBoxRow();
        row.set_child(new Gtk.Label({ label: 'Item ' + i }));
        list.append(row);
    }
    win.set_child(list);
    
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
        // Select row 0 manually
        list.select_row(list.get_row_at_index(0));
        print("After manual select row 0:", list.get_selected_rows().map(r => r.get_index()));
        
        // Let's emit a click? No, we can just call the activate signal or we can't easily fake a mouse click in GTK4 without Atspi or specific tools.
        // Actually, we can check how GTK ListBox behaves in source code.
        app.quit();
        return GLib.SOURCE_REMOVE;
    });
    
    win.present();
});
app.run([]);
