import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

import { ref, computed, effect } from '../../src/index.js';
import { 
    QBtn, QLayout, QCard, QCardSection, 
    QList, QItem, QDialog, QLabel, QToolbar, QDrawer,
    QTabs, QTab, QSpinner, QProgressBar, QNotify, QTable, QToggle
} from '../../src/index.js';

const app = new Gtk.Application({
    application_id: 'org.alchemy.Demo',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({
        application: app,
        title: 'Alchemy Framework Dashboard',
        default_width: 800,
        default_height: 600
    });

    // Main window layout (vertical box)
    const rootLayout = new QLayout();
    
    // Header
    const toolbar = new QToolbar({ title: 'Alchemy Admin' });
    
    // Toggle Drawer Button
    const isDrawerOpen = ref(true);
    const toggleDrawerBtn = new QBtn({ 
        label: '☰', 
        onClick: () => { isDrawerOpen.value = !isDrawerOpen.value; } 
    });
    toolbar.prepend(toggleDrawerBtn);
    
    rootLayout.append(toolbar);
    
    // Paned/Overlay for Drawer + Content
    const bodyBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    rootLayout.widget.append(bodyBox);
    
    // Drawer
    const drawer = new QDrawer({ modelValue: isDrawerOpen });
    const drawerList = new QList();
    const navItem1 = new QItem();
    navItem1.append(new QLabel({ label: 'Dashboard' }));
    const navItem2 = new QItem();
    navItem2.append(new QLabel({ label: 'Settings' }));
    drawerList.append(navItem1);
    drawerList.append(navItem2);
    drawer.append(drawerList);
    
    bodyBox.append(drawer.widget);
    
    // Content Area
    const contentBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, hexpand: true });
    bodyBox.append(contentBox);
    
    // Tabs
    const activeTab = ref('table');
    const tabs = new QTabs({ modelValue: activeTab });
    tabs.append(new QTab({ name: 'table', label: 'Data View' }));
    tabs.append(new QTab({ name: 'feedback', label: 'Feedback & Modals' }));
    
    // The margin provides some padding inside the content area
    tabs.widget.margin_top = 10;
    tabs.widget.margin_start = 10;
    contentBox.append(tabs.widget);
    
    const contentStack = new Gtk.Stack({ transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT });
    contentStack.margin_top = 20;
    contentStack.margin_start = 10;
    contentBox.append(contentStack);
    
    // TAB 1: Data View (Table, Progress)
    const tablePage = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    contentStack.add_named(tablePage, 'table');
    
    const tableCard = new QCard();
    const tableSection = new QCardSection();
    
    const columns = [
        { name: 'id', label: 'ID', field: 'id' },
        { name: 'name', label: 'Name', field: 'name' },
        { name: 'status', label: 'Status', field: 'status' }
    ];
    
    const rows = ref([
        { id: 1, name: 'QBtn porting', status: 'Done' },
        { id: 2, name: 'QTable implementation', status: 'In Progress' },
        { id: 3, name: 'Reactivity Engine', status: 'Done' }
    ]);
    
    const table = new QTable({ columns, rows });
    tableSection.append(new QLabel({ label: '<b>Framework Progress</b>', useMarkup: true }));
    tableSection.append(table);
    
    const progress = ref(0.66);
    tableSection.append(new QLabel({ label: 'Overall Completion:' }));
    tableSection.append(new QProgressBar({ value: progress }));
    
    tableCard.append(tableSection);
    tablePage.append(tableCard.widget);
    
    // TAB 2: Feedback
    const feedbackPage = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    contentStack.add_named(feedbackPage, 'feedback');
    
    const feedbackCard = new QCard();
    const feedbackSection = new QCardSection();
    
    // Toast Notify
    feedbackSection.append(new QBtn({ 
        label: 'Show Toast Notification', 
        onClick: () => {
            QNotify.create('Hello from Alchemy Framework!');
        }
    }));
    
    // Spinner
    const isSpinning = ref(false);
    feedbackSection.append(new QToggle({ label: 'Toggle Spinner', modelValue: isSpinning }));
    feedbackSection.append(new QSpinner({ spinning: isSpinning, size: 40 }));
    
    feedbackCard.append(feedbackSection);
    feedbackPage.append(feedbackCard.widget);
    
    // Link activeTab to Stack
    effect(() => {
        contentStack.set_visible_child_name(activeTab.value);
    });
    
    win.set_child(rootLayout.widget);
    win.present();
});

app.run([]);
