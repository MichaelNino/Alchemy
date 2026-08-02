import Gtk from 'gi://Gtk?version=4.0';
import GtkSource from 'gi://GtkSource?version=5';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QCodeViewer extends BaseComponent {
    constructor(props = {}) {
        // We use a ScrolledWindow to ensure it can handle large files
        const scroll = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });
        super(scroll);
        
        // Initialize GtkSource Buffer and View
        this.buffer = new GtkSource.Buffer();
        this.sourceView = new GtkSource.View({ 
            buffer: this.buffer,
            show_line_numbers: true,
            editable: false,
            monospace: true,
            left_margin: 5,
            right_margin: 5,
            top_margin: 5,
            bottom_margin: 5
        });
        
        // Try to set a good looking color scheme if available
        const schemeManager = GtkSource.StyleSchemeManager.get_default();
        let scheme = schemeManager.get_scheme('oblivion') || schemeManager.get_scheme('Adwaita-dark');
        if (scheme) {
            this.buffer.set_style_scheme(scheme);
        }

        scroll.set_child(this.sourceView);

        // Language Manager
        this.langManager = GtkSource.LanguageManager.get_default();

        // Handle reactive code and language
        effect(() => {
            const currentCode = props.code && props.code.value !== undefined ? props.code.value : (props.code || '');
            const currentLang = props.language && props.language.value !== undefined ? props.language.value : (props.language || 'text');
            
            // Set language
            const language = this.langManager.get_language(currentLang);
            if (language) {
                this.buffer.set_language(language);
            }
            
            // Set code text
            this.buffer.set_text(currentCode, -1);
        });
    }
}
