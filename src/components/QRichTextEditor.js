import Gtk from 'gi://Gtk?version=4.0';
import Pango from 'gi://Pango';
import { BaseComponent } from '../component.js';
import { ref, effect } from '../reactivity.js';
import { QBtn } from './QBtn.js';
import { QToolbar } from './QToolbar.js';
import { HTMLAdapter, MarkdownAdapter } from '../utils/RichTextAdapters.js';

export class QRichTextEditor extends BaseComponent {
    constructor(props = {}) {
        const outerBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        super(outerBox);
        
        this.modelValue = props.modelValue || ref('');
        this.format = props.format || 'html'; // 'html', 'markdown', or 'raw'
        this._isUpdating = false;
        
        // Toolbar
        const toolbar = new QToolbar({ elevated: false });
        toolbar.widget.add_css_class('toolbar');
        
        const btnBold = new QBtn({ icon: 'format-text-bold-symbolic', onClick: () => this.toggleTag('bold') });
        const btnItalic = new QBtn({ icon: 'format-text-italic-symbolic', onClick: () => this.toggleTag('italic') });
        const btnUnderline = new QBtn({ icon: 'format-text-underline-symbolic', onClick: () => this.toggleTag('underline') });
        const btnStrike = new QBtn({ icon: 'format-text-strikethrough-symbolic', onClick: () => this.toggleTag('strikethrough') });
        
        const formatBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        formatBox.add_css_class('linked');
        formatBox.append(btnBold.widget);
        formatBox.append(btnItalic.widget);
        formatBox.append(btnUnderline.widget);
        formatBox.append(btnStrike.widget);
        toolbar.prepend({ widget: formatBox });
        
        // Alignment
        const btnLeft = new QBtn({ icon: 'format-justify-left-symbolic', onClick: () => this.setJustification(Gtk.Justification.LEFT) });
        const btnCenter = new QBtn({ icon: 'format-justify-center-symbolic', onClick: () => this.setJustification(Gtk.Justification.CENTER) });
        const btnRight = new QBtn({ icon: 'format-justify-right-symbolic', onClick: () => this.setJustification(Gtk.Justification.RIGHT) });
        
        const alignBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        alignBox.add_css_class('linked');
        alignBox.append(btnLeft.widget);
        alignBox.append(btnCenter.widget);
        alignBox.append(btnRight.widget);
        toolbar.prepend({ widget: alignBox });
        
        outerBox.append(toolbar.widget);
        
        // Text View
        this.scrolledWindow = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });
        
        this.textView = new Gtk.TextView({
            wrap_mode: Gtk.WrapMode.WORD_CHAR,
            left_margin: 10,
            right_margin: 10,
            top_margin: 10,
            bottom_margin: 10,
            vexpand: true,
            hexpand: true
        });
        
        this.buffer = this.textView.get_buffer();
        
        // Define Custom Tags
        const tagTable = this.buffer.get_tag_table();
        tagTable.add(new Gtk.TextTag({ name: 'bold', weight: Pango.Weight.BOLD }));
        tagTable.add(new Gtk.TextTag({ name: 'italic', style: Pango.Style.ITALIC }));
        tagTable.add(new Gtk.TextTag({ name: 'underline', underline: Pango.Underline.SINGLE }));
        tagTable.add(new Gtk.TextTag({ name: 'strikethrough', strikethrough: true }));
        
        this.scrolledWindow.set_child(this.textView);
        outerBox.append(this.scrolledWindow);
        
        // Sync buffer -> model
        this.buffer.connect('changed', () => {
            if (this._isUpdating) return;
            this._isUpdating = true;
            
            if (this.format === 'html') {
                this.modelValue.value = HTMLAdapter.serialize(this.buffer);
            } else if (this.format === 'markdown') {
                this.modelValue.value = MarkdownAdapter.serialize(this.buffer);
            } else {
                this.modelValue.value = this.buffer.get_text(this.buffer.get_start_iter(), this.buffer.get_end_iter(), false);
            }
            
            this._isUpdating = false;
        });
        
        // Sync model -> buffer
        effect(() => {
            if (this._isUpdating) return;
            this._isUpdating = true;
            
            if (this.format === 'html') {
                HTMLAdapter.deserialize(this.modelValue.value, this.buffer);
            } else if (this.format === 'markdown') {
                MarkdownAdapter.deserialize(this.modelValue.value, this.buffer);
            } else {
                this.buffer.set_text(this.modelValue.value, -1);
            }
            
            this._isUpdating = false;
        });
    }
    
    toggleTag(tagName) {
        const [hasSelection, start, end] = this.buffer.get_selection_bounds();
        if (hasSelection) {
            // Check if tag is already fully applied
            let isApplied = true;
            let iter = start.copy();
            while (iter.compare(end) < 0) {
                if (!iter.has_tag(this.buffer.get_tag_table().lookup(tagName))) {
                    isApplied = false;
                    break;
                }
                iter.forward_char();
            }
            
            if (isApplied) {
                this.buffer.remove_tag_by_name(tagName, start, end);
            } else {
                this.buffer.apply_tag_by_name(tagName, start, end);
            }
        }
    }
    
    setJustification(justification) {
        // We set justification globally for now, or we could use tags per paragraph
        this.textView.set_justification(justification);
    }
}
