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
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 });
        const drawingArea = new Gtk.DrawingArea({ hexpand: true, vexpand: true });
        box.append(drawingArea);
        super(box);
        
        this.type = props.type || 'bar';
        this.color = props.color || '#3584e4'; // Default Adwaita Blue
        this.data = props.data;
        
        // Build Legend for Pie/Doughnut/PolarArea
        if (['pie', 'doughnut', 'polarArea'].includes(this.type)) {
            const legendBox = new Gtk.FlowBox({ 
                selection_mode: Gtk.SelectionMode.NONE,
                max_children_per_line: 10,
                min_children_per_line: 1,
                row_spacing: 5,
                column_spacing: 15,
                halign: Gtk.Align.CENTER
            });
            box.append(legendBox);
            
            const rawData = this.data && this.data.value !== undefined ? this.data.value : (this.data || []);
            const total = rawData.reduce((sum, item) => sum + item.value, 0);
            const [r, g, b] = hexToRGB(this.color);
            
            rawData.forEach((item, i) => {
                const fraction = total === 0 ? 0 : item.value / total;
                const modifier = (i % 5) * 0.15;
                const [sr, sg, sb] = adjustBrightness(r, g, b, -0.3 + modifier);
                
                // Color swatch
                const swatch = new Gtk.DrawingArea({ width_request: 12, height_request: 12 });
                swatch.set_draw_func((area, cr) => {
                    cr.setSourceRGBA(sr, sg, sb, 1.0);
                    cr.rectangle(0, 0, 12, 12);
                    cr.fill();
                });
                
                // Label
                const labelStr = `${item.label} (${Math.round(fraction * 100)}%)`;
                const label = new Gtk.Label({ label: labelStr, css_classes: ['dim-label'] });
                
                const itemBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 6 });
                itemBox.append(swatch);
                itemBox.append(label);
                
                legendBox.append(itemBox);
            });
        }
        
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
            } else if (this.type === 'polarArea') {
                this.drawPolarAreaChart(cr, width, height, data, r, g, b);
            } else if (this.type === 'scatter') {
                this.drawScatterChart(cr, width, height, data, r, g, b);
            } else if (this.type === 'bubble') {
                this.drawBubbleChart(cr, width, height, data, r, g, b);
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
        
        // Draw slices
        data.forEach((item, i) => {
            const fraction = item.value / total;
            const angle = fraction * 2 * Math.PI;
            
            const modifier = (i % 5) * 0.15;
            const [sr, sg, sb] = adjustBrightness(r, g, b, -0.3 + modifier);
            
            cr.setSourceRGBA(sr, sg, sb, 1.0);
            cr.moveTo(cx, cy);
            cr.arc(cx, cy, radius, startAngle, startAngle + angle);
            cr.fill();
            
            startAngle += angle;
        });
    }
    
    drawDoughnutChart(cr, width, height, data, r, g, b) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2 * 0.7;
        const thickness = radius * 0.5;
        const innerRadius = radius - thickness;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;
        
        let startAngle = -Math.PI / 2;
        
        // Draw slices
        data.forEach((item, i) => {
            const fraction = item.value / total;
            const angle = fraction * 2 * Math.PI;
            
            const modifier = (i % 5) * 0.15;
            const [sr, sg, sb] = adjustBrightness(r, g, b, -0.3 + modifier);
            
            cr.setSourceRGBA(sr, sg, sb, 1.0);
            // Draw outer arc
            cr.arc(cx, cy, radius, startAngle, startAngle + angle);
            // Draw inner arc in reverse (arcNegative)
            cr.arcNegative(cx, cy, innerRadius, startAngle + angle, startAngle);
            cr.closePath();
            cr.fill();
            
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
    
    drawPolarAreaChart(cr, width, height, data, r, g, b) {
        const cx = width / 2;
        const cy = height / 2; // Keep at center if we rely on legend
        const maxRadius = Math.min(width, height) / 2 * 0.7;
        
        const N = data.length;
        if (N === 0) return;
        
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const angleStep = (2 * Math.PI) / N;
        let startAngle = -Math.PI / 2;
        
        // 1. Draw web (concentric circles)
        cr.setSourceRGBA(0.5, 0.5, 0.5, 0.3); // Light gray for web
        cr.setLineWidth(1);
        
        const rings = 4;
        for (let rLevel = 1; rLevel <= rings; rLevel++) {
            const rStep = (maxRadius / rings) * rLevel;
            cr.arc(cx, cy, rStep, 0, 2 * Math.PI);
            cr.stroke();
        }
        
        // 2. Draw spokes
        for (let i = 0; i < N; i++) {
            const angle = startAngle + (i * angleStep);
            const x = cx + Math.cos(angle) * maxRadius;
            const y = cy + Math.sin(angle) * maxRadius;
            cr.moveTo(cx, cy);
            cr.lineTo(x, y);
        }
        cr.stroke();
        
        // 3. Draw Slices
        for (let i = 0; i < N; i++) {
            const angle = angleStep;
            const valRadius = (data[i].value / maxVal) * maxRadius;
            
            const modifier = (i % 5) * 0.15;
            const [sr, sg, sb] = adjustBrightness(r, g, b, -0.3 + modifier);
            
            cr.setSourceRGBA(sr, sg, sb, 0.6); // Semi-transparent fill
            cr.moveTo(cx, cy);
            cr.arc(cx, cy, valRadius, startAngle, startAngle + angle);
            cr.closePath();
            cr.fillPreserve();
            
            cr.setSourceRGBA(sr, sg, sb, 1.0); // Solid stroke
            cr.setLineWidth(2);
            cr.stroke();
            
            startAngle += angle;
        }
    }
    
    drawScatterChart(cr, width, height, data, r, g, b) {
        this._drawCartesianPoints(cr, width, height, data, r, g, b, false);
    }
    
    drawBubbleChart(cr, width, height, data, r, g, b) {
        this._drawCartesianPoints(cr, width, height, data, r, g, b, true);
    }
    
    _drawCartesianPoints(cr, width, height, data, r, g, b, isBubble) {
        const padding = 40;
        const availWidth = width - (padding * 2);
        const availHeight = height - (padding * 2);
        
        // Ensure data format is {x, y, r?}
        if (!data[0] || data[0].x === undefined || data[0].y === undefined) return;
        
        const maxX = Math.max(...data.map(d => d.x), 1);
        const maxY = Math.max(...data.map(d => d.y), 1);
        const maxR = isBubble ? Math.max(...data.map(d => d.r || 1), 1) : 1;
        
        // Draw Axes
        cr.setSourceRGBA(0.5, 0.5, 0.5, 1.0);
        cr.setLineWidth(1);
        cr.moveTo(padding, padding);
        cr.lineTo(padding, height - padding);
        cr.lineTo(width - padding, height - padding);
        cr.stroke();
        
        // Draw Points
        data.forEach(item => {
            const mappedX = padding + (item.x / maxX) * availWidth;
            const mappedY = height - padding - ((item.y / maxY) * availHeight);
            
            let bubbleRadius = 4; // Default scatter size
            if (isBubble) {
                // Scale bubbles up to 30px max radius
                bubbleRadius = Math.max(3, ((item.r || 1) / maxR) * 30);
            }
            
            cr.setSourceRGBA(r, g, b, 0.6); // Semi-transparent
            cr.arc(mappedX, mappedY, bubbleRadius, 0, 2 * Math.PI);
            cr.fillPreserve();
            
            cr.setSourceRGBA(r, g, b, 1.0); // Solid outline
            cr.setLineWidth(1);
            cr.stroke();
        });
    }
}
