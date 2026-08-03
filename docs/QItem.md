# QItem

## Overview
`QItem` is a list item container component that is typically used inside a `QList` or `QTable`. It provides standard margins and padding, and supports displaying icons on the left side.

## Usage
```javascript
import { QItem, QLabel } from 'alchemy';

// Standard QItem with an icon
const item = new QItem({ icon: 'user-info-symbolic' });
item.append(new QLabel({ label: 'User Profile' }));
```

## Props
- `icon` (String): A standard GTK icon name (e.g., `'folder-symbolic'`) to display on the left.
- `gicon` (GIcon): A native GIO Icon object (e.g., from `Gio.FileInfo.get_icon()`). Useful for displaying dynamic system file icons.

## Advanced
Look at `src/components/QItem.js` for exact prop definitions and GJS implementations.
