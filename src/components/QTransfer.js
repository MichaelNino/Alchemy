import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect, ref } from '../reactivity.js';
import { QBtn } from './QBtn.js';

export class QTransfer extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 15 }));
        
        this.options = props.options || [];
        this.modelValue = props.modelValue;

        this.sourceSelection = ref([]);
        this.targetSelection = ref([]);

        // Left List (Source)
        const leftScroll = new Gtk.ScrolledWindow({
            min_content_width: 250,
            min_content_height: 300,
            has_frame: true,
            hexpand: true,
            vexpand: true
        });
        const leftList = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE
        });
        leftScroll.set_child(leftList);

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
        const rightList = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE
        });
        rightScroll.set_child(rightList);

        this.widget.append(leftScroll);
        this.widget.append(middleBox);
        this.widget.append(rightScroll);

        effect(() => {
            const targetValues = this.modelValue.value || [];
            
            let child;
            while ((child = leftList.get_first_child()) != null) leftList.remove(child);
            while ((child = rightList.get_first_child()) != null) rightList.remove(child);
            
            // Build Source List
            this.options.filter(opt => !targetValues.includes(opt.value)).forEach(opt => {
                leftList.append(this._createRow(opt, this.sourceSelection));
            });
            
            // Build Target List
            this.options.filter(opt => targetValues.includes(opt.value)).forEach(opt => {
                rightList.append(this._createRow(opt, this.targetSelection));
            });
        });
    }

    _createRow(opt, selectionRef) {
        const row = new Gtk.ListBoxRow();
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10, margin_start: 8, margin_end: 8, margin_top: 8, margin_bottom: 8 });
        
        const check = new Gtk.CheckButton({ label: opt.label });
        
        check.active = selectionRef.value.includes(opt.value);
        
        check.connect('toggled', () => {
            if (check.active) {
                if (!selectionRef.value.includes(opt.value)) {
                    selectionRef.value = [...selectionRef.value, opt.value];
                }
            } else {
                selectionRef.value = selectionRef.value.filter(v => v !== opt.value);
            }
        });
        
        box.append(check);
        row.set_child(box);
        return row;
    }

    _moveRight() {
        if (this.sourceSelection.value.length === 0) return;
        
        const current = this.modelValue.value || [];
        this.modelValue.value = [...current, ...this.sourceSelection.value];
        this.sourceSelection.value = [];
    }

    _moveLeft() {
        if (this.targetSelection.value.length === 0) return;
        
        const current = this.modelValue.value || [];
        const toRemove = this.targetSelection.value;
        this.modelValue.value = current.filter(val => !toRemove.includes(val));
        this.targetSelection.value = [];
    }
}
