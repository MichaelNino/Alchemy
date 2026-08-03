import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { QLabel } from './QLabel.js';
import { QBtn } from './QBtn.js';

export class QTag extends BaseComponent {
    constructor(props = {}) {
        const box = new Gtk.Box({ 
            orientation: Gtk.Orientation.HORIZONTAL, 
            spacing: 4 
        });
        
        box.add_css_class('accent'); // Use built-in accent color for the tag
        
        // Add some padding to make it look like a pill
        box.margin_start = 2;
        box.margin_end = 2;
        // In GTK4, to add inner padding to a box we can just rely on the label's margins
        
        const labelText = props.label || props.text || '';
        const label = new QLabel({ label: `<small>${labelText}</small>`, useMarkup: true });
        label.widget.margin_start = 6;
        label.widget.margin_end = props.removable ? 2 : 6;
        label.widget.margin_top = 2;
        label.widget.margin_bottom = 2;
        
        box.append(label.widget);
        
        if (props.removable) {
            const closeBtn = new Gtk.Button({
                icon_name: 'window-close-symbolic',
                has_frame: false
            });
            // Make the button small
            closeBtn.add_css_class('flat');
            closeBtn.add_css_class('circular');
            closeBtn.margin_end = 2;
            closeBtn.margin_top = 2;
            closeBtn.margin_bottom = 2;
            
            closeBtn.connect('clicked', () => {
                if (props.onRemove) {
                    props.onRemove(labelText);
                }
            });
            box.append(closeBtn);
        }
        
        super(box);
    }
}
