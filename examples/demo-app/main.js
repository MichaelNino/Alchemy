import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

import { ref, effect, computed } from '../../src/index.js';
import { 
    QBtn, QLayout, QHeader, QPageContainer, QRow, QCol, QCard, QCardSection, 
    QList, QItem, QLabel, QToolbar, QDrawer,
    QTabs, QTab, QTable,
    QIcon, QAvatar, QSelect, QSlider, QMenu,
    QInput, QForm, QTree, QCheckbox, QRadio, QToggle,
    QDialog, QNotify, QSpinner, QProgressBar, QWebView, QAudioPlayer,
    QDragSource, QDropTarget, QCodeViewer, QChart, QFile, QVideoPlayer, QKanban, QFormRules, QOptionGroup, QTransfer
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
    
    section.append(new QLabel({ label: '<b>Responsive Grid System (QRow / QCol)</b>', useMarkup: true }));
    section.append(new QLabel({ label: 'Resize the window! This grid automatically stacks vertically on small screens.', margin_bottom: 20 }));
    
    // First Row
    const row1 = new QRow();
    const col1 = new QCol();
    col1.widget.add_css_class('card');
    col1.append(new QLabel({ label: 'Col 1 (Auto)', margin_top: 20, margin_bottom: 20 }));
    
    const col2 = new QCol();
    col2.widget.add_css_class('card');
    col2.append(new QLabel({ label: 'Col 2 (Auto)', margin_top: 20, margin_bottom: 20 }));
    
    row1.append(col1);
    row1.append(col2);
    section.append(row1.widget);

    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 20, margin_bottom: 20 }) });

    // Second Row
    const row2 = new QRow({ stackAt: 'md' });
    const col3 = new QCol();
    col3.widget.add_css_class('card');
    col3.append(new QLabel({ label: 'Stacks at MD (< 1024px)', margin_top: 20, margin_bottom: 20 }));
    
    const col4 = new QCol();
    col4.widget.add_css_class('card');
    col4.append(new QLabel({ label: 'Stacks at MD (< 1024px)', margin_top: 20, margin_bottom: 20 }));
    
    row2.append(col3);
    row2.append(col4);
    section.append(row2.widget);
    
    section.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 20, margin_bottom: 20 }) });
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
    
    // --- 1. Standard Inputs ---
    form.append(new QLabel({ label: '<b>Standard Inputs</b>', useMarkup: true }));
    
    const username = ref('');
    form.append(new QInput({
        placeholder: 'Username',
        modelValue: username,
        rules: [QFormRules.required(), QFormRules.minLength(4)]
    }));

    const password = ref('');
    form.append(new QInput({
        type: 'password',
        placeholder: 'Password',
        modelValue: password,
        rules: [QFormRules.required(), QFormRules.minLength(8)]
    }));
    
    const email = ref('');
    form.append(new QInput({
        type: 'email',
        placeholder: 'Email Address',
        modelValue: email,
        rules: [QFormRules.required(), QFormRules.email()]
    }));

    const phone = ref('');
    form.append(new QInput({
        type: 'tel',
        placeholder: 'Phone Number',
        modelValue: phone,
        rules: [QFormRules.phone()]
    }));

    const website = ref('');
    form.append(new QInput({
        type: 'url',
        placeholder: 'Website URL',
        modelValue: website,
        rules: [QFormRules.url()]
    }));
    
    form.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });
    
    // --- 2. Date & Time Pickers ---
    form.append(new QLabel({ label: '<b>Native Pickers</b>', useMarkup: true }));
    
    const dateRef = ref('');
    form.append(new QInput({
        type: 'date',
        placeholder: 'Select a Date...',
        modelValue: dateRef,
        rules: [QFormRules.required()]
    }));
    
    const timeRef = ref('');
    form.append(new QInput({
        type: 'time',
        placeholder: 'Select a Time...',
        modelValue: timeRef,
        rules: [QFormRules.required()]
    }));

    form.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });

    // --- 3. Selectors ---
    form.append(new QLabel({ label: '<b>Selectors &amp; Toggles</b>', useMarkup: true }));
    
    const fruit = ref('Apple');
    form.append(new QSelect({ options: ['Apple', 'Banana', 'Cherry'], modelValue: fruit }));
    
    const isReady = ref(false);
    form.append(new QToggle({ label: 'I am ready', modelValue: isReady }));
    
    const acceptTerms = ref(false);
    form.append(new QCheckbox({ label: 'Accept Terms', modelValue: acceptTerms }));
    
    form.append(new QLabel({ label: 'Role:' }));
    const role = ref('User');
    form.append(new QOptionGroup({
        inline: true,
        modelValue: role,
        options: [
            { label: 'User', value: 'User' },
            { label: 'Admin', value: 'Admin' }
        ]
    }));
    
    form.append(new QLabel({ label: 'Volume:' }));
    const volume = ref(50);
    form.append(new QSlider({ min: 0, max: 100, step: 1, modelValue: volume }));
    
    form.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });

    // --- 4. Transfer List ---
    form.append(new QLabel({ label: '<b>Team Assignment (QTransfer)</b>', useMarkup: true }));
    
    const teamMembers = ref(['user1', 'user3']);
    form.append(new QTransfer({
        modelValue: teamMembers,
        options: [
            { label: 'Alice Smith (user1)', value: 'user1' },
            { label: 'Bob Johnson (user2)', value: 'user2' },
            { label: 'Charlie Brown (user3)', value: 'user3' },
            { label: 'Diana Prince (user4)', value: 'user4' },
            { label: 'Ethan Hunt (user5)', value: 'user5' }
        ]
    }));

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
    
    const audioCard = new QCard();
    const audioSec = new QCardSection();
    
    audioSec.append(new QLabel({ label: '<b>QAudioPlayer Integration</b>', useMarkup: true }));
    audioSec.append(new QLabel({ label: 'A highly extensible, HTML5-like native audio player. Currently using the GStreamer engine.' }));
    audioSec.append({ widget: new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL, margin_top: 10, margin_bottom: 10 }) });

    // Use a royalty-free test audio stream
    const testAudioUri = ref('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    const audioPlayer = new QAudioPlayer({ src: testAudioUri });
    audioSec.append(audioPlayer);
    
    audioCard.append(audioSec);
    page.append(audioCard.widget);

    // QVideoPlayer Native
    const videoCardNative = new QCard();
    const videoSecNative = new QCardSection();
    videoSecNative.append(new QLabel({ label: '<b>QVideoPlayer</b> (Native Gtk.Video engine)', useMarkup: true }));
    
    // Native Gtk.Video player
    const videoPlayerNative = new QVideoPlayer({ 
        src: 'http://vjs.zencdn.net/v/oceans.mp4', 
        engine: 'native',
        controls: true 
    });
    videoPlayerNative.widget.height_request = 200;
    videoSecNative.append(videoPlayerNative);
    videoCardNative.append(videoSecNative);
    page.append(videoCardNative.widget);
    
    // QVideoPlayer Web
    const videoCardWeb = new QCard();
    const videoSecWeb = new QCardSection();
    videoSecWeb.append(new QLabel({ label: '<b>QVideoPlayer</b> (HTML5 WebKit engine)', useMarkup: true }));
    
    // HTML5 WebKit player
    const videoPlayerWeb = new QVideoPlayer({ 
        src: 'http://vjs.zencdn.net/v/oceans.mp4', 
        engine: 'web',
        controls: true 
    });
    videoPlayerWeb.widget.height_request = 200;
    videoSecWeb.append(videoPlayerWeb);
    videoCardWeb.append(videoSecWeb);
    page.append(videoCardWeb.widget);

    return page;
}

function buildKanbanPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });

    // Header
    const headerCard = new QCard();
    const headerSec = new QCardSection();
    headerSec.append(new QLabel({ label: '<b>Kanban Board (QKanban)</b>', useMarkup: true }));
    headerCard.append(headerSec);
    page.append(headerCard.widget);

    // State
    const columns = ref([
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Done' }
    ]);

    const tasks = ref([
        { id: 1, title: 'Design Database Schema', description: 'Create ERD and SQL scripts', status: 'todo', assignee: 'Alice', tags: ['Backend', 'DB'], color: '#e01b24' },
        { id: 2, title: 'Implement DnD Controllers', description: 'Gtk.DropTarget integration', status: 'in-progress', assignee: 'Bob', tags: ['Frontend'], color: '#f6d32d' },
        { id: 3, title: 'Create QAudioPlayer', status: 'done', assignee: 'Charlie', tags: ['Media'], color: '#2ec27e' },
        { id: 4, title: 'Write Documentation', status: 'todo', tags: ['Docs'], color: '#3584e4' },
        { id: 5, title: 'Write Unit Tests', status: 'todo', assignee: 'Alice', color: '#f6d32d' },
        { id: 6, title: 'Setup CI/CD Pipeline', status: 'todo', assignee: 'Dave', color: '#e01b24' },
        { id: 7, title: 'Fix Header Alignment', description: 'Header is off by 2px', status: 'todo', tags: ['Bug'], color: '#e01b24' },
        { id: 8, title: 'Update README Examples', status: 'in-progress', assignee: 'Eve', tags: ['Docs'], color: '#3584e4' },
        { id: 9, title: 'Initial Project Setup', status: 'done', color: '#2ec27e' }
    ]);

    const kanban = new QKanban({
        columns,
        tasks,
        onTaskMove: (task, newStatus) => {
            console.log(`Task ${task.id} moved to ${newStatus}`);
        },
        onTaskAdd: (colId) => {
            console.log(`Add task in column ${colId}`);
            // Mock addition
            const newTasks = [...tasks.value];
            newTasks.push({
                id: Date.now(),
                title: 'New Task',
                status: colId,
                color: '#986a44'
            });
            tasks.value = newTasks;
        },
        onTaskEdit: (task) => {
            console.log(`Edit task ${task.id}`);
            const newTasks = [...tasks.value];
            const idx = newTasks.findIndex(t => t.id === task.id);
            if (idx > -1) {
                newTasks[idx].title = task.title + ' (Edited)';
                tasks.value = newTasks;
            }
        },
        onTaskDelete: (task) => {
            console.log(`Delete task ${task.id}`);
            tasks.value = tasks.value.filter(t => t.id !== task.id);
        }
    });

    page.append(kanban.widget);
    return page;
}

function buildCodeViewerPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    
    // Header
    const headerCard = new QCard();
    const headerSec = new QCardSection();
    headerSec.append(new QLabel({ label: '<b>Native Syntax Highlighting (QCodeViewer)</b>', useMarkup: true }));
    headerSec.append(new QLabel({ label: 'Powered by GtkSourceView 5 for blazingly fast, native syntax parsing.' }));
    headerCard.append(headerSec);
    page.append(headerCard.widget);

    // Languages and Snippets
    const langs = [
        { id: 'markdown', name: 'Markdown', langId: 'markdown', code: '# Hello Markdown\n\nThis is a **markdown** file rendering inside our native QCodeViewer component!\n\n- It is fast\n- It is native\n- It is beautiful' },
        { id: 'html', name: 'HTML', langId: 'html', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Alchemy HTML</title>\n</head>\n<body>\n  <div class="app">\n    <h1>Hello World</h1>\n  </div>\n</body>\n</html>' },
        { id: 'css', name: 'CSS', langId: 'css', code: 'body {\n  margin: 0;\n  padding: 0;\n  background-color: #1e1e1e;\n  color: white;\n}\n\n.app h1 {\n  font-size: 2rem;\n  text-align: center;\n}' },
        { id: 'js', name: 'JavaScript', langId: 'javascript', code: 'import { ref, effect } from "alchemy";\n\nexport function setup() {\n  const count = ref(0);\n  \n  effect(() => {\n    console.log(`Count changed to: ${count.value}`);\n  });\n  \n  return { count };\n}' },
        { id: 'ts', name: 'TypeScript', langId: 'typescript', code: 'interface User {\n  id: number;\n  name: string;\n}\n\nfunction getUser(id: number): User {\n  return {\n    id,\n    name: "Alchemy Developer"\n  };\n}' },
        { id: 'php', name: 'PHP', langId: 'php', code: '<?php\nnamespace Alchemy\\Demo;\n\nclass Server {\n    public function boot(): void {\n        echo "Server is booting up...";\n    }\n}\n\n$app = new Server();\n$app->boot();\n?>' },
        { id: 'java', name: 'Java', langId: 'java', code: 'package org.alchemy.demo;\n\npublic class Application {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n        \n        var list = java.util.List.of(1, 2, 3);\n        list.forEach(System.out::println);\n    }\n}' },
        { id: 'cs', name: 'C#', langId: 'c-sharp', code: 'using System;\nusing System.Linq;\n\nnamespace AlchemyDemo {\n    class Program {\n        static void Main(string[] args) {\n            var numbers = new[] { 1, 2, 3, 4, 5 };\n            var evens = numbers.Where(n => n % 2 == 0);\n            Console.WriteLine($"Evens: {string.Join(", ", evens)}");\n        }\n    }\n}' },
        { id: 'sql', name: 'SQL', langId: 'sql', code: 'SELECT\n    users.id,\n    users.username,\n    COUNT(orders.id) AS total_orders\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id\nWHERE users.active = true\nGROUP BY users.id\nORDER BY total_orders DESC\nLIMIT 10;' },
        { id: 'py', name: 'Python', langId: 'python', code: 'import os\nimport sys\n\ndef main():\n    message = "Welcome to Alchemy"\n    print(f"{message}, Python developer!")\n    \n    for i in range(5):\n        print(f"Iteration {i}")\n\nif __name__ == "__main__":\n    main()' },
        { id: 'cpp', name: 'C++', langId: 'cpp', code: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3, 4, 5};\n    \n    for(const auto& num : nums) {\n        std::cout << "Number: " << num << std::endl;\n    }\n    \n    return 0;\n}' },
        { id: 'rust', name: 'Rust', langId: 'rust', code: 'fn main() {\n    let name = "Rustacean";\n    println!("Hello, {}!", name);\n    \n    let numbers = vec![1, 2, 3];\n    for n in numbers {\n        println!("Num: {}", n);\n    }\n}' },
        { id: 'go', name: 'Go', langId: 'go', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go developer!")\n    \n    nums := []int{1, 2, 3, 4, 5}\n    for i, num := range nums {\n        fmt.Printf("Index: %d, Value: %d\\n", i, num)\n    }\n}' },
        { id: 'kotlin', name: 'Kotlin', langId: 'kotlin', code: 'fun main() {\n    val message = "Hello from Kotlin!"\n    println(message)\n    \n    val numbers = listOf(1, 2, 3)\n    numbers.forEach { println("Number: $it") }\n}' },
        { id: 'perl', name: 'Perl', langId: 'perl', code: '#!/usr/bin/perl\nuse strict;\nuse warnings;\n\nprint "Hello from Perl!\\n";\n\nmy @fruits = ("Apple", "Banana", "Cherry");\nforeach my $fruit (@fruits) {\n    print "Fruit: $fruit\\n";\n}' },
        { id: 'raku', name: 'Raku', langId: 'raku', code: 'use v6;\n\nput "Hello from Raku!";\n\nmy @fruits = <Apple Banana Cherry>;\nfor @fruits -> $fruit {\n    put "Fruit: $fruit";\n}' }
    ];

    const activeTab = ref('markdown');
    const tabs = new QTabs({ modelValue: activeTab });
    
    // Create tabs
    langs.forEach(l => {
        tabs.append(new QTab({ name: l.id, label: l.name }));
    });
    
    page.append(tabs.widget);
    
    // Bind CodeViewer
    const currentCode = computed(() => {
        const lang = langs.find(l => l.id === activeTab.value);
        return lang ? lang.code : '';
    });
    
    const currentLangId = computed(() => {
        const lang = langs.find(l => l.id === activeTab.value);
        return lang ? lang.langId : 'text';
    });
    
    const viewer = new QCodeViewer({ code: currentCode, language: currentLangId });
    viewer.widget.vexpand = true;
    
    const card = new QCard();
    card.widget.vexpand = true;
    const sec = new QCardSection();
    sec.widget.vexpand = true;
    
    sec.append(viewer);
    card.append(sec);
    
    page.append(card.widget);

    return page;
}

