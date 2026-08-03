import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import { BaseComponent } from '../component.js';
import { QCard } from './QCard.js';
import { QLabel } from './QLabel.js';
import { QAvatar } from './QAvatar.js';
import { QBtn } from './QBtn.js';
import { QMenu } from './QMenu.js';
import { QTag } from './QTag.js';
import { QIcon } from './QIcon.js';
import { QDragSource } from '../utils/QDragSource.js';

export class QKanbanCard extends BaseComponent {
    constructor(task, props = {}) {
        const card = new QCard();
        card.widget.margin_top = 0;
        card.widget.margin_bottom = 10;
        card.widget.margin_start = 0;
        card.widget.margin_end = 0;
        
        // Outer horizontal box to hold the color strip and the content
        const hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        
        // Color strip (Left border)
        const colorStrip = new Gtk.DrawingArea();
        colorStrip.set_size_request(4, -1);
        colorStrip.set_draw_func((area, cr, width, height) => {
            const color = task.color || '#3584e4'; // Default blue
            const rgba = new Gdk.RGBA();
            if (rgba.parse(color)) {
                Gdk.cairo_set_source_rgba(cr, rgba);
                cr.rectangle(0, 0, width, height);
                cr.fill();
            }
        });
        hbox.append(colorStrip);
        
        // Inner vertical box for content
        const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 5 });
        vbox.margin_top = 10;
        vbox.margin_bottom = 10;
        vbox.margin_start = 10;
        vbox.margin_end = 10;
        vbox.hexpand = true;
        
        // Title
        const title = new QLabel({ label: `<b>${task.title}</b>`, useMarkup: true });
        title.widget.halign = Gtk.Align.START;
        title.widget.wrap = true;
        vbox.append(title.widget);
        
        // Optional Description
        if (task.description) {
            const desc = new QLabel({ label: `<small>${task.description}</small>`, useMarkup: true });
            desc.widget.halign = Gtk.Align.START;
            desc.widget.wrap = true;
            desc.widget.add_css_class('dim-label');
            vbox.append(desc.widget);
        }
        
        // Bottom row (Tags, Avatar, Menu)
        const bottomRow = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        bottomRow.margin_top = 5;
        
        // Tags
        if (task.tags && task.tags.length > 0) {
            const tagBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 5 });
            task.tags.forEach(tagText => {
                const tag = new QTag({ label: tagText, removable: false });
                tagBox.append(tag.widget);
            });
            bottomRow.append(tagBox);
        }
        
        // Spacer
        const spacer = new Gtk.Box({ hexpand: true });
        bottomRow.append(spacer);
        
        // Attachments Indicator
        if (task.attachments && task.attachments.length > 0) {
            const attachBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 3 });
            attachBox.valign = Gtk.Align.CENTER;
            attachBox.append(new QIcon({ name: 'mail-attachment-symbolic', size: 16 }).widget);
            const attachLabel = new QLabel({ label: `<small>${task.attachments.length}</small>`, useMarkup: true });
            attachLabel.widget.add_css_class('dim-label');
            attachBox.append(attachLabel.widget);
            bottomRow.append(attachBox);
        }
        
        // Assignee Avatar
        if (task.assignee) {
            const avatar = new QAvatar({ text: task.assignee, size: 24 });
            avatar.widget.valign = Gtk.Align.CENTER;
            bottomRow.append(avatar.widget);
        }
        
        // Context Menu
        const menuBtn = new QBtn({ icon: 'view-more-symbolic', flat: true });
        menuBtn.widget.valign = Gtk.Align.CENTER;
        
        const menu = new QMenu();
        // Create menu items
        const editItem = new Gtk.Button({ label: 'Edit', has_frame: false });
        editItem.connect('clicked', () => { 
            menu.widget.popdown();
            if (props.onEdit) props.onEdit(task); 
        });
        menu.box.append(editItem);
        
        const deleteItem = new Gtk.Button({ label: 'Delete', has_frame: false });
        deleteItem.add_css_class('destructive-action');
        deleteItem.connect('clicked', () => { 
            menu.widget.popdown();
            if (props.onDelete) props.onDelete(task); 
        });
        menu.box.append(deleteItem);
        
        menu.mount(menuBtn.widget);
        
        menuBtn.widget.connect('clicked', () => {
            menu.widget.popup();
        });
        bottomRow.append(menuBtn.widget);
        
        vbox.append(bottomRow);
        hbox.append(vbox);
        card.box.append(hbox);
        
        // Make draggable
        new QDragSource(card, { payload: JSON.stringify({ id: task.id }) });
        
        super(card.widget);
        this.task = task;
    }
}
