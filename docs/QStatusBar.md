# QStatusBar

## Overview
`QStatusBar` is a dynamic, taskbar-like component designed for the bottom of applications. It provides three main layout zones out-of-the-box, allowing you to build structures similar to the Windows Taskbar or system status panels:
1. **Start**: A left-aligned zone for menus or start buttons.
2. **Center**: A reactive center area for "running processes" or active tasks, driven by a `modelValue` array.
3. **End**: A right-aligned zone (System Tray) that automatically includes a live clock displaying the current date and time.

## Usage
```javascript
import { QStatusBar, QBtn, ref } from 'alchemy';

// Define your running processes
const processes = ref([
    { id: 'app1', icon: 'org.gnome.Terminal-symbolic', tooltip: 'Terminal' },
    { id: 'app2', icon: 'web-browser-symbolic', tooltip: 'Web Browser' }
]);

const statusBar = new QStatusBar({
    modelValue: processes,
    showClock: true // Default is true
});

// Append a Start button to the far left
const startBtn = new QBtn({ icon: 'start-here-symbolic', flat: true });
statusBar.appendStart(startBtn);

// Append a system tray icon to the far right (before the clock)
const trayIcon = new QBtn({ icon: 'network-wireless-symbolic', flat: true });
statusBar.appendEnd(trayIcon);

// Append the status bar to your main window or layout
rootLayout.append(statusBar);
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (Array) | Array of process objects to render in the center. Objects can have `id`, `icon`, `label`, `tooltip`, and `onClick`. |
| `showClock` | Boolean | Whether to render the automatic live updating Date/Time clock in the far right tray. Defaults to `true`. |

## Methods
- `appendStart(childComponent)`: Appends a component to the left-aligned zone.
- `appendEnd(childComponent)`: Appends a component to the right-aligned zone (system tray). Note that if the clock is enabled, it is automatically pinned to the absolute right, so items added here will appear just to the left of the clock.
