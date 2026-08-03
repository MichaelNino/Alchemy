import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GLib from 'gi://GLib';
import { BaseComponent } from '../component.js';
import { effect, ref } from '../reactivity.js';
import { QBtn } from './QBtn.js';
import { QLabel } from './QLabel.js';
import { QAvatar } from './QAvatar.js';

export class QChat extends BaseComponent {
    constructor(props = {}) {
        const outerBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        super(outerBox);
        
        this.modelValue = props.modelValue || ref([]);
        this.currentUser = props.currentUser || 'me';
        this.onSend = props.onSend || null;
        
        this.widget.add_css_class('q-chat');
        
        // CSS for Chat
        const css = `
            .q-chat { background: @theme_bg_color; border: 1px solid @borders; border-radius: 8px; }
            .chat-list { background: transparent; padding: 10px; }
            .chat-list > row { background: transparent; border: none; padding: 4px; }
            .chat-list > row:hover { background: transparent; }
            
            .chat-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; }
            .chat-bubble-me { background: #3584e4; color: white; border-bottom-right-radius: 4px; }
            .chat-bubble-other { background: @theme_base_color; color: @theme_fg_color; border-bottom-left-radius: 4px; border: 1px solid @borders; }
            
            .chat-timestamp { font-size: 11px; opacity: 0.7; margin-top: 4px; }
            .chat-input-area { border-top: 1px solid @borders; padding: 10px; background: @theme_bg_color; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        `;
        const provider = new Gtk.CssProvider();
        provider.load_from_string(css);
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );
        
        // Message List
        this.scrolledWindow = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            hscrollbar_policy: Gtk.PolicyType.NEVER
        });
        
        this.listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE
        });
        this.listBox.add_css_class('chat-list');
        
        this.scrolledWindow.set_child(this.listBox);
        outerBox.append(this.scrolledWindow);
        
        // Input Area
        const inputArea = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        inputArea.add_css_class('chat-input-area');
        
        this.entry = new Gtk.Entry({ hexpand: true, placeholder_text: 'Type a message...' });
        this.entry.connect('activate', () => this.handleSend());
        
        const sendBtn = new QBtn({ icon: 'mail-send-symbolic', color: 'primary', onClick: () => this.handleSend() });
        
        inputArea.append(this.entry);
        inputArea.append(sendBtn.widget);
        
        outerBox.append(inputArea);
        
        // Reactivity
        effect(() => {
            this.renderMessages();
        });
    }
    
    handleSend() {
        const text = this.entry.get_text().trim();
        if (!text) return;
        
        if (this.onSend) {
            this.onSend(text);
        } else {
            // Default behavior: add to model
            const messages = [...this.modelValue.value];
            messages.push({
                id: Date.now().toString(),
                text: text,
                senderId: this.currentUser,
                timestamp: new Date().toISOString()
            });
            this.modelValue.value = messages;
        }
        
        this.entry.set_text('');
        
        // Scroll to bottom (deferred slightly to allow GTK to render row)
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            const vadj = this.scrolledWindow.get_vadjustment();
            vadj.set_value(vadj.get_upper() - vadj.get_page_size());
            return GLib.SOURCE_REMOVE;
        });
    }
    
    renderMessages() {
        // Clear list
        let child = this.listBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.listBox.remove(child);
            child = next;
        }
        
        const messages = this.modelValue.value || [];
        
        messages.forEach(msg => {
            const isMe = msg.senderId === this.currentUser;
            
            const rowBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
            rowBox.margin_top = 5;
            rowBox.margin_bottom = 5;
            
            // Avatar for others
            if (!isMe && msg.avatar) {
                const avatar = new QAvatar({ src: msg.avatar, size: 36 });
                avatar.widget.valign = Gtk.Align.END;
                rowBox.append(avatar.widget);
            }
            
            const contentBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
            
            // Sender name (only for others if we have a name)
            if (!isMe && msg.senderName) {
                const nameLabel = new QLabel({ label: `<span size="small" weight="bold">${msg.senderName}</span>`, useMarkup: true });
                nameLabel.widget.halign = Gtk.Align.START;
                nameLabel.widget.opacity = 0.6;
                nameLabel.widget.margin_bottom = 2;
                nameLabel.widget.margin_start = 10;
                contentBox.append(nameLabel.widget);
            }
            
            // Bubble
            const bubbleBox = new Gtk.Box();
            bubbleBox.add_css_class('chat-bubble');
            bubbleBox.add_css_class(isMe ? 'chat-bubble-me' : 'chat-bubble-other');
            
            const textLabel = new Gtk.Label({ label: msg.text, wrap: true });
            textLabel.set_xalign(0);
            bubbleBox.append(textLabel);
            
            // Timestamp
            const timeLabel = new Gtk.Label({ label: this.formatTime(msg.timestamp) });
            timeLabel.add_css_class('chat-timestamp');
            timeLabel.set_xalign(isMe ? 1 : 0);
            
            if (isMe) {
                contentBox.halign = Gtk.Align.END;
                rowBox.halign = Gtk.Align.END;
            } else {
                contentBox.halign = Gtk.Align.START;
                rowBox.halign = Gtk.Align.START;
            }
            
            contentBox.append(bubbleBox);
            contentBox.append(timeLabel);
            
            rowBox.append(contentBox);
            
            this.listBox.append(rowBox);
        });
        
        // Scroll to bottom on initial render/update
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            const vadj = this.scrolledWindow.get_vadjustment();
            vadj.set_value(vadj.get_upper() - vadj.get_page_size());
            return GLib.SOURCE_REMOVE;
        });
    }
    
    formatTime(isoString) {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch(e) {
            return '';
        }
    }
}
