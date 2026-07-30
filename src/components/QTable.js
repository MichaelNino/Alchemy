import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QTable extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 }));
        this.widget.margin_top = 10;
        this.widget.margin_start = 10;
        
        this.grid = new Gtk.Grid({ column_spacing: 20, row_spacing: 10 });
        this.widget.append(this.grid);

        this.paginationBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        this.paginationBox.set_halign(Gtk.Align.END);
        
        this.btnPrev = new Gtk.Button({ label: 'Previous' });
        this.btnNext = new Gtk.Button({ label: 'Next' });
        this.pageLabel = new Gtk.Label({ label: 'Page 1' });
        
        this.paginationBox.append(this.btnPrev);
        this.paginationBox.append(this.pageLabel);
        this.paginationBox.append(this.btnNext);
        
        this.widget.append(this.paginationBox);

        this.pagination = props.pagination || { page: 1, rowsPerPage: 5, sortBy: null, descending: false };
        const pagRef = this.pagination.value !== undefined ? this.pagination : { value: this.pagination };

        this.btnPrev.connect('clicked', () => {
            if (pagRef.value.page > 1) {
                pagRef.value = { ...pagRef.value, page: pagRef.value.page - 1 };
                this.renderGrid(props, pagRef);
            }
        });

        this.btnNext.connect('clicked', () => {
            const rows = props.rows.value !== undefined ? props.rows.value : props.rows;
            const maxPage = Math.ceil(rows.length / pagRef.value.rowsPerPage);
            if (pagRef.value.page < maxPage) {
                pagRef.value = { ...pagRef.value, page: pagRef.value.page + 1 };
                this.renderGrid(props, pagRef);
            }
        });

        if (props.columns && props.rows) {
            effect(() => {
                this.renderGrid(props, pagRef);
            });
        }
    }
    
    renderGrid(props, pagRef) {
        let child = this.grid.get_first_child();
        while (child) {
            let next = child.get_next_sibling();
            this.grid.remove(child);
            child = next;
        }
        
        let rows = props.rows.value !== undefined ? props.rows.value : props.rows;
        const columns = props.columns;
        const pagination = pagRef.value;
        
        if (pagination.sortBy) {
            rows = [...rows].sort((a, b) => {
                const valA = a[pagination.sortBy];
                const valB = b[pagination.sortBy];
                if (valA < valB) return pagination.descending ? 1 : -1;
                if (valA > valB) return pagination.descending ? -1 : 1;
                return 0;
            });
        }
        
        const maxPage = Math.ceil(rows.length / pagination.rowsPerPage) || 1;
        if (pagination.page > maxPage) pagination.page = maxPage;
        
        this.pageLabel.label = `Page ${pagination.page} of ${maxPage}`;
        this.btnPrev.sensitive = pagination.page > 1;
        this.btnNext.sensitive = pagination.page < maxPage;
        
        const startIdx = (pagination.page - 1) * pagination.rowsPerPage;
        const paginatedRows = rows.slice(startIdx, startIdx + pagination.rowsPerPage);
        
        columns.forEach((col, idx) => {
            const btn = new Gtk.Button({ label: col.label });
            btn.add_css_class('flat');
            
            if (pagination.sortBy === col.field) {
                btn.label = col.label + (pagination.descending ? ' ▼' : ' ▲');
            }
            
            btn.connect('clicked', () => {
                if (pagRef.value.sortBy === col.field) {
                    pagRef.value = { ...pagRef.value, descending: !pagRef.value.descending };
                } else {
                    pagRef.value = { ...pagRef.value, sortBy: col.field, descending: false };
                }
                this.renderGrid(props, pagRef);
            });
            this.grid.attach(btn, idx, 0, 1, 1);
        });
        
        const sep = new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL });
        this.grid.attach(sep, 0, 1, columns.length, 1);
        
        paginatedRows.forEach((row, rowIdx) => {
            columns.forEach((col, colIdx) => {
                const cellVal = row[col.field];
                const label = new Gtk.Label({ label: String(cellVal), xalign: 0 });
                label.margin_start = 10;
                this.grid.attach(label, colIdx, rowIdx + 2, 1, 1);
            });
        });
    }
}
