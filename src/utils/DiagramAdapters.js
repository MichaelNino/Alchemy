export class BPMNAdapter {
    static parse(xmlString) {
        const nodes = [];
        const edges = [];
        
        if (!xmlString) return { nodes, edges };
        
        // Helper to extract attributes via regex (since GJS lacks DOMParser by default)
        const getAttr = (str, attr) => {
            const match = new RegExp(`${attr}="([^"]*)"`).exec(str);
            return match ? match[1] : null;
        };
        
        // Extract basic shapes
        const shapeRegex = /<bpmn:(task|startEvent|endEvent|exclusiveGateway|inclusiveGateway|parallelGateway|userTask|serviceTask)[^>]*id="([^"]*)"[^>]*>/g;
        let match;
        
        const nodeMap = new Map();
        
        while ((match = shapeRegex.exec(xmlString)) !== null) {
            const type = match[1];
            const id = match[2];
            const name = getAttr(match[0], 'name') || id;
            
            const node = {
                id,
                type,
                label: name,
                x: 0,
                y: 0,
                width: 100,
                height: 60
            };
            
            // Adjust sizing based on BPMN conventions
            if (type.includes('Event') || type.includes('Gateway')) {
                node.width = 50;
                node.height = 50;
            }
            
            nodeMap.set(id, node);
            nodes.push(node);
        }
        
        // Extract edges (sequence flow)
        const flowRegex = /<bpmn:sequenceFlow[^>]*id="([^"]*)"[^>]*sourceRef="([^"]*)"[^>]*targetRef="([^"]*)"[^>]*>/g;
        while ((match = flowRegex.exec(xmlString)) !== null) {
            edges.push({
                id: match[1],
                source: match[2],
                target: match[3]
            });
        }
        
        // Try to extract DI coordinates
        const diRegex = /<bpmndi:BPMNShape[^>]*bpmnElement="([^"]*)"[^>]*>[\s\S]*?<dc:Bounds[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*\/>/g;
        while ((match = diRegex.exec(xmlString)) !== null) {
            const elementId = match[1];
            const node = nodeMap.get(elementId);
            if (node) {
                node.x = parseFloat(match[2]);
                node.y = parseFloat(match[3]);
            }
        }
        
        // Auto-layout for nodes without coordinates
        let currentX = 50;
        let currentY = 50;
        nodes.forEach(node => {
            if (node.x === 0 && node.y === 0) {
                node.x = currentX;
                node.y = currentY;
                currentX += node.width + 50;
                if (currentX > 800) {
                    currentX = 50;
                    currentY += 100;
                }
            }
        });
        
        return { nodes, edges };
    }
    
    static serialize(data) {
        const { nodes = [], edges = [] } = data;
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n`;
        xml += `  <bpmn:process id="Process_1" isExecutable="false">\n`;
        
        nodes.forEach(node => {
            const type = node.type || 'task';
            xml += `    <bpmn:${type} id="${node.id}" name="${node.label || node.id}" />\n`;
        });
        
        edges.forEach(edge => {
            xml += `    <bpmn:sequenceFlow id="${edge.id || 'Flow_' + Math.floor(Math.random()*1000)}" sourceRef="${edge.source}" targetRef="${edge.target}" />\n`;
        });
        
        xml += `  </bpmn:process>\n`;
        
        // DI Information
        xml += `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n`;
        xml += `    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n`;
        
        nodes.forEach(node => {
            xml += `      <bpmndi:BPMNShape id="${node.id}_di" bpmnElement="${node.id}">\n`;
            xml += `        <dc:Bounds x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" />\n`;
            xml += `      </bpmndi:BPMNShape>\n`;
        });
        
        // (Not generating edge DI waypoints for simplicity in V1)
        
        xml += `    </bpmndi:BPMNPlane>\n`;
        xml += `  </bpmndi:BPMNDiagram>\n`;
        xml += `</bpmn:definitions>`;
        
        return xml;
    }
}
