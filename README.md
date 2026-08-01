# Alchemy Framework ⚗️

Alchemy Framework is a lightweight, highly-reactive UI component library for **GNOME/GJS**, heavily inspired by the beloved [Quasar Framework](https://quasar.dev/) (VueJS). 

Alchemy bridges the gap between modern web development ergonomics and native Linux desktop application development. It allows you to build GNOME applications using a familiar, Vue-like composition API, while rendering 100% native GTK4 widgets.

## Methodology

### 1. The Reactivity Engine
At the core of Alchemy is a lightweight, dependency-tracking reactivity engine modeled after Vue 3. 
- **`ref`**: Creates a reactive reference to primitive values (or objects).
- **`computed`**: Creates derived reactive state that automatically re-evaluates when its dependencies change.
- **`effect`**: Tracks dependencies and automatically executes a callback whenever bound `ref` values update.

### 2. Native GTK4 Abstractions
Alchemy does **not** use a webview or render custom DOM nodes. Instead, every Alchemy component (like `QBtn` or `QInput`) is a thin, reactive wrapper around a native `Gtk4` widget. 
- State changes instantly update GTK widget properties.
- GNOME users get a fast, accessible, native desktop experience.
- Web developers get the familiar component-driven DX of Quasar.

### 3. Functionality over Styling
By design, Alchemy does not ship with custom CSS themes or styling overrides. Styling is strictly deferred to the host GNOME desktop environment (and libadwaita/GTK themes). Alchemy focuses purely on **layout, structure, and functionality**. 

## Usage

Writing an app in Alchemy looks remarkably similar to writing a Vue/Quasar application, but it executes natively on GNOME.

```javascript
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

// 1. Import Reactivity and Components
import { ref, effect, QBtn, QLayout, QLabel } from './src/index.js';

const app = new Gtk.Application({
    application_id: 'org.alchemy.Demo',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});

app.connect('activate', () => {
    const win = new Gtk.ApplicationWindow({
        application: app,
        title: 'My Alchemy App',
        default_width: 400,
        default_height: 300
    });

    // 2. Define Reactive State
    const counter = ref(0);

    // 3. Build Layout
    const layout = new QLayout();
    
    layout.append(new QLabel({ 
        label: computed(() => `You clicked ${counter.value} times!`) 
    }));
    
    layout.append(new QBtn({ 
        label: 'Click Me', 
        onClick: () => counter.value++ 
    }));

    // 4. Mount to GTK Window
    win.set_child(layout.widget);
    win.present();
});

app.run([]);
```

Run your application using the GJS interpreter:
```bash
gjs -m main.js
```

## Available Components

Alchemy is continually expanding. Currently, the following Quasar-inspired components have been ported and mapped to GTK4:

**Layout & Navigation**
- `QLayout` (Base containers)
- `QToolbar` (`Gtk.HeaderBar`)
- `QDrawer` (`Gtk.Revealer` sidebars)
- `QTabs` / `QTab` (Integrated with `Gtk.Stack`)

**Forms & Inputs**
- `QForm` (Validation orchestrator)
- `QBtn` (`Gtk.Button`)
- `QInput` (`Gtk.Entry` / `Gtk.PasswordEntry` with Rules/Validation)
- `QCheckbox` (`Gtk.CheckButton`)
- `QRadio` (`Gtk.CheckButton` groups)
- `QToggle` (`Gtk.Switch`)
- `QSelect` (`Gtk.DropDown`)
- `QSlider` (`Gtk.Scale`)

**Data Display**
- `QTable` (Reactive, sortable, paginated Data Grids via `Gtk.Grid`)
- `QTree` (Recursive, animated hierarchical file explorers)
- `QList` / `QItem` (`Gtk.ListBox`)
- `QCard` / `QCardSection` (Styled container frames)
- `QIcon` (`Gtk.Image` with symbolic icons)
- `QAvatar` (Framed icon/image containers)
- `QLabel` (`Gtk.Label` with Pango Markup support)

**Feedback & Overlays**
- `QDialog` (`Gtk.Window` modals)
- `QMenu` (`Gtk.Popover` menus)
- `QNotify` (Custom frameless Toast notifications)
- `QSpinner` (`Gtk.Spinner`)
- `QProgressBar` (`Gtk.ProgressBar`)

**Advanced Integrations**
- `QWebView` (Native `WebKit 6.0` integration with reactive URL/HTML bindings)
- `QAudioPlayer` (Extensible, HTML5-like audio player powered by GStreamer for advanced multimedia and WebRTC integration)

## License
MIT License
