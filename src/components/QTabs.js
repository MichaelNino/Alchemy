import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QTabs extends BaseComponent {
    constructor(props = {}) {
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
        box.add_css_class('linked');
        
        const scroll = new Gtk.ScrolledWindow({
            hexpand: true,
            vscrollbar_policy: Gtk.PolicyType.NEVER,
            hscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });
        scroll.set_child(box);
        
        super(scroll);
        this.box = box;
        
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
        
        this.box.append(childComponent.widget);
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
