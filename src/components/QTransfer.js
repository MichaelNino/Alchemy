import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
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
        this.sourceLastIndex = null;
        this.targetLastIndex = null;

        // Left List (Source)
        const leftScroll = new Gtk.ScrolledWindow({
            min_content_width: 100,
            min_content_height: 300,
            has_frame: true,
            hexpand: true,
            vexpand: true
        });
        this.leftList = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE
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
            min_content_width: 100,
            min_content_height: 300,
            has_frame: true,
            hexpand: true,
            vexpand: true
        });
        this.rightList = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE
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
            const sourceOptions = this.options.filter(opt => !targetValues.includes(opt.value));
            sourceOptions.forEach((opt, index) => {
                this.leftList.append(this._createRow(opt, index, sourceOptions, this.sourceSelection, 'source'));
            });
            
            // Build Target List
            const targetOptions = this.options.filter(opt => targetValues.includes(opt.value));
            targetOptions.forEach((opt, index) => {
                this.rightList.append(this._createRow(opt, index, targetOptions, this.targetSelection, 'target'));
            });
        });
    }

    _createRow(opt, index, optionsList, selectionRef, side) {
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

        // Reactively update styling
        effect(() => {
            if (selectionRef.value.includes(opt.value)) {
                row.set_state_flags(Gtk.StateFlags.SELECTED, false);
            } else {
                row.unset_state_flags(Gtk.StateFlags.SELECTED);
            }
        });

        // Custom Click Selection Logic
        const click = new Gtk.GestureClick();
        click.connect('pressed', (gesture) => {
            const event = gesture.get_current_event();
            let isCtrl = false;
            let isShift = false;
            
            if (event) {
                const modifiers = event.get_modifier_state();
                isCtrl = (modifiers & Gdk.ModifierType.CONTROL_MASK) !== 0;
                isShift = (modifiers & Gdk.ModifierType.SHIFT_MASK) !== 0;
            }

            let currentSel = [...selectionRef.value];

            if (isShift) {
                // Range selection
                let lastIndex = side === 'source' ? this.sourceLastIndex : this.targetLastIndex;
                if (lastIndex === null) lastIndex = index;
                
                const start = Math.min(lastIndex, index);
                const end = Math.max(lastIndex, index);
                
                if (!isCtrl) {
                    currentSel = [];
                }
                
                for (let i = start; i <= end; i++) {
                    const val = optionsList[i].value;
                    if (!currentSel.includes(val)) currentSel.push(val);
                }
            } else if (isCtrl) {
                // Toggle non-contiguous
                if (currentSel.includes(opt.value)) {
                    currentSel = currentSel.filter(v => v !== opt.value);
                } else {
                    currentSel.push(opt.value);
                }
                if (side === 'source') this.sourceLastIndex = index;
                else this.targetLastIndex = index;
            } else {
                // Normal click: clear selection, select this item
                currentSel = [opt.value];
                if (side === 'source') this.sourceLastIndex = index;
                else this.targetLastIndex = index;
            }
            
            selectionRef.value = currentSel;
        });
        
        row.add_controller(click);

        return row;
    }

    _moveRight() {
        if (this.sourceSelection.value.length === 0) return;
        
        const toAdd = this.sourceSelection.value;
        const current = this.modelValue.value || [];
        this.modelValue.value = [...current, ...toAdd];
        this.sourceSelection.value = [];
        this.sourceLastIndex = null;
    }

    _moveLeft() {
        if (this.targetSelection.value.length === 0) return;
        
        const toRemove = this.targetSelection.value;
        const current = this.modelValue.value || [];
        this.modelValue.value = current.filter(val => !toRemove.includes(val));
        this.targetSelection.value = [];
        this.targetLastIndex = null;
    }
}