function buildChartsPage() {
    const page = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    
    // Header
    const headerCard = new QCard();
    const headerSec = new QCardSection();
    
    const titleBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    titleBox.append(new QLabel({ label: '<b>Native Charts (Cairo)</b>', useMarkup: true }).widget);
    
    const chartData = ref([
        { label: 'Jan', value: 40 },
        { label: 'Feb', value: 25 },
        { label: 'Mar', value: 60 },
        { label: 'Apr', value: 30 },
        { label: 'May', value: 80 }
    ]);
    
    const randBtn = new QBtn({
        label: 'Randomize Data',
        onClick: () => {
            chartData.value = chartData.value.map(d => ({
                label: d.label,
                value: Math.floor(Math.random() * 100) + 10
            }));
        }
    });
    
    // Push button to right
    titleBox.append(new Gtk.Box({ hexpand: true }));
    titleBox.append(randBtn.widget);
    
    headerSec.append({ widget: titleBox });
    headerSec.append(new QLabel({ label: 'Blazingly fast, native GTK4 rendering using Cairo graphics. Zero DOM overhead.' }));
    headerCard.append(headerSec);
    page.append(headerCard.widget);

    // Charts Container
    const grid = new Gtk.Grid({ column_spacing: 20, row_spacing: 20, hexpand: true, vexpand: true });
    
    // 1. Bar Chart
    const barCard = new QCard();
    barCard.widget.hexpand = true;
    barCard.widget.vexpand = true;
    const barSec = new QCardSection();
    barSec.widget.vexpand = true;
    barSec.append(new QLabel({ label: '<b>Bar Chart</b>', useMarkup: true }));
    
    const barChart = new QChart({ type: 'bar', data: chartData, color: '#3584e4' }); // Blue
    barChart.widget.height_request = 250;
    barSec.append(barChart);
    barCard.append(barSec);
    grid.attach(barCard.widget, 0, 0, 1, 1);
    
    // 2. Line Chart
    const lineCard = new QCard();
    lineCard.widget.hexpand = true;
    lineCard.widget.vexpand = true;
    const lineSec = new QCardSection();
    lineSec.widget.vexpand = true;
    lineSec.append(new QLabel({ label: '<b>Line Chart</b>', useMarkup: true }));
    
    const lineChart = new QChart({ type: 'line', data: chartData, color: '#2ec27e' }); // Green
    lineChart.widget.height_request = 250;
    lineSec.append(lineChart);
    lineCard.append(lineSec);
    grid.attach(lineCard.widget, 1, 0, 1, 1);
    
    // 3. Pie Chart
    const pieCard = new QCard();
    pieCard.widget.hexpand = true;
    pieCard.widget.vexpand = true;
    const pieSec = new QCardSection();
    pieSec.widget.vexpand = true;
    pieSec.append(new QLabel({ label: '<b>Pie Chart</b>', useMarkup: true }));
    
    const pieChart = new QChart({ type: 'pie', data: chartData, color: '#e66100' }); // Orange
    pieChart.widget.height_request = 250;
    pieSec.append(pieChart);
    pieCard.append(pieSec);
    grid.attach(pieCard.widget, 0, 1, 2, 1);
    
    page.append(grid);

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
    const header = new QHeader({ elevated: true });
    const toolbar = new QToolbar({ title: 'Alchemy Showcase' });
    const isDrawerOpen = ref(true);
    const toggleDrawerBtn = new QBtn({ onClick: () => { isDrawerOpen.value = !isDrawerOpen.value; } });
    toggleDrawerBtn.widget.set_child(new QIcon({ name: 'open-menu-symbolic' }).widget);
    toggleDrawerBtn.setTooltip('Toggle Navigation Menu');
    toolbar.prepend(toggleDrawerBtn);
    header.append(toolbar);
    win.set_titlebar(header.widget);
    
    const pageContainer = new QPageContainer();
    rootLayout.append(pageContainer);
    
    // Drawer Navigation
    const drawer = new QDrawer({ modelValue: isDrawerOpen, breakpoint: 900 });
    const drawerList = new QList();
    
    const navItems = [
        { id: 'intro', label: 'Introduction', icon: 'help-about-symbolic' },
        { id: 'layout', label: 'Layout & Nav', icon: 'view-grid-symbolic' },
        { id: 'forms', label: 'Forms & Validation', icon: 'format-text-direction-ltr-symbolic' },
        { id: 'data', label: 'Data & Content', icon: 'view-list-symbolic' },
        { id: 'feedback', label: 'Feedback & Modals', icon: 'dialog-information-symbolic' },
        { id: 'web', label: 'Web Components', icon: 'applications-internet-symbolic' },
        { id: 'media', label: 'Media Players', icon: 'audio-x-generic-symbolic' },
        { id: 'kanban', label: 'Kanban Board', icon: 'view-grid-symbolic' },
        { id: 'code', label: 'Code Viewer', icon: 'text-x-script-symbolic' },
        { id: 'charts', label: 'Charts & Analytics', icon: 'utilities-system-monitor-symbolic' }
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
    pageContainer.append(drawer);
    
    // Content Area (Stack)
    const contentScroll = new Gtk.ScrolledWindow({ hexpand: true, vexpand: true });
    
    const contentStack = new Gtk.Stack({ transition_type: Gtk.StackTransitionType.SLIDE_UP_DOWN });
    contentStack.margin_top = 20;
    contentStack.margin_start = 20;
    contentStack.margin_end = 20;
    contentStack.margin_bottom = 20;
    
    contentScroll.set_child(contentStack);
    pageContainer.append(contentScroll);
    
    contentStack.add_named(buildIntroPage(), 'intro');
    contentStack.add_named(buildLayoutPage(), 'layout');
    contentStack.add_named(buildFormsPage(win), 'forms');
    contentStack.add_named(buildDataPage(), 'data');
    contentStack.add_named(buildFeedbackPage(win), 'feedback');
    contentStack.add_named(buildWebPage(), 'web');
    contentStack.add_named(buildMediaPage(), 'media');
    contentStack.add_named(buildKanbanPage(), 'kanban');
    contentStack.add_named(buildCodeViewerPage(), 'code');
    contentStack.add_named(buildChartsPage(), 'charts');
    
    effect(() => {
        contentStack.set_visible_child_name(activePage.value);
    });
    
    win.set_child(rootLayout.widget);
    win.present();
});

app.run([]);
