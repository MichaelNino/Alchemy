import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

function hexToRGB(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return [r, g, b];
}

// Procedurally shift color lightness for pie slices
function adjustBrightness(r, g, b, amount) {
    return [
        Math.max(0, Math.min(1, r + amount)),
        Math.max(0, Math.min(1, g + amount)),
        Math.max(0, Math.min(1, b + amount))
    ];
}

export class QChart extends BaseComponent {
    constructor(props = {}) {
        const drawingArea = new Gtk.DrawingArea();
        super(drawingArea);
        
        this.type = props.type || 'bar';
        this.color = props.color || '#3584e4'; // Default Adwaita Blue
        
        // Setup drawing function
        drawingArea.set_draw_func((area, cr, width, height) => {
            const data = props.data && props.data.value !== undefined ? props.data.value : (props.data || []);
            if (!data || data.length === 0) return;
            
            const [r, g, b] = hexToRGB(this.color);
            
            if (this.type === 'bar') {
                this.drawBarChart(cr, width, height, data, r, g, b);
            } else if (this.type === 'line') {
                this.drawLineChart(cr, width, height, data, r, g, b);
            } else if (this.type === 'pie') {
                this.drawPieChart(cr, width, height, data, r, g, b);
            } else if (this.type === 'doughnut') {
                this.drawDoughnutChart(cr, width, height, data, r, g, b);
            } else if (this.type === 'radar') {
                this.drawRadarChart(cr, width, height, data, r, g, b);
            }
        });
        
        // Trigger repaint when reactive data changes
        if (props.data && props.data.value !== undefined) {
            effect(() => {
                // Read the value to register dependency
                const _ = props.data.value;
                drawingArea.queue_draw();
            });
        }
    }
    
    drawBarChart(cr, width, height, data, r, g, b) {
        const padding = 40;
        const availWidth = width - (padding * 2);
        const availHeight = height - (padding * 2);
        
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const barSlot = availWidth / data.length;
        const barWidth = barSlot * 0.7; // 70% of slot width
        
        // Draw Axes
        cr.setSourceRGBA(0.5, 0.5, 0.5, 1.0);
        cr.setLineWidth(1);
        cr.moveTo(padding, padding);
        cr.lineTo(padding, height - padding);
        cr.lineTo(width - padding, height - padding);
        cr.stroke();
        
        // Draw Bars
        data.forEach((item, i) => {
            const valHeight = (item.value / maxVal) * availHeight;
            const x = padding + (i * barSlot) + ((barSlot - barWidth) / 2);
            const y = height - padding - valHeight;
            
            cr.setSourceRGBA(r, g, b, 1.0);
            cr.rectangle(x, y, barWidth, valHeight);
            cr.fill();
            
            // Label
            cr.setSourceRGBA(0.8, 0.8, 0.8, 1.0);
            cr.selectFontFace("Sans", 0, 0);
            cr.setFontSize(11);
            
            // Very basic text centering approximation
            cr.moveTo(x + (barWidth / 4), height - padding + 15);
            cr.showText(String(item.label));
        });
    }
    
    drawLineChart(cr, width, height, data, r, g, b) {
        const padding = 40;
        const availWidth = width - (padding * 2);
        const availHeight = height - (padding * 2);
        
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const xStep = availWidth / Math.max(1, data.length - 1);
        
        // Draw Axes
        cr.setSourceRGBA(0.5, 0.5, 0.5, 1.0);
        cr.setLineWidth(1);
        cr.moveTo(padding, padding);
        cr.lineTo(padding, height - padding);
        cr.lineTo(width - padding, height - padding);
        cr.stroke();
        
        if (data.length === 0) return;
        
        // Draw Line
        cr.setSourceRGBA(r, g, b, 1.0);
        cr.setLineWidth(3);
        
        let firstX, firstY;
        data.forEach((item, i) => {
            const valHeight = (item.value / maxVal) * availHeight;
            const x = padding + (i * xStep);
            const y = height - padding - valHeight;
            
            if (i === 0) {
                cr.moveTo(x, y);
                firstX = x;
                firstY = y;
            } else {
                cr.lineTo(x, y);
            }
        });
        cr.stroke();
        
        // Draw Points & Labels
        data.forEach((item, i) => {
            const valHeight = (item.value / maxVal) * availHeight;
            const x = padding + (i * xStep);
            const y = height - padding - valHeight;
            
            cr.setSourceRGBA(r, g, b, 1.0);
            cr.arc(x, y, 5, 0, 2 * Math.PI);
            cr.fill();
            
            cr.setSourceRGBA(0.8, 0.8, 0.8, 1.0);
            cr.selectFontFace("Sans", 0, 0);
            cr.setFontSize(11);
            cr.moveTo(x - 10, height - padding + 15);
            cr.showText(String(item.label));
        });
    }
    
    drawPieChart(cr, width, height, data, r, g, b) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2 * 0.7;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;
        
        let startAngle = -Math.PI / 2; // Start at 12 o'clock
        
