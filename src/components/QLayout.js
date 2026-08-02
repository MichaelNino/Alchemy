import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { updateScreen, QScreen } from '../plugins/QScreen.js';
import { effect, ref } from '../reactivity.js';

export class QLayout extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Overlay());
        
        this.view = props.view || 'hHh lpR fFf'; 
        
        this.mainBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.set_child(this.mainBox);
        
        // Invisible size tracker
        const tracker = new Gtk.DrawingArea();
        tracker.hexpand = true;
        tracker.vexpand = true;
        tracker.halign = Gtk.Align.FILL;
        tracker.valign = Gtk.Align.FILL;
        tracker.connect('resize', (area, w, h) => {
            updateScreen(w, h);
        });
        tracker.can_target = false;
        
        this.widget.add_overlay(tracker);
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.mainBox.append(childComponent.widget || childComponent);
    }
}

export class QHeader extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL }));
        this.widget.hexpand = true;
        this.widget.add_css_class('q-header');
        
        if (props.elevated) {
            this.widget.add_css_class('elevated');
        }
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget || childComponent);
    }
}

export class QPageContainer extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, hexpand: true, vexpand: true }));
        this.widget.add_css_class('q-page-container');
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.widget.append(childComponent.widget || childComponent);
    }
}

export class QDrawer extends BaseComponent {
    constructor(props = {}) {
        super(props.scrollable !== false ? new Gtk.ScrolledWindow() : new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL }));
        
        if (props.scrollable !== false) {
            this.widget.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
            this.mainBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
            this.widget.set_child(this.mainBox);
        } else {
            this.mainBox = this.widget;
        }
        this.breakpoint = props.breakpoint || 1024;
        this.modelValue = props.modelValue || ref(true);
        this.overlay = props.overlay || false;
        
        this.widget.add_css_class('q-drawer');
        
        effect(() => {
            const width = QScreen.width;
            
            if (width < this.breakpoint || this.overlay) {
                // Mobile / Overlay mode
                if (this.modelValue.value) {
                    this.widget.visible = true;
                } else {
                    this.widget.visible = false;
                }
            } else {
                // Desktop mode
                if (this.modelValue.value === false) {
                    this.widget.visible = false;
                } else {
                    this.widget.visible = true;
                }
            }
        });
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.mainBox.append(childComponent.widget || childComponent);
    }
}
