import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QTable extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Grid({ column_spacing: 20, row_spacing: 10 }));
        this.widget.margin_top = 10;
        this.widget.margin_start = 10;
        
        if (props.columns && props.rows) {
            effect(() => {
                let child = this.widget.get_first_child();
                while (child) {
                    let next = child.get_next_sibling();
                    this.widget.remove(child);
                    child = next;
                }
                
                const rows = props.rows.value !== undefined ? props.rows.value : props.rows;
                const columns = props.columns;
                
                columns.forEach((col, idx) => {
                    const label = new Gtk.Label({ label: `<b>${col.label}</b>`, use_markup: true, xalign: 0 });
                    this.widget.attach(label, idx, 0, 1, 1);
                });
                
                // Optional separator
                const sep = new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL });
                this.widget.attach(sep, 0, 1, columns.length, 1);
                
                rows.forEach((row, rowIdx) => {
                    columns.forEach((col, colIdx) => {
                        const cellVal = row[col.field];
                        const label = new Gtk.Label({ label: String(cellVal), xalign: 0 });
                        this.widget.attach(label, colIdx, rowIdx + 2, 1, 1);
                    });
                });
            });
        }
    }
}