        data.forEach((item, i) => {
            const fraction = item.value / total;
            const angle = fraction * 2 * Math.PI;
            
            // Adjust brightness for different slices
            const modifier = (i % 5) * 0.15;
            const [sr, sg, sb] = adjustBrightness(r, g, b, -0.3 + modifier);
            
            cr.setSourceRGBA(sr, sg, sb, 1.0);
            cr.moveTo(cx, cy);
            cr.arc(cx, cy, radius, startAngle, startAngle + angle);
            cr.fill();
            
            // Label
            const midAngle = startAngle + (angle / 2);
            const labelX = cx + Math.cos(midAngle) * (radius * 1.25);
            const labelY = cy + Math.sin(midAngle) * (radius * 1.25);
            
            cr.setSourceRGBA(0.8, 0.8, 0.8, 1.0);
            cr.selectFontFace("Sans", 0, 0);
            cr.setFontSize(11);
            cr.moveTo(labelX - 10, labelY);
            cr.showText(`${item.label} (${Math.round(fraction * 100)}%)`);
            
            startAngle += angle;
        });
    }
    
    drawDoughnutChart(cr, width, height, data, r, g, b) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2 * 0.7;
        const thickness = radius * 0.4;
        const drawRadius = radius - (thickness / 2);
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;
        
        let startAngle = -Math.PI / 2; // Start at 12 o'clock
        
        cr.setLineWidth(thickness);
        
        // First loop: draw the doughnut slices
        data.forEach((item, i) => {
            const fraction = item.value / total;
            const angle = fraction * 2 * Math.PI;
            
            // Adjust brightness for different slices
            const modifier = (i % 5) * 0.15;
            const [sr, sg, sb] = adjustBrightness(r, g, b, -0.3 + modifier);
            
            cr.setSourceRGBA(sr, sg, sb, 1.0);
            // Move to the start of the arc to prevent connecting lines from previous operations
            const startX = cx + Math.cos(startAngle) * drawRadius;
            const startY = cy + Math.sin(startAngle) * drawRadius;
            cr.moveTo(startX, startY);
            cr.arc(cx, cy, drawRadius, startAngle, startAngle + angle);
            cr.stroke();
            
            startAngle += angle;
        });
        
        // Second loop: draw the labels
        startAngle = -Math.PI / 2;
        data.forEach((item, i) => {
            const fraction = item.value / total;
            const angle = fraction * 2 * Math.PI;
            
            const midAngle = startAngle + (angle / 2);
            const labelX = cx + Math.cos(midAngle) * (radius * 1.25);
            const labelY = cy + Math.sin(midAngle) * (radius * 1.25);
            
            cr.setSourceRGBA(0.8, 0.8, 0.8, 1.0);
            cr.selectFontFace("Sans", 0, 0);
            cr.setFontSize(11);
            cr.moveTo(labelX - 10, labelY);
            cr.showText(`${item.label} (${Math.round(fraction * 100)}%)`);
            
            startAngle += angle;
        });
    }
    
    drawRadarChart(cr, width, height, data, r, g, b) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2 * 0.7;
        
        const N = data.length;
        if (N === 0) return;
        
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const angleStep = (2 * Math.PI) / N;
        const startAngle = -Math.PI / 2;
        
        // 1. Draw web (concentric polygons)
        cr.setSourceRGBA(0.5, 0.5, 0.5, 0.3); // Light gray for web
        cr.setLineWidth(1);
        
        const rings = 4;
        for (let rLevel = 1; rLevel <= rings; rLevel++) {
            const rStep = (radius / rings) * rLevel;
            for (let i = 0; i < N; i++) {
                const angle = startAngle + (i * angleStep);
                const x = cx + Math.cos(angle) * rStep;
                const y = cy + Math.sin(angle) * rStep;
                
                if (i === 0) cr.moveTo(x, y);
                else cr.lineTo(x, y);
            }
            cr.closePath();
            cr.stroke();
        }
        
        // 2. Draw axes (spokes)
        for (let i = 0; i < N; i++) {
            const angle = startAngle + (i * angleStep);
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            cr.moveTo(cx, cy);
            cr.lineTo(x, y);
        }
        cr.stroke();
        
        // 3. Draw data polygon
        for (let i = 0; i < N; i++) {
            const angle = startAngle + (i * angleStep);
            const valRadius = (data[i].value / maxVal) * radius;
            const x = cx + Math.cos(angle) * valRadius;
            const y = cy + Math.sin(angle) * valRadius;
            
            if (i === 0) cr.moveTo(x, y);
            else cr.lineTo(x, y);
        }
        cr.closePath();
        
        // Fill data with transparency
        cr.setSourceRGBA(r, g, b, 0.4);
        cr.fillPreserve();
        
        // Stroke data outline
        cr.setSourceRGBA(r, g, b, 1.0);
        cr.setLineWidth(2);
        cr.stroke();
        
        // 4. Draw data points
        for (let i = 0; i < N; i++) {
            const angle = startAngle + (i * angleStep);
            const valRadius = (data[i].value / maxVal) * radius;
            const x = cx + Math.cos(angle) * valRadius;
            const y = cy + Math.sin(angle) * valRadius;
            
            cr.setSourceRGBA(r, g, b, 1.0);
            cr.arc(x, y, 4, 0, 2 * Math.PI);
            cr.fill();
        }
        
        // 5. Draw Labels
        cr.setSourceRGBA(0.8, 0.8, 0.8, 1.0);
        cr.selectFontFace("Sans", 0, 0);
        cr.setFontSize(11);
        
        for (let i = 0; i < N; i++) {
            const angle = startAngle + (i * angleStep);
            const labelX = cx + Math.cos(angle) * (radius * 1.25);
            const labelY = cy + Math.sin(angle) * (radius * 1.25);
            
            cr.moveTo(labelX - 10, labelY);
            cr.showText(String(data[i].label));
        }
    }
}
