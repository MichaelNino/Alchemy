import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';
import { QLabel } from './QLabel.js';
import { QBtn } from './QBtn.js';
import { QDropTarget } from '../utils/QDropTarget.js';
import { QKanbanCard } from './QKanbanCard.js';

/**
 * QKanban Component
 * 
 * A rich Kanban board with drag-and-drop columns.
 * 
 * @param {Object} props
 * @param {Array|Ref} props.columns - The column definitions [{id: 'todo', label: 'To Do'}, ...]
 * @param {Array|Ref} props.tasks - The reactive list of tasks
 * @param {Function} [props.onTaskMove] - Callback when a task is moved
 * @param {Function} [props.onTaskAdd] - Callback when 'add' button clicked on a column
 * @param {Function} [props.onTaskEdit] - Callback when a task's edit menu is clicked
 * @param {Function} [props.onTaskDelete] - Callback when a task's delete menu is clicked
 */
export class QKanban extends BaseComponent {
    constructor(props = {}) {
        const board = new Gtk.Box({ 
            orientation: Gtk.Orientation.HORIZONTAL, 
            spacing: 20, 
            hexpand: true, 
            vexpand: true, 
            homogeneous: true 
        });
        
        super(board);
        
        const cols = props.columns.value !== undefined ? props.columns.value : props.columns;
        
        cols.forEach(col => {
            // Column Container
            const colBox = new Gtk.Box({ 
                orientation: Gtk.Orientation.VERTICAL, 
                spacing: 10, 
                hexpand: true, 
                vexpand: true 
            });
            
            // Give columns a slight background to distinguish them
            colBox.add_css_class('view');
            colBox.margin_top = 10;
            colBox.margin_bottom = 10;
            
            // Column Header
            const headerBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
            headerBox.margin_start = 10;
            headerBox.margin_end = 10;
            headerBox.margin_top = 10;
            
            const titleLabel = new QLabel({ label: `<b>${col.label}</b>`, useMarkup: true });
            titleLabel.widget.hexpand = true;
            titleLabel.widget.halign = Gtk.Align.START;
            headerBox.append(titleLabel.widget);
            
            // Task count badge
            const countLabel = new QLabel({ label: '0' });
            countLabel.widget.add_css_class('dim-label');
            headerBox.append(countLabel.widget);
            
            // Add Task Button
            if (props.onTaskAdd) {
                const addBtn = new QBtn({ icon: 'list-add-symbolic', flat: true });
                addBtn.widget.connect('clicked', () => props.onTaskAdd(col.id));
                headerBox.append(addBtn.widget);
            }
            
            colBox.append(headerBox);
            
            // Scrollable window for tasks
            const scroll = new Gtk.ScrolledWindow({
                hexpand: true,
                vexpand: true,
                hscrollbar_policy: Gtk.PolicyType.NEVER,
                vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            });
            
            // Padding around tasks
            scroll.margin_start = 10;
            scroll.margin_end = 10;
            scroll.margin_bottom = 10;
            
            // Inner container
            const tasksContainer = new Gtk.Box({ 
                orientation: Gtk.Orientation.VERTICAL, 
                spacing: 0, 
                vexpand: true 
            });
            scroll.set_child(tasksContainer);
            colBox.append(scroll);
            
            // Make column a drop target
            new QDropTarget({ widget: colBox }, {
                onDrop: (payload) => {
                    const taskId = typeof payload === 'object' ? payload.id : parseInt(payload);
                    const taskList = props.tasks.value;
                    const task = taskList.find(t => t.id === taskId);
                    
                    if (task && task.status !== col.id) {
                        task.status = col.id;
                        // Trigger reactivity
                        props.tasks.value = [...taskList];
                        
                        if (props.onTaskMove) {
                            props.onTaskMove(task, col.id);
                        }
                    }
                }
            });
            
            board.append(colBox);
            
            // Render logic
            if (props.tasks && props.tasks.value !== undefined) {
                effect(() => {
                    // Update Count
                    const colTasks = props.tasks.value.filter(t => t.status === col.id);
                    countLabel.widget.set_label(`${colTasks.length}`);
                    
                    // Clear current tasks
                    let child = tasksContainer.get_first_child();
                    while (child) {
                        const next = child.get_next_sibling();
                        tasksContainer.remove(child);
                        child = next;
                    }
                    
                    // Render new tasks
                    colTasks.forEach(task => {
                        const card = new QKanbanCard(task, {
                            onEdit: props.onTaskEdit,
                            onDelete: props.onTaskDelete
                        });
                        tasksContainer.append(card.widget);
                    });
                });
            }
        });
    }
}
