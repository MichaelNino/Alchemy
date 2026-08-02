import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';
import { QBtn } from './QBtn.js';

export class QTransfer extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 15 }));
        
        this.options = props.options || [];
        this.modelValue = props.modelValue;

        // Left List (Source)
        const leftScroll = new Gtk.ScrolledWindow({
            min_content_width: 250,
            min_content_height: 300,
            has_frame: true,
            hexpand: true,
            vexpand: true
        });
        this.leftList = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.MULTIPLE
        });
        leftScroll.set_child(this.leftList);

        // Middle Controls
        const middleBox = new Gtk.Box({ 
            orientation: Gtk.Orientation.VERTICAL, 
            spacing: 10,
            valign: Gtk.Align.CENTER 
        });
        
        const btnRight = new QBtn({
            label: '>',
            onClick: () => this._moveRight()
        });
        
        const btnLeft = new QBtn({
            label: '<',
            onClick: () => this._moveLeft()
        });
        
        middleBox.append(btnRight.widget);
        middleBox.append(btnLeft.widget);
        
        // Track for cleanup
        this.children.push(btnRight);
        this.children.push(btnLeft);

        // Right List (Target)
        const rightScroll = new Gtk.ScrolledWindow({
            min_content_width: 250,
            min_content_height: 300,
            has_frame: true,
            hexpand: true,
            vexpand: true
        });
        this.rightList = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.MULTIPLE
        });
        rightScroll.set_child(this.rightList);

        this.widget.append(leftScroll);
        this.widget.append(middleBox);
        this.widget.append(rightScroll);

        effect(() => {
            const targetValues = this.modelValue.value || [];
            
            let child;
            while ((child = this.leftList.get_first_child()) != null) this.leftList.remove(child);
            while ((child = this.rightList.get_first_child()) != null) this.rightList.remove(child);
            
            // Build Source List
            this.options.filter(opt => !targetValues.includes(opt.value)).forEach(opt => {
                this.leftList.append(this._createRow(opt));
            });
            
            // Build Target List
            this.options.filter(opt => targetValues.includes(opt.value)).forEach(opt => {
                this.rightList.append(this._createRow(opt));
            });
        });
    }

    _createRow(opt) {
        const row = new Gtk.ListBoxRow();
        row._optValue = opt.value; // Store value on row for retrieval later
        
        const label = new Gtk.Label({ 
            label: opt.label, 
            xalign: 0, 
            margin_start: 15, 
            margin_end: 15, 
            margin_top: 10, 
            margin_bottom: 10 
        });
        
        row.set_child(label);
        return row;
    }

    _moveRight() {
        const rows = this.leftList.get_selected_rows();
        if (!rows || rows.length === 0) return;
        
        const toAdd = rows.map(row => row._optValue);
        
        const current = this.modelValue.value || [];
        this.modelValue.value = [...current, ...toAdd];
    }

    _moveLeft() {
        const rows = this.rightList.get_selected_rows();
        if (!rows || rows.length === 0) return;
        
        const toRemove = rows.map(row => row._optValue);
        
        const current = this.modelValue.value || [];
        this.modelValue.value = current.filter(val => !toRemove.includes(val));
    }
}
