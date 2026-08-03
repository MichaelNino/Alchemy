import Gtk from 'gi://Gtk?version=4.0';
const drawingArea = new Gtk.DrawingArea();
drawingArea.set_draw_func((area, cr) => {
    let methods = [];
    for (let k in cr) {
        if (typeof cr[k] === 'function') methods.push(k);
    }
    console.log("CR METHODS:", methods.join(', '));
});
const win = new Gtk.Window();
win.set_child(drawingArea);
win.show();
const app = new Gtk.Application({ application_id: 'org.test.cairo' });
app.connect('activate', () => {
    app.add_window(win);
    setTimeout(() => app.quit(), 100);
});
app.run([]);
