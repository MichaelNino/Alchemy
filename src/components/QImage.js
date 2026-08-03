import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import Gsk from 'gi://Gsk?version=4.0';
import Graphene from 'gi://Graphene';
import { BaseComponent } from '../component.js';

const NativeQImage = GObject.registerClass(
class NativeQImage extends Gtk.Widget {
    _init(props = {}) {
        super._init({});
        this._texture = null;
        this.shape = props.shape || 'square';
        this.width = props.width || props.size || 100;
        this.height = props.height || props.size || 100;
        
        this.set_size_request(this.width, this.height);
        this.add_css_class('q-image');
        
        if (props.image || props.src) {
            this.setSrc(props.image || props.src);
        }
    }

    setSrc(path) {
        try {
            this._texture = Gdk.Texture.new_from_filename(path);
            this.queue_draw();
        } catch (e) {
            console.error("Failed to load image:", e);
        }
    }

    vfunc_measure(orientation, for_size) {
        if (orientation === Gtk.Orientation.HORIZONTAL) {
            return [this.width, this.width, -1, -1];
        } else {
            return [this.height, this.height, -1, -1];
        }
    }

    vfunc_snapshot(snapshot) {
        if (!this._texture) return;

        const w = this.get_width();
        const h = this.get_height();
        
        const bounds = new Graphene.Rect();
        bounds.init(0, 0, w, h);
        
        let radius = 0;
        if (this.shape === 'circle') {
            radius = Math.max(w, h); // Fully rounded
        } else if (this.shape === 'square') {
            radius = 8; // Slightly rounded like standard Quasar avatars
        }

        const rounded = new Gsk.RoundedRect();
        rounded.init_from_rect(bounds, radius);

        snapshot.push_rounded_clip(rounded);
        
        // Emulate background-size: cover (ContentFit.COVER)
        const texW = this._texture.get_width();
        const texH = this._texture.get_height();
        
        const ratioW = w / texW;
        const ratioH = h / texH;
        const coverRatio = Math.max(ratioW, ratioH);
        
        const drawW = texW * coverRatio;
        const drawH = texH * coverRatio;
        const drawX = (w - drawW) / 2;
        const drawY = (h - drawH) / 2;
        
        const drawBounds = new Graphene.Rect();
        drawBounds.init(drawX, drawY, drawW, drawH);
        
        snapshot.append_texture(this._texture, drawBounds);
        snapshot.pop();
    }
});

export class QImage extends BaseComponent {
    constructor(props = {}) {
        super(new NativeQImage(props));
    }
    
    setSrc(path) {
        this.widget.setSrc(path);
    }
}
