import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GLib from 'gi://GLib';
import { BaseComponent } from '../component.js';
import { effect, ref } from '../reactivity.js';
import { QBtn } from './QBtn.js';
import { QLabel } from './QLabel.js';

export class QStatusBar extends BaseComponent {
    constructor(props = {}) {
        const centerBox = new Gtk.CenterBox();
        super(centerBox);
        
        this.widget.add_css_class('q-status-bar');
        
        // Setup internal boxes
        this.startBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 4 });
        this.centerBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 4 });
        this.endBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 8, valign: Gtk.Align.CENTER });
        
        this.widget.set_start_widget(this.startBox);
        this.widget.set_center_widget(this.centerBox);
        this.widget.set_end_widget(this.endBox);
        
        // Default styling to look like a system taskbar
        const css = `
            .q-status-bar { 
                background: @theme_bg_color; 
                border-top: 1px solid @borders;
                padding: 4px 8px;
            }
            .q-status-clock {
                font-size: 12px;
                padding: 0 8px;
            }
        `;
        const provider = new Gtk.CssProvider();
        provider.load_from_string(css);
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );
        
        this.modelValue = props.modelValue || ref([]);
        
        // Setup clock if requested (default true)
        if (props.showClock !== false) {
            this.clockLabel = new QLabel({ label: this.getCurrentTimeString() });
            this.clockLabel.widget.add_css_class('q-status-clock');
            this.endBox.append(this.clockLabel.widget);
            
            this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
                this.clockLabel.widget.set_label(this.getCurrentTimeString());
                return GLib.SOURCE_CONTINUE;
            });
            
            this.widget.connect('destroy', () => {
                if (this._timeoutId) {
                    GLib.source_remove(this._timeoutId);
                    this._timeoutId = null;
                }
            });
        }
        
        // Reactively render center icons (running processes)
        effect(() => {
            this.renderProcesses();
        });
    }
    
    getCurrentTimeString() {
        const now = new Date();
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        return `${now.toLocaleDateString(undefined, dateOptions)}  ${now.toLocaleTimeString(undefined, timeOptions)}`;
    }
    
    renderProcesses() {
        // Clear existing
        let child = this.centerBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.centerBox.remove(child);
            child = next;
        }
        
        const processes = this.modelValue.value || [];
        
        processes.forEach(proc => {
            // Render each process as a flat button (icon only, with tooltip)
            const btn = new QBtn({
                icon: proc.icon || 'application-x-executable-symbolic',
                flat: true,
                onClick: proc.onClick || (() => {})
            });
            
            if (proc.tooltip || proc.label) {
                btn.widget.set_tooltip_text(proc.tooltip || proc.label);
            }
            
            this.centerBox.append(btn.widget);
        });
    }
    
    appendStart(childComponent) {
        this.children.push(childComponent);
        this.startBox.append(childComponent.widget);
    }
    
    appendEnd(childComponent) {
        this.children.push(childComponent);
        this.endBox.prepend(childComponent.widget); // Prepend so clock stays on far right
    }
}
