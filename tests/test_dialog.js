import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import { QApp, QDialog, QForm, QInput, QSelect, QTagInput, QFile, QBtn, QLabel } from './src/index.js';
import { ref } from './src/reactivity.js';

const app = new QApp({
    applicationId: 'com.alchemy.test',
    onActivate: (win) => {
        try {
            const isDialogOpen = ref(true);
            const dialog = new QDialog({ modelValue: isDialogOpen });
            dialog.widget.set_title('Edit Task');
            
            const form = new QForm();
            form.append(new QInput({ label: 'Title', modelValue: ref('test') }));
            
            form.append(new QSelect({
                label: 'Status',
                options: [{label: 'To Do', value: 'todo'}],
                modelValue: ref('todo')
            }));
            
            form.append(new QLabel({ label: '<b>Tags</b>', useMarkup: true }));
            form.append(new QTagInput({ modelValue: ref([]), placeholder: 'Type tag and press Enter' }));
            
            form.append(new QLabel({ label: '<b>Attachments</b>', useMarkup: true, margin_top: 10 }));
            form.append(new QFile({ multiple: true, modelValue: ref([]), label: 'Select files...' }));
            
            dialog.append(form);
            dialog.mount(win);
            console.log("Dialog created successfully");
        } catch (e) {
            console.error("Error creating dialog:", e);
        }
    }
});

app.run([]);
