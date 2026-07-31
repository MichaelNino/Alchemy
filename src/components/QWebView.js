import Gtk from 'gi://Gtk?version=4.0';
import WebKit from 'gi://WebKit?version=6.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QWebView extends BaseComponent {
    constructor(props = {}) {
        const userContentManager = new WebKit.UserContentManager();
        const webView = new WebKit.WebView({
            user_content_manager: userContentManager,
            hexpand: true,
            vexpand: true
        });

        super(webView);
        
        this.userContentManager = userContentManager;

        if (props.url) {
            effect(() => {
                const targetUrl = props.url.value !== undefined ? props.url.value : props.url;
                if (targetUrl && targetUrl.trim() !== '') {
                    // Basic check to ensure valid URI schema
                    let uri = targetUrl;
                    if (!uri.startsWith('http://') && !uri.startsWith('https://') && !uri.startsWith('file://')) {
                        uri = 'https://' + uri;
                    }
                    this.widget.load_uri(uri);
                }
            });
        }

        if (props.html) {
            effect(() => {
                const targetHtml = props.html.value !== undefined ? props.html.value : props.html;
                if (targetHtml) {
                    this.widget.load_html(targetHtml, 'http://localhost/');
                }
            });
        }
    }
    
    evaluateScript(script) {
        this.widget.evaluate_javascript(script, -1, null, null, null, null);
    }
}
