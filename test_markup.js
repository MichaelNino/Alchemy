import Gtk from 'gi://Gtk?version=4.0';

const app = new Gtk.Application({ application_id: 'org.alchemy.Test' });
app.connect('activate', () => {
    const buffer = new Gtk.TextBuffer();
    try {
        const iter = buffer.get_start_iter();
        buffer.insert_markup(iter, "<b>Bold</b> and <i>Italic</i>", -1);
        console.log("insert_markup worked! Text is:", buffer.get_text(buffer.get_start_iter(), buffer.get_end_iter(), false));
        
        // Let's check the tags applied by insert_markup
        let testIter = buffer.get_start_iter();
        testIter.forward_char();
        console.log("Tags on first char:", testIter.get_tags().map(t => t.name));
    } catch (e) {
        console.error("insert_markup failed:", e);
    }
    process.exit(0);
});
app.run([]);
