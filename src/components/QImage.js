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
        if (props.shape) {
            this._applyShapeCSS(props.shape);
        }

        // Src / Image
        const imagePath = props.src || props.image;
        if (imagePath) {
            this.setSrc(imagePath);
        }
    }

    _applyShapeCSS(shape) {
        const provider = new Gtk.CssProvider();
        let css = '';
        if (shape === 'circle') {
            const maxDim = Math.max(this.width, this.height);
            css = `.q-image { border-radius: ${Math.max(maxDim, 100)}px; }`;
        } else if (shape === 'square') {
            css = `.q-image { border-radius: 8px; }`;
        }
        
        if (css) {
            provider.load_from_data(css, css.length);
            this.widget.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
        }
    }

    setSrc(path) {
        // Clear existing children
        let child = this.widget.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.widget.remove(child);
            child = next;
        }

        this._picture = Gtk.Picture.new_for_filename(path);
        this._picture.can_shrink = true;
        this._picture.content_fit = Gtk.ContentFit.COVER;
        this._picture.width_request = this.width;
        this._picture.height_request = this.height;
        
        this.widget.append(this._picture);
    }
}
