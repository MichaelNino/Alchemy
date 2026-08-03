# QDiagram (WebKit Engine)

## Overview
`QDiagram` is an advanced component that embeds a highly compliant BPMN 2.0 rendering engine into a native GTK widget using WebKit. It is built on top of `QWebView` and uses `bpmn-js` under the hood to ensure full support for the BPMN 2.0 Specification (including Pools, Lanes, Choreographies, and Event Sub-processes).

## Usage
```javascript
import { QDiagram, ref } from 'alchemy';

// Provide a valid, fully compliant BPMN 2.0 XML string
const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Pass the raw XML string into the modelValue
const diagramData = ref(bpmnXml);

const diagram = new QDiagram({
    modelValue: diagramData
});
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (String) | A reactive reference to a string containing valid BPMN 2.0 XML. When updated, the WebKit viewer will automatically render the new diagram. |

## Interactivity
- Includes panning and zooming out of the box via `bpmn-js`'s built-in canvas controls.
- The diagram will automatically fit the viewport on load.

## Architecture Notes
- `QDiagram` inherits from `QWebView`.
- It connects to the `load-changed` signal from WebKit to ensure the DOM is ready before injecting XML.
- It escapes the injected XML string to prevent JavaScript evaluation errors when passed through the WebKit bridge.
- Uses `unpkg.com` CDN to fetch `bpmn-viewer.production.min.js`.
