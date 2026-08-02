import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

import { ref, effect, computed } from '../../src/index.js';
import { 
    QBtn, QLayout, QCard, QCardSection, 
    QList, QItem, QLabel, QToolbar, QDrawer,
    QTabs, QTab, QTable,
    QIcon, QAvatar, QSelect, QSlider, QMenu,
    QInput, QForm, QTree, QCheckbox, QRadio, QToggle,
    QDialog, QNotify, QSpinner, QProgressBar, QWebView, QAudioPlayer,
    QDragSource, QDropTarget
} from '../../src/index.js';

// --- Page Builders ---

function buildIntroPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    const card = new QCard();
    const section = new QCardSection();
    
    const headerBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 15 });
    
    const avatar = new QAvatar({ size: 80 });
    avatar.append(new QIcon({ name: 'applications-engineering-symbolic', size: 48 }));
    headerBox.append(avatar.widget);
    
    const titleBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 5 });
    titleBox.append(new QLabel({ label: '<span size="x-large" weight="bold">Alchemy Framework</span>', useMarkup: true }).widget);
    titleBox.append(new QLabel({ label: 'A Quasar-inspired UI Framework for GJS & GTK4' }).widget);
    headerBox.append(titleBox);
    
    section.append({ widget: headerBox });
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 15, margin_bottom: 15 }) });
    
    section.append(new QLabel({ 
        label: 'Welcome to the comprehensive showcase of Alchemy. Use the sidebar to explore all native GTK4 components wrapped in a familiar, Vue-like composition API.',
        useMarkup: false
    }));
    
    card.append(section);
    page.append(card.widget);
    
    return page;
}

function buildLayoutPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    const card = new QCard();
    const section = new QCardSection();
    
    section.append(new QLabel({ label: '<b>Nested Tabs</b>', useMarkup: true }));
    
    const activeTab = ref('tab1');
    const tabs = new QTabs({ modelValue: activeTab });
    tabs.append(new QTab({ name: 'tab1', label: 'First Tab' }));
    tabs.append(new QTab({ name: 'tab2', label: 'Second Tab' }));
    section.append(tabs);
    
    const stack = new Gtk.Stack({ transition_type: Gtk.StackTransitionType.CROSSFADE });
    stack.margin_top = 10;
    
    const tab1Box = new Gtk.Box();
    tab1Box.append(new QLabel({ label: 'Content for the first tab...' }).widget);
    stack.add_named(tab1Box, 'tab1');
    
    const tab2Box = new Gtk.Box();
    tab2Box.append(new QLabel({ label: 'Alternative content for the second tab!' }).widget);
    stack.add_named(tab2Box, 'tab2');
    
    effect(() => { stack.set_visible_child_name(activeTab.value); });
    section.append({ widget: stack });
    
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 20, margin_bottom: 20 }) });
    section.append(new QLabel({ label: '<b>Popover Menus</b>', useMarkup: true }));
    
    const isMenuOpen = ref(false);
    const menuBtn = new QBtn({ label: 'Open QMenu ▾', onClick: () => { isMenuOpen.value = true; } });
    
    const menu = new QMenu({ modelValue: isMenuOpen });
    const menuList = new QList();
    const m1 = new QItem(); m1.append(new QLabel({ label: 'Profile' }));
    const m2 = new QItem(); m2.append(new QLabel({ label: 'Settings' }));
    const m3 = new QItem(); m3.append(new QLabel({ label: 'Logout' }));
    menuList.append(m1); menuList.append(m2); menuList.append(m3);
    
    menu.append(menuList);
    menu.mount(menuBtn.widget);
    
    section.append(menuBtn);
    
    card.append(section);
    page.append(card.widget);
    
    return page;
}

