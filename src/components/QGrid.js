import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';
import { QScreen } from '../plugins/QScreen.js';

export class QRow extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ spacing: props.spacing || 10 }));
        
        this.widget.add_css_class('q-row');
        
        // Responsive orientation based on QScreen breakpoints
        effect(() => {
            let shouldStack = false;
            
            if (props.stackAt === 'xs' && QScreen.xs) shouldStack = true;
            if (props.stackAt === 'sm' && QScreen.lt.md) shouldStack = true;
            if (props.stackAt === 'md' && QScreen.lt.lg) shouldStack = true;
            if (props.stackAt === 'lg' && QScreen.lt.xl) shouldStack = true;
            
            // Default behavior: stack on xs screens unless overridden
            if (!props.stackAt && QScreen.xs) {
                shouldStack = true;
            }
            
            if (shouldStack) {
                this.widget.orientation = Gtk.Orientation.VERTICAL;
            } else {
                this.widget.orientation = Gtk.Orientation.HORIZONTAL;
            }
        });
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget || childComponent);
    }
}

export class QCol extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL }));
        this.widget.add_css_class('q-col');
        
        this.widget.hexpand = props.auto !== false;
        
        if (props.align) {
            this.widget.valign = props.align;
        }
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget || childComponent);
    }
}
