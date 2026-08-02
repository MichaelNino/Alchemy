import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';
import { QScreen } from '../plugins/QScreen.js';

export class QRow extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Overlay());
        
        this.contentBox = new Gtk.Box({ spacing: props.spacing || 10 });
        this.widget.set_child(this.contentBox);
        
        this.tracker = new Gtk.DrawingArea({ hexpand: true, vexpand: true, halign: Gtk.Align.FILL, valign: Gtk.Align.FILL });
        this.widget.add_overlay(this.tracker);
        this.tracker.can_target = false;
        
        this.widget.add_css_class('q-row');
        
        const localWidth = ref(0);
        
        this.tracker.connect('resize', (area, width, height) => {
            localWidth.value = width;
        });
        
        // Responsive orientation based on local container width
        effect(() => {
            let width = localWidth.value || QScreen.width; // fallback
            let shouldStack = false;
            
            if (props.stackAt === 'xs' && width < 600) shouldStack = true;
            if (props.stackAt === 'sm' && width < 1024) shouldStack = true;
            if (props.stackAt === 'md' && width < 1440) shouldStack = true;
            if (props.stackAt === 'lg' && width < 1920) shouldStack = true;
            
            // Default behavior: stack on xs screens unless overridden
            if (!props.stackAt && width < 600) {
                shouldStack = true;
            }
            
            if (shouldStack) {
                this.contentBox.orientation = Gtk.Orientation.VERTICAL;
            } else {
                this.contentBox.orientation = Gtk.Orientation.HORIZONTAL;
            }
        });
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.contentBox.append(childComponent.widget || childComponent);
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
