import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QTabs extends BaseComponent {
    constructor(props = {}) {
        const flowBox = new Gtk.FlowBox({
            selection_mode: Gtk.SelectionMode.NONE,
            max_children_per_line: 20,
            min_children_per_line: 1,
            row_spacing: 5,
            column_spacing: 5,
            homogeneous: false
        });
        
        super(flowBox);
        this.flowBox = flowBox;
        
        this.modelValue = props.modelValue;
        this.groupWidget = null;
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        
        if (this.groupWidget === null) {
            this.groupWidget = childComponent.widget;
        } else {
            childComponent.widget.set_group(this.groupWidget);
        }

        if (this.modelValue && childComponent.name !== undefined) {
            childComponent.widget.active = (this.modelValue.value === childComponent.name);
            
            childComponent.on('toggled', () => {
                if (childComponent.widget.active && this.modelValue.value !== childComponent.name) {
                    this.modelValue.value = childComponent.name;
                }
            });
            
            effect(() => {
                const shouldBeActive = (this.modelValue.value === childComponent.name);
                if (childComponent.widget.active !== shouldBeActive) {
                    childComponent.widget.active = shouldBeActive;
                }
            });
        }
        
        this.flowBox.append(childComponent.widget);
    }
}

export class QTab extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.ToggleButton());
        this.name = props.name;
        
        if (props.label !== undefined) {
            this.widget.label = props.label;
        }
    }
}
