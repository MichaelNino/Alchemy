import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

import { ref, computed, effect } from '../../src/index.js';
import { 
    QBtn, QLayout, QCard, QCardSection, 
    QList, QItem, QDialog, QLabel, QToolbar, QDrawer,
    QTabs, QTab, QSpinner, QProgressBar, QNotify, QTable, QToggle,
    QIcon, QAvatar, QSelect, QSlider, QMenu
} from '../../src/index.js';

const app = new Gtk.Application({
    application_id: 'org.alchemy.Demo',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({
        application: app,
        title: 'Alchemy Framework Dashboard (Iter 5)',
        default_width: 800,
        default_height: 600
    });

    const rootLayout = new QLayout();
    
    // Header
    const toolbar = new QToolbar({ title: 'Alchemy Admin' });
    
    const isDrawerOpen = ref(true);
    const toggleDrawerBtn = new QBtn({ 
        onClick: () => { isDrawerOpen.value = !isDrawerOpen.value; } 
    });
    toggleDrawerBtn.widget.set_child(new QIcon({ name: 'open-menu-symbolic' }).widget);
    toggleDrawerBtn.setTooltip('Toggle Sidebar');
    toolbar.prepend(toggleDrawerBtn);
    
    rootLayout.append(toolbar);
    
    const bodyBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    rootLayout.widget.append(bodyBox);
    
    // Drawer
    const drawer = new QDrawer({ modelValue: isDrawerOpen });
    const drawerList = new QList();
    
    const navItem1 = new QItem();
    navItem1.append(new QIcon({ name: 'go-home-symbolic' }));
    navItem1.append(new QLabel({ label: 'Dashboard' }));
    drawerList.append(navItem1);
    
    const navItem2 = new QItem();
    navItem2.append(new QIcon({ name: 'emblem-system-symbolic' }));
    navItem2.append(new QLabel({ label: 'Settings' }));
    drawerList.append(navItem2);
    
    drawer.append(drawerList);
    bodyBox.append(drawer.widget);
    
    // Content Area
    const contentBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, hexpand: true });
    bodyBox.append(contentBox);
    
    // Tabs
    const activeTab = ref('forms');
    const tabs = new QTabs({ modelValue: activeTab });
    tabs.append(new QTab({ name: 'forms', label: 'Advanced Forms & Icons' }));
    tabs.append(new QTab({ name: 'data', label: 'Data View' }));
    
    tabs.widget.margin_top = 10;
    tabs.widget.margin_start = 10;
    contentBox.append(tabs.widget);
    
    const contentStack = new Gtk.Stack({ transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT });
    contentStack.margin_top = 20;
    contentStack.margin_start = 10;
    contentBox.append(contentStack);
    
    // TAB 1: Advanced Forms & Icons
    const formPage = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    contentStack.add_named(formPage, 'forms');
    
    const formCard = new QCard();
    const formSection = new QCardSection();
    
    // Avatar & Icon
    const avatarBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
    const avatar = new QAvatar({ size: 64 });
    avatar.append(new QIcon({ name: 'face-smile-symbolic', size: 32 }));
    avatarBox.append(avatar.widget);
    avatarBox.append(new QLabel({ label: '<b>User Profile</b>', useMarkup: true }).widget);
    formSection.append({ widget: avatarBox }); // Temporary hack to append raw GTK widget wrapper
    
    // Select
    const fruit = ref('Apple');
    formSection.append(new QLabel({ label: 'Favorite Fruit:' }));
    formSection.append(new QSelect({ 
        options: ['Apple', 'Banana', 'Cherry', 'Date'],
        modelValue: fruit 
    }));
    
    // Slider
    const volume = ref(50);
    formSection.append(new QLabel({ label: 'Volume:' }));
    formSection.append(new QSlider({ min: 0, max: 100, step: 1, modelValue: volume }));
    
    // Menu (Popover)
    const isMenuOpen = ref(false);
    const menuBtn = new QBtn({ 
        label: 'Options Menu ▾',
        onClick: () => { isMenuOpen.value = true; }
    });
    const menu = new QMenu({ modelValue: isMenuOpen });
    
    const menuList = new QList();
    const menuItem1 = new QItem();
    menuItem1.append(new QLabel({ label: 'Save' }));
    const menuItem2 = new QItem();
    menuItem2.append(new QLabel({ label: 'Delete' }));
    menuList.append(menuItem1);
    menuList.append(menuItem2);
    
    menu.append(menuList);
    menu.mount(menuBtn.widget); // Attach popover to button
    
    formSection.append(menuBtn);
    
    formCard.append(formSection);
    formPage.append(formCard.widget);
    
    // TAB 2: Data View
    const dataPage = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 20 });
    contentStack.add_named(dataPage, 'data');
    
    const tableCard = new QCard();
    const tableSection = new QCardSection();
    const columns = [
        { name: 'id', label: 'ID', field: 'id' },
        { name: 'name', label: 'Name', field: 'name' }
    ];
    const rows = ref([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    tableSection.append(new QTable({ columns, rows }));
    tableCard.append(tableSection);
    dataPage.append(tableCard.widget);
    
    effect(() => {
        contentStack.set_visible_child_name(activeTab.value);
    });
    
    win.set_child(rootLayout.widget);
    win.present();
});

app.run([]);
