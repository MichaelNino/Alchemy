import WebKit from 'gi://WebKit?version=6.0';
import { QWebView } from './QWebView.js';
import { effect, ref } from '../reactivity.js';

const BPMN_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>BPMN Viewer</title>
    <!-- bpmn-js viewer -->
    <script src="https://unpkg.com/bpmn-js@18.0.0/dist/bpmn-viewer.production.min.js"></script>
    <style>
        html, body, #canvas {
            height: 100%;
            padding: 0;
            margin: 0;
            background: white; /* You can make this transparent for dark mode support later */
        }
    </style>
</head>
<body>
    <div id="canvas"></div>
    <script>
        var viewer = new BpmnJS({
            container: '#canvas'
        });

        async function openDiagram(bpmnXML) {
            try {
                await viewer.importXML(bpmnXML);
                var canvas = viewer.get('canvas');
                canvas.zoom('fit-viewport');
            } catch (err) {
                console.error('could not import BPMN 2.0 diagram', err);
            }
        }
    </script>
</body>
</html>
`;

export class QDiagram extends QWebView {
    constructor(props = {}) {
        super({ html: BPMN_HTML });
        
        this.modelValue = props.modelValue || ref('');
        this._isLoaded = false;
        
        // Wait for WebKit to finish loading the HTML payload
        this.widget.connect('load-changed', (web_view, load_event) => {
            if (load_event === WebKit.LoadEvent.FINISHED) {
                this._isLoaded = true;
                this.renderDiagram();
            }
        });
        
        // React to modelValue changes
        effect(() => {
            if (this._isLoaded) {
                this.renderDiagram();
            }
        });
    }
    
    renderDiagram() {
        const xml = this.modelValue.value;
        if (!xml) return;
        
        // Escape backticks, slashes, and template literals for JS evaluation
        const escapedXml = xml
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');
            
        this.evaluateScript(`openDiagram(\`${escapedXml}\`);`);
    }
}
