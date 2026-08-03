import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QImage extends BaseComponent {
    constructor(props = {}) {
        // Use a Box as the container to allow clipping via overflow
        super(new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL }));
        
        this.widget.add_css_class('q-image');
        this.widget.set_halign(Gtk.Align.CENTER);
        this.widget.set_valign(Gtk.Align.CENTER);
        
        // Ensure clipping happens for shapes
        this.widget.overflow = Gtk.Overflow.HIDDEN;
        
        this.width = props.width || props.size || 100;
        this.height = props.height || props.size || 100;
        this.widget.width_request = this.width;
        this.widget.height_request = this.height;

        this._picture = null;

        // Shape (circle, square, etc.)
        this._currentShape = props.shape;
        if (this._currentShape) {
            this._applyShapeCSS(this._currentShape);
        }

        // Src / Image
        const imagePath = props.src || props.image;
        if (imagePath) {
            this.setSrc(imagePath);
        }
    }

    _applyShapeCSS(shape, path) {
        const provider = new Gtk.CssProvider();
        let css = '';
        
        let radius = '0px';
        if (shape === 'circle') {
            const maxDim = Math.max(this.width, this.height);
            radius = `${Math.max(maxDim, 100)}px`;
        } else if (shape === 'square') {
            radius = '8px';
        }
        
        css = `.q-image { border-radius: ${radius}; }`;
        
        if (path) {
            const GLib = imports.gi.GLib;
            const uri = GLib.filename_to_uri(path, null);
            css += `
                .q-image {
                    background-image: url('${uri}');
                    background-size: cover;
                    background-position: center;
                }
            `;
        }
        
        provider.load_from_data(css, css.length);
        
        // Remove old provider if it exists
        if (this._cssProvider) {
            this.widget.get_style_context().remove_provider(this._cssProvider);
        }
        this._cssProvider = provider;
        this.widget.get_style_context().add_provider(this._cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
        this.widget.queue_draw();
    }

    setSrc(path) {
        this._currentPath = path;
        this._applyShapeCSS(this._currentShape, path);
    }
}
