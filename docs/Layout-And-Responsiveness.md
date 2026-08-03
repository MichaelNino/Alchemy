# Alchemy Layout & Responsiveness

Alchemy Framework utilizes modern GTK4 responsive containers seamlessly bridged to a Vue/React-like API.

## Core Concepts

### Grid System (`QRow` & `QCol`)
Alchemy uses a 12-column responsive grid system powered by GTK's `Gtk.Grid` and `Gtk.Overlay`.
- **QRow**: Acts as the responsive wrapper. It locally tracks its own width (like CSS Container Queries). 
- **QCol**: A column inside a `QRow`. It will automatically flex or fix its width depending on its props.

```javascript
const row = new QRow({ stackAt: 'sm', spacing: 10 });
row.append(new QCol({ col: 6 })); // 50% width on large screens, 100% on small
```

### Scrollable Containers
Wide elements like Data Tables (`QTable`), Kanban Boards (`QKanban`), or Tabs (`QTabs`) are automatically wrapped in `Gtk.ScrolledWindow`s. This allows them to horizontally scroll on narrow views instead of breaking the global layout.

### QSplitter
Allows resizable horizontal panes. Used to divide sidebars from content areas.
