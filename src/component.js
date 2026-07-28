import Gtk from 'gi://Gtk?version=4.0';
import { effect } from './reactivity.js';

export class BaseComponent {
    constructor(widget) {
        this.widget = widget;
        this.children = [];
    }

    mount(parentWidget) {
        if (parentWidget.append) {
            parentWidget.append(this.widget);
        } else if (parentWidget.set_child) {
            parentWidget.set_child(this.widget);
        }
    }

    bindProp(propName, refValue) {
        effect(() => {
            this.widget[propName] = refValue.value;
        });
    }

    on(signalName, callback) {
        this.widget.connect(signalName, callback);
    }

    setTooltip(text) {
        this.widget.set_tooltip_text(text);
    }
}