function buildFormsPage(win) {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    const card = new QCard();
    const section = new QCardSection();
    
    const form = new QForm({
        onSubmit: () => {
            const dialog = new Gtk.MessageDialog({
                transient_for: win, modal: true,
                message_type: Gtk.MessageType.INFO,
                buttons: Gtk.ButtonsType.OK,
                text: 'Form validates successfully!'
            });
            dialog.connect('response', () => dialog.close());
            dialog.present();
        }
    });
    
    form.append(new QLabel({ label: '<b>Input Validation</b>', useMarkup: true }));
    
    const username = ref('');
    form.append(new QInput({
        placeholder: 'Username (min 4 chars)',
        modelValue: username,
        rules: [
            val => (val && val.length > 0) || 'Required',
            val => val.length >= 4 || 'Min 4 characters'
        ]
    }));
    
    form.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });
    form.append(new QLabel({ label: '<b>Selectors &amp; Toggles</b>', useMarkup: true }));
    
    const fruit = ref('Apple');
    form.append(new QSelect({ options: ['Apple', 'Banana', 'Cherry'], modelValue: fruit }));
    
    const isReady = ref(false);
    form.append(new QToggle({ label: 'I am ready', modelValue: isReady }));
    
    const acceptTerms = ref(false);
    form.append(new QCheckbox({ label: 'Accept Terms', modelValue: acceptTerms }));
    
    form.append(new QLabel({ label: 'Role:' }));
    const role = ref('User');
    form.append(new QRadio({ label: 'User', value: 'User', modelValue: role }));
    form.append(new QRadio({ label: 'Admin', value: 'Admin', modelValue: role }));
    
    form.append(new QLabel({ label: 'Volume:' }));
    const volume = ref(50);
    form.append(new QSlider({ min: 0, max: 100, step: 1, modelValue: volume }));
    
    form.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });
    
    form.append(new QBtn({ label: 'Submit Form', onClick: () => form.submit() }));
    
    section.append(form);
    card.append(section);
    page.append(card.widget);
    
    return page;
}

function buildDataPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    
    // Split view using a Box
    const splitBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 20 });
    page.append(splitBox);
    
    // Table Side
    const tableBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10, hexpand: true });
    
    const tableHeader = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 20 });
    tableHeader.append(new QLabel({ label: '<b>Paginated QTable</b>', useMarkup: true }).widget);
    
    const tableFilter = ref('');
    const searchInput = new QInput({ placeholder: 'Search table...', modelValue: tableFilter });
    searchInput.widget.hexpand = true;
    tableHeader.append(searchInput.widget);
    
    tableBox.append(tableHeader);
    
    const columns = [
        { name: 'id', label: 'ID', field: 'id', type: 'integer' },
        { name: 'name', label: 'Product', field: 'name' },
        { name: 'price', label: 'Price', field: 'price', type: 'currency' },
        { name: 'rating', label: 'Rating', field: 'rating', type: 'decimal' },
        { name: 'added', label: 'Added (Date)', field: 'added', type: 'date' }
    ];
    
    const rowData = [];
    const baseDate = new Date();
    for (let i = 1; i <= 25; i++) {
        rowData.push({ 
            id: i, 
            name: `Item ${i}`, 
            price: Math.random() * 1000 + 10,
            rating: Math.random() * 5,
            added: new Date(baseDate.getTime() - Math.random() * 10000000000).toISOString()
        });
    }
    const rows = ref(rowData);
    const pagination = ref({ page: 1, rowsPerPage: 8, sortBy: null, descending: false });
    
    tableBox.append(new QTable({ columns, rows, pagination, filter: tableFilter }).widget);
    
    // Progress bar linked to pagination
    const progress = computed(() => {
        const totalPages = Math.ceil(rowData.length / 8);
        return pagination.value.page / totalPages;
    });
    const progBar = new QProgressBar({ value: progress });
    progBar.widget.margin_top = 10;
    tableBox.append(progBar.widget);
    
    splitBox.append(tableBox);
    splitBox.append(new Gtk.Separator({ orientation: Gtk.Orientation.VERTICAL }));
    
    // Tree Side
    const treeBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10, hexpand: true });
    treeBox.append(new QLabel({ label: '<b>File Explorer (QTree)</b>', useMarkup: true }).widget);
    
    const treeData = ref([
        {
            label: 'src',
            children: [
                { label: 'components', children: [{ label: 'QBtn.js' }, { label: 'QTable.js' }] },
                { label: 'index.js' }
            ]
        },
        {
            label: 'examples',
            children: [{ label: 'demo-app', children: [{ label: 'main.js' }] }]
        }
    ]);
    
    const treeScroll = new Gtk.ScrolledWindow({ vexpand: true });
    treeScroll.set_child(new QTree({ nodes: treeData }).widget);
    treeBox.append(treeScroll);
    
    splitBox.append(treeBox);
    
    return page;
}

function buildFeedbackPage(win) {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    const card = new QCard();
    const section = new QCardSection();
    
    section.append(new QLabel({ label: '<b>Modals &amp; Dialogs</b>', useMarkup: true }));
    
    const isDialogOpen = ref(false);
    section.append(new QBtn({ label: 'Open QDialog', onClick: () => { isDialogOpen.value = true; } }));
    
    const dialog = new QDialog({ title: 'Important Alert', modelValue: isDialogOpen, root: win });
    dialog.append(new QLabel({ label: 'This is a native GTK modal controlled via Alchemy reactivity!' }));
    
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 20, margin_bottom: 20 }) });
    section.append(new QLabel({ label: '<b>Toast Notifications</b>', useMarkup: true }));
    
    section.append(new QBtn({ 
        label: 'Show QNotify', 
        onClick: () => { QNotify.create('Task completed successfully!'); } 
    }));
    
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 20, margin_bottom: 20 }) });
    section.append(new QLabel({ label: '<b>Spinners</b>', useMarkup: true }));
    
    const isSpinning = ref(false);
    section.append(new QToggle({ label: 'Toggle Loading State', modelValue: isSpinning }));
    const spinner = new QSpinner({ spinning: isSpinning, size: 32 });
    spinner.widget.margin_top = 10;
    section.append(spinner);
    
    card.append(section);
    page.append(card.widget);
    
    return page;
}

function buildWebPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    const card = new QCard();
    const section = new QCardSection();
    
    section.append(new QLabel({ label: '<b>QWebView Integration</b>', useMarkup: true }));
    
    const urlRef = ref('https://quasar.dev/');
    const inputUrl = ref('https://quasar.dev/');
    
    const controlBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    controlBox.margin_bottom = 10;
    
    controlBox.append(new QLabel({ label: 'URL:' }).widget);
    const urlInput = new QInput({ modelValue: inputUrl, placeholder: 'Enter URL and click Go' });
    urlInput.widget.hexpand = true;
    controlBox.append(urlInput.widget);
    
    controlBox.append(new QBtn({ label: 'Go', onClick: () => { urlRef.value = inputUrl.value; } }).widget);
    
    section.append({ widget: controlBox });
    
    const webView = new QWebView({ url: urlRef });
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });
    
    // Give the webview some height in the card
    const webBox = new Gtk.Box({ vexpand: true, hexpand: true });
    webBox.height_request = 400;
    webBox.append(webView.widget);
    
    section.append({ widget: webBox });
    
    card.append(section);
    page.append(card.widget);
    
    return page;
}

function buildMediaPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    const card = new QCard();
    const section = new QCardSection();
    
    section.append(new QLabel({ label: '<b>QAudioPlayer Integration</b>', useMarkup: true }));
    section.append(new QLabel({ label: 'A highly extensible, HTML5-like native audio player. Currently using the GStreamer engine.' }));
    
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });

    // Use a royalty-free test audio stream
    const testAudioUri = ref('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    
    const audioPlayer = new QAudioPlayer({ src: testAudioUri });
    section.append(audioPlayer);

    card.append(section);
    page.append(card.widget);
    
    return page;
}

function buildKanbanPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    
    // Header
    const headerCard = new QCard();
    const headerSec = new QCardSection();
    headerSec.append(new QLabel({ label: '<b>Kanban Board (Drag &amp; Drop)</b>', useMarkup: true }));
    headerCard.append(headerSec);
    page.append(headerCard.widget);

    // State
    const tasks = ref([
        { id: 1, title: 'Design Database Schema', status: 'todo' },
        { id: 2, title: 'Implement DnD Controllers', status: 'in-progress' },
        { id: 3, title: 'Create QAudioPlayer', status: 'done' },
        { id: 4, title: 'Write Documentation', status: 'todo' },
        { id: 5, title: 'Write Unit Tests', status: 'todo' },
        { id: 6, title: 'Setup CI/CD Pipeline', status: 'todo' },
        { id: 7, title: 'Fix Header Alignment', status: 'todo' },
        { id: 8, title: 'Update README Examples', status: 'in-progress' },
        { id: 9, title: 'Initial Project Setup', status: 'done' },
        { id: 10, title: 'Review Pull Requests', status: 'todo' },
        { id: 11, title: 'Deploy to Staging', status: 'todo' }
    ]);

    // Board container
    const board = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 20, hexpand: true, vexpand: true, homogeneous: true });
    
    const statuses = [
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Done' }
    ];

    statuses.forEach(col => {
        // Column Container
        const colBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10, hexpand: true, vexpand: true });
        
        // Column Title
        const titleLabel = new QLabel({ label: `<b>${col.label}</b>`, useMarkup: true });
        titleLabel.widget.margin_bottom = 10;
        colBox.append(titleLabel.widget);
        
        // Make column a drop target
        new QDropTarget({ widget: colBox }, {
            onDrop: (payload) => {
                const taskId = typeof payload === 'object' ? payload.id : parseInt(payload);
                const taskList = tasks.value;
                const task = taskList.find(t => t.id === taskId);
                if (task && task.status !== col.id) {
                    task.status = col.id;
                    // Trigger reactivity by assigning a new array reference
                    tasks.value = [...taskList];
                }
            }
        });

        // Scrollable window
        const scroll = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
        });

        // Reactive inner container for tasks
        const tasksContainer = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10, vexpand: true });
        scroll.set_child(tasksContainer);
        colBox.append(scroll);

        effect(() => {
            // Clear current tasks
            let child = tasksContainer.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                tasksContainer.remove(child);
                child = next;
            }

            // Render tasks for this column
            const colTasks = tasks.value.filter(t => t.status === col.id);
            colTasks.forEach(task => {
                const card = new QCard();
                const sec = new QCardSection();
                sec.append(new QLabel({ label: task.title }));
                card.append(sec);
                
                // Add margins for aesthetics
                card.widget.margin_bottom = 5;

                // Make card a drag source
                new QDragSource(card, { payload: JSON.stringify({ id: task.id }) });
                
                tasksContainer.append(card.widget);
            });
        });
        
        // Wrap column in a styled card for visual boundary
        const colCard = new QCard();
        colCard.widget.hexpand = true;
        colCard.widget.vexpand = true;
        
        const colSec = new QCardSection();
        colSec.widget.vexpand = true;
        colSec.append({ widget: colBox });
        colCard.append(colSec);

        board.append(colCard.widget);
    });

    page.append(board);
    return page;
}

