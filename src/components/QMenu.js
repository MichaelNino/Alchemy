import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QMenu extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Popover());
        
        this.box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.set_child(this.box);
        
        if (props.modelValue !== undefined) {
            this.widget.connect('closed', () => {
                props.modelValue.value = false;
            });
            
            effect(() => {
                if (props.modelValue.value) {
                    this.widget.popup();
                } else {
                    this.widget.popdown();
                }
            });
        }
    }
    
    mount(parentWidget) {
        this.widget.set_parent(parentWidget);
        
        const attachCleanup = (rootWidget) => {
            if (rootWidget && rootWidget.connect && !this._cleanupConnected) {
                this._cleanupConnected = true;
                rootWidget.connect('close-request', () => {
                    this.widget.unparent();
                    return false;
                });
            }
        };

        const root = parentWidget.get_root();
        if (root) {
            attachCleanup(root);
        } else {
            const sigId = parentWidget.connect('notify::root', () => {
                const newRoot = parentWidget.get_root();
                if (newRoot) {
                    attachCleanup(newRoot);
                    parentWidget.disconnect(sigId);
                }
            });
        }
    }
    
    append(childComponent) {
        this.children.push(childComponent);
        this.box.append(childComponent.widget);
    }
}
