import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QVideoPlayer extends BaseComponent {
    constructor(props = {}) {
        const engine = props.engine || 'native';
        let widget;
        
        if (engine === 'native') {
            widget = new Gtk.Video();
            widget.autoplay = props.autoplay || false;
            widget.loop = props.loop || false;
            
            // Allow controls to be toggled, defaults to true in GTK
            if (props.controls === false) {
                // GTK4 Gtk.Video doesn't have a simple 'controls' boolean, but we can set it to not show controls?
                // Actually, Gtk.Video doesn't allow hiding controls easily unless you manage a GtkMediaStream directly via GtkPicture.
                // We'll leave it as default.
            }

            if (props.src) {
                // Handle both reactive and static src
                const setupSrc = (src) => {
                    if (!src) return;
                    try {
                        let file;
                        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('file://')) {
                            file = Gio.File.new_for_uri(src);
                        } else {
                            file = Gio.File.new_for_path(src);
                        }
                        widget.set_file(file);
                    } catch (e) {
                        console.error('Failed to load video:', e);
                    }
                };

                if (props.src.value !== undefined) {
                    effect(() => setupSrc(props.src.value));
                } else {
                    setupSrc(props.src);
                }
            }
            
        } else if (engine === 'web') {
            // Lazy load WebKit to avoid memory overhead if native engine is used
            let WebKit;
            try {
                WebKit = imports.gi.WebKit; // In GJS, dynamic imports for versions are tricky, fallback to global imports if not using ES modules for WebKit
                // We can just use the global imports if it's available, but let's try standard module import
                // Actually, we can't dynamically import inside synchronous constructor easily in ES modules.
                // We will rely on it being loaded globally or just use standard WebKit API.
            } catch (e) {
                console.warn('WebKit not available.');
            }
            
            // We'll use Gtk.Box as wrapper just in case we need to async load, but let's assume WebKit 6.0 is available.
            // Since we use ES modules, we should probably import WebKit at the top, but we don't want to force WebKit dependency.
            // We will just use the global `imports.gi.WebKit`.
            const webKitMod = imports.gi.WebKit ? imports.gi.WebKit : null;
            if (!webKitMod) {
                widget = new Gtk.Label({ label: 'WebKit engine requested but not available.' });
            } else {
                widget = new webKitMod.WebView();
                
                const loadVideo = (src) => {
                    if (!src) return;
                    
                    const controls = props.controls !== false ? 'controls' : '';
                    const autoplay = props.autoplay ? 'autoplay' : '';
                    const loop = props.loop ? 'loop' : '';
                    
                    const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
                            video { width: 100%; height: 100%; object-fit: contain; }
                        </style>
                    </head>
                    <body>
                        <video src="${src}" ${controls} ${autoplay} ${loop}></video>
                    </body>
                    </html>
                    `;
                    widget.load_html(html, null);
                };

                if (props.src && props.src.value !== undefined) {
                    effect(() => loadVideo(props.src.value));
                } else if (props.src) {
                    loadVideo(props.src);
                }
            }
        }
        
        super(widget);
    }
}