// --- Main App Initialization ---

const app = new Gtk.Application({
    application_id: 'org.alchemy.Showcase',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({
        application: app,
        title: 'Alchemy Framework Showcase',
        default_width: 900,
        default_height: 650
    });

    const rootLayout = new QLayout();
    
    // Header
    const toolbar = new QToolbar({ title: 'Alchemy Showcase' });
    const isDrawerOpen = ref(true);
    const toggleDrawerBtn = new QBtn({ onClick: () => { isDrawerOpen.value = !isDrawerOpen.value; } });
    toggleDrawerBtn.widget.set_child(new QIcon({ name: 'open-menu-symbolic' }).widget);
    toggleDrawerBtn.setTooltip('Toggle Navigation Menu');
    toolbar.prepend(toggleDrawerBtn);
    rootLayout.append(toolbar);
    
    const bodyBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    rootLayout.widget.append(bodyBox);
    
    // Drawer Navigation
    const drawer = new QDrawer({ modelValue: isDrawerOpen });
    const drawerList = new QList();
    
    const navItems = [
        { id: 'intro', label: 'Introduction', icon: 'help-about-symbolic' },
        { id: 'layout', label: 'Layout & Nav', icon: 'view-grid-symbolic' },
        { id: 'forms', label: 'Forms & Validation', icon: 'format-text-direction-ltr-symbolic' },
        { id: 'data', label: 'Data & Content', icon: 'view-list-symbolic' },
        { id: 'feedback', label: 'Feedback & Modals', icon: 'dialog-information-symbolic' },
        { id: 'web', label: 'Web Components', icon: 'applications-internet-symbolic' },
        { id: 'media', label: 'Media Players', icon: 'audio-x-generic-symbolic' },
        { id: 'kanban', label: 'Kanban Board', icon: 'view-grid-symbolic' }
    ];
    
    const activePage = ref('intro');
    
    navItems.forEach(item => {
        const qItem = new QItem();
        qItem.append(new QIcon({ name: item.icon }));
        qItem.append(new QLabel({ label: item.label }));
        
        const click = new Gtk.GestureClick();
        click.connect('pressed', () => { activePage.value = item.id; });
        qItem.widget.add_controller(click);
        
        // Simple highlighting
        effect(() => {
            if (activePage.value === item.id) {
                qItem.widget.add_css_class('suggested-action');
            } else {
                qItem.widget.remove_css_class('suggested-action');
            }
        });
        
        drawerList.append(qItem);
    });
    
    drawer.append(drawerList);
    bodyBox.append(drawer.widget);
    
    // Content Area (Stack)
    const contentStack = new Gtk.Stack({ transition_type: Gtk.StackTransitionType.SLIDE_UP_DOWN });
    contentStack.margin_top = 20;
    contentStack.margin_start = 20;
    contentStack.margin_end = 20;
    contentStack.margin_bottom = 20;
    contentStack.hexpand = true;
    bodyBox.append(contentStack);
    
    contentStack.add_named(buildIntroPage(), 'intro');
    contentStack.add_named(buildLayoutPage(), 'layout');
    contentStack.add_named(buildFormsPage(win), 'forms');
    contentStack.add_named(buildDataPage(), 'data');
    contentStack.add_named(buildFeedbackPage(win), 'feedback');
    contentStack.add_named(buildWebPage(), 'web');
    contentStack.add_named(buildMediaPage(), 'media');
    contentStack.add_named(buildKanbanPage(), 'kanban');
    
    effect(() => {
        contentStack.set_visible_child_name(activePage.value);
    });
    
    win.set_child(rootLayout.widget);
    win.present();
});

app.run([]);
