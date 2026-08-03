import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';
import { QTag } from './QTag.js';

export class QTagInput extends BaseComponent {
    constructor(props = {}) {
        const outerBox = new Gtk.Box({ 
            orientation: Gtk.Orientation.VERTICAL, 
            spacing: 5 
        });
        
        // Tags container
        const flowBox = new Gtk.FlowBox({
            selection_mode: Gtk.SelectionMode.NONE,
            max_children_per_line: 10,
            row_spacing: 5,
            column_spacing: 5
        });
        outerBox.append(flowBox);
        
        // Input entry
        const entry = new Gtk.Entry({
            placeholder_text: props.placeholder || 'Type and press Enter to add tags...'
        });
        outerBox.append(entry);
        
        super(outerBox);
        
        this.modelValue = props.modelValue;
        
        entry.connect('activate', () => {
            const text = entry.get_text().trim();
            if (text && this.modelValue) {
                const currentTags = this.modelValue.value || [];
                if (!currentTags.includes(text)) {
                    this.modelValue.value = [...currentTags, text];
                }
                entry.set_text('');
            }
        });
        
        if (this.modelValue) {
            effect(() => {
                // Clear existing tags
                let child = flowBox.get_first_child();
                while (child) {
                    const next = child.get_next_sibling();
                    flowBox.remove(child);
                    child = next;
                }
                
                const tags = this.modelValue.value || [];
                
                tags.forEach(tagText => {
                    const tag = new QTag({
                        label: tagText,
                        removable: true,
                        onRemove: (t) => {
                            if (this.modelValue) {
                                this.modelValue.value = this.modelValue.value.filter(item => item !== t);
                            }
                        }
                    });
                    flowBox.append(tag.widget);
                });
            });
        }
    }
}
