import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QProgress extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.ProgressBar());
        
        this.widget.add_css_class('q-progress');
        
        this.max = props.max !== undefined ? props.max : 100;
        this.value = props.value || 0;
        
        this.showLabel = props.showLabel || false;
        this.labelFormat = props.labelFormat || 'percentage'; // 'percentage' or 'ratio'
        
        if (this.showLabel) {
            this.widget.set_show_text(true);
        }
        
        if (props.color) {
            this.setColor(props.color);
        }
        
        this.setValue(this.value);
    }
    
    setValue(value) {
        this.value = value;
        const fraction = Math.min(Math.max(this.value / this.max, 0.0), 1.0);
        this.widget.set_fraction(fraction);
        
        if (this.showLabel && this.labelFormat === 'ratio') {
            this.widget.set_text(`${this.value} / ${this.max}`);
        } else if (this.showLabel && this.labelFormat === 'percentage') {
            // GTK defaults to percentage, but if we previously overrode it, we need to clear the override
            this.widget.set_text(null);
        }
    }
    
    setMax(max) {
        this.max = max;
        this.setValue(this.value); // Re-calculate fraction and labels
    }
    
    setColor(color) {
        if (this._cssProvider) {
            this.widget.get_style_context().remove_provider(this._cssProvider);
            this._cssProvider = null;
        }
        
        if (!color) return;
        
        const css = `
            progressbar progress {
                background-color: ${color};
            }
        `;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(css);
        const bytes = imports.gi.GLib.Bytes.new(data);
        
        this._cssProvider = new Gtk.CssProvider();
        this._cssProvider.load_from_bytes(bytes);
        
        this.widget.get_style_context().add_provider(this._cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    }
}
