# QDiagram (WebKit Engine)

## Overview
`QDiagram` is an advanced component that embeds highly compliant diagram rendering engines into a native GTK widget using WebKit. It is built on top of `QWebView`.
By specifying the `format` property, it dynamically loads either:
- **`bpmn-js`**: For full BPMN 2.0 Specification support (Pools, Lanes, Choreographies).
- **`mermaid.js`**: For text-to-diagram Flowcharts and UML models (Sequence, Class, State).

## Usage
```javascript
import { QDiagram, ref } from 'alchemy';

// 1. BPMN Usage
const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ...>
  <!-- Full BPMN XML -->
</bpmn:definitions>`;

const bpmnDiagram = new QDiagram({
    modelValue: ref(bpmnXml),
    format: 'bpmn'
});

// 2. Flowchart Usage
const flowchartSyntax = `graph TD
    A[Start] --> B{Is it raining?}
    B -- Yes --> C[Take Umbrella]
    B -- No --> D[Enjoy Sun]`;

const flowDiagram = new QDiagram({
    modelValue: ref(flowchartSyntax),
    format: 'flowchart'
});

// 3. UML Usage
const umlSyntax = `classDiagram
    Animal <|-- Duck
    class Duck{
      +swim()
      +quack()
    }`;

const umlDiagram = new QDiagram({
    modelValue: ref(umlSyntax),
    format: 'uml'
});
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (String) | A reactive reference to a string containing valid syntax for the specified format. |
| `format` | String | Defines the engine to use. Options: `'bpmn'`, `'flowchart'`, `'uml'`. Defaults to `'bpmn'`. |

## Interactivity
- Includes panning and zooming out of the box via the built-in canvas controls of the respective engines.
- The diagram will automatically fit the viewport on load and automatically update when the `modelValue` ref changes.

## Architecture Notes
- `QDiagram` inherits from `QWebView`.
- Uses `unpkg.com` CDN to fetch `bpmn-viewer` and `jsdelivr` to fetch `mermaid.js`.
