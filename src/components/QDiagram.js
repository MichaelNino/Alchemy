import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GLib from 'gi://GLib';
import { BaseComponent } from '../component.js';
import { effect, ref } from '../reactivity.js';

export class QDiagram extends BaseComponent {
    constructor(props = {}) {
        const scrolledWindow = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            hscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });
        super(scrolledWindow);
        
        this.modelValue = props.modelValue || ref({ nodes: [], edges: [] });
        
        // CSS for Nodes
        const css = `
            .q-diagram-node { 
                background: @theme_bg_color; 
                border: 2px solid @borders; 
                border-radius: 8px; 
                padding: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .q-diagram-node:hover {
                border-color: @theme_selected_bg_color;
            }
        `;
        const provider = new Gtk.CssProvider();
        provider.load_from_string(css);
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );
        
        this.fixed = new Gtk.Fixed();
        
        // Drawing Area for Edges
        this.drawingArea = new Gtk.DrawingArea();
        this.drawingArea.set_draw_func(this._drawEdges.bind(this));
        
        // We need to size the fixed and drawing area appropriately.
        // For a true infinite canvas, this requires complex scrolling.
        // For V1, we'll request a large static size.
        this.fixed.set_size_request(2000, 2000);
        this.drawingArea.set_size_request(2000, 2000);
        
        this.fixed.put(this.drawingArea, 0, 0);
        
        scrolledWindow.set_child(this.fixed);
        
        this.nodeWidgets = new Map(); // id -> GtkWidget
        
        effect(() => {
            this.renderDiagram();
        });
    }
    
    _drawEdges(drawingArea, cr, width, height) {
        const data = this.modelValue.value || { nodes: [], edges: [] };
        const edges = data.edges || [];
        const nodes = data.nodes || [];
        
        // Dark/Light mode line color detection is hard in raw Cairo,
        // we will use a solid gray/blue color for lines
        cr.setSourceRGBA(0.5, 0.5, 0.5, 0.8);
        cr.setLineWidth(2.0);
        
        edges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (sourceNode && targetNode) {
                const sx = sourceNode.x + (sourceNode.width || 100) / 2;
                const sy = sourceNode.y + (sourceNode.height || 50) / 2;
                const tx = targetNode.x + (targetNode.width || 100) / 2;
                const ty = targetNode.y + (targetNode.height || 50) / 2;
                
                // Draw a simple bezier curve or straight line
                cr.moveTo(sx, sy);
                
                // For flowchart look, draw orthogonal lines or a smooth S curve
                // S curve:
                cr.curveTo(
                    sx + (tx - sx) / 2, sy,
                    sx + (tx - sx) / 2, ty,
                    tx, ty
                );
                
                cr.stroke();
                
                // Draw arrow head at target
                this._drawArrowHead(cr, sx, sy, tx, ty);
            }
        });
    }
    
    _drawArrowHead(cr, sx, sy, tx, ty) {
        // Calculate tangent angle at target (simplified for S curve)
        // Actually, since we curve, the arrow should point right if entering from left, etc.
        // For simplicity, just use direct angle between source and target
        const angle = Math.atan2(ty - sy, tx - sx);
        const arrowLength = 10;
        
        cr.moveTo(tx, ty);
        cr.lineTo(
            tx - arrowLength * Math.cos(angle - Math.PI / 6),
            ty - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        cr.lineTo(
            tx - arrowLength * Math.cos(angle + Math.PI / 6),
            ty - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        cr.closePath();
        cr.fill();
    }
    
    renderDiagram() {
        const data = this.modelValue.value || { nodes: [], edges: [] };
        const nodes = data.nodes || [];
        
        // Remove existing nodes from Fixed (skip drawingArea)
        let child = this.fixed.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            if (child !== this.drawingArea) {
                this.fixed.remove(child);
            }
            child = next;
        }
        
        this.nodeWidgets.clear();
        
        nodes.forEach(node => {
            const nodeBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
            nodeBox.add_css_class('q-diagram-node');
            
            // Set size if provided, else defaults
            node.width = node.width || 120;
            node.height = node.height || 60;
            nodeBox.set_size_request(node.width, node.height);
            
            // Label
            const label = new Gtk.Label({ label: node.label || node.id });
            label.set_wrap(true);
            label.halign = Gtk.Align.CENTER;
            label.valign = Gtk.Align.CENTER;
            label.vexpand = true;
            nodeBox.append(label);
            
            // Make Draggable
            const drag = new Gtk.GestureDrag();
            let startX = 0, startY = 0;
            
            drag.connect('drag-begin', (gesture, x, y) => {
                startX = node.x;
                startY = node.y;
            });
            
            drag.connect('drag-update', (gesture, offsetX, offsetY) => {
                node.x = startX + offsetX;
                node.y = startY + offsetY;
                this.fixed.move(nodeBox, node.x, node.y);
                this.drawingArea.queue_draw(); // Redraw edges instantly!
            });
            
            drag.connect('drag-end', () => {
                // Trigger reactivity update to save state if needed, though we mutated the object directly
                // If we want to notify parent:
                this.modelValue.value = { ...this.modelValue.value };
            });
            
            nodeBox.add_controller(drag);
            
            // To allow the GestureDrag to capture events on the box, we need a click controller or make it sensitive
            nodeBox.set_sensitive(true);
            
            this.fixed.put(nodeBox, node.x || 0, node.y || 0);
            this.nodeWidgets.set(node.id, nodeBox);
        });
        
        this.drawingArea.queue_draw();
    }
}
