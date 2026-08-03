# QDiagram & DiagramAdapters

## Overview
`QDiagram` is a native GTK4 drag-and-drop node graph rendering component for the Alchemy Framework. It allows you to display diagrams with interconnected nodes and draggable boxes.

`DiagramAdapters` provide parsing and serialization for diagram specifications. Currently, it supports `BPMNAdapter`.

## Usage
```javascript
import { QDiagram, BPMNAdapter, ref } from 'alchemy';

const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="Process_1">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
    <bpmn:task id="Task_1" name="My Task" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
  </bpmn:process>
</bpmn:definitions>`;

// Parse BPMN into QDiagram's internal format
const diagramData = ref(BPMNAdapter.parse(bpmnXml));

const diagram = new QDiagram({
    modelValue: diagramData
});
```

## Props (`QDiagram`)
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (Object) | Reactive object containing `{ nodes: [], edges: [] }`. Nodes must have `id`, `label`, `x`, `y`. Edges must have `source`, `target`. |

## Interactivity
- Nodes are fully draggable. Dragging a node automatically redraws the connecting lines (edges).

## Limitations (V1)
- Infinite canvas is not fully supported; canvas is 2000x2000 pixels.
- Edge routing is simple (direct bezier curve/straight line) and does not intelligently avoid other nodes.
- BPMN Adapter parses basic shapes (tasks, events, gateways) but ignores nested sub-processes and complex DI coordinates.
