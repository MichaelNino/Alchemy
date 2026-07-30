import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';

export class QTree extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL }));
        
        if (props.nodes) {
            const nodes = props.nodes.value !== undefined ? props.nodes.value : props.nodes;
            nodes.forEach(node => {
                this.widget.append(this.createNodeWidget(node, props.nodeKey || 'id', props.labelKey || 'label', props.childrenKey || 'children'));
            });
        }
    }
    
    createNodeWidget(node, nodeKey, labelKey, childrenKey) {
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        
        const headerBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 6 });
        headerBox.margin_top = 4;
        headerBox.margin_bottom = 4;
        
        const children = node[childrenKey] || [];
        const hasChildren = children.length > 0;
        
        const revealer = new Gtk.Revealer({
            transition_type: Gtk.RevealerTransitionType.SLIDE_DOWN,
            transition_duration: 200
        });
        
        let toggleBtn = null;
        if (hasChildren) {
            toggleBtn = new Gtk.Button({ icon_name: 'pan-end-symbolic' });
            toggleBtn.add_css_class('flat');
            toggleBtn.add_css_class('circular');
            headerBox.append(toggleBtn);
            
            const childrenBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
            childrenBox.margin_start = 24; // Indent children
            
            children.forEach(childNode => {
                childrenBox.append(this.createNodeWidget(childNode, nodeKey, labelKey, childrenKey));
            });
            
            revealer.set_child(childrenBox);
            
            let expanded = false;
            toggleBtn.connect('clicked', () => {
                expanded = !expanded;
                revealer.reveal_child = expanded;
                toggleBtn.set_icon_name(expanded ? 'pan-down-symbolic' : 'pan-end-symbolic');
            });
        } else {
            // Spacer for alignment
            const spacer = new Gtk.Box();
            spacer.width_request = 32;
            headerBox.append(spacer);
        }
        
        const label = new Gtk.Label({ label: String(node[labelKey]), xalign: 0 });
        headerBox.append(label);
        
        box.append(headerBox);
        box.append(revealer);
        
        return box;
    }
}
