# QTag

## Overview
`QTag` is a native UI component in the Alchemy Framework used for displaying concise, pill-shaped tags or badges.

## Usage
```javascript
import { QTag } from 'alchemy';

// Simple read-only tag
const tag = new QTag({
    label: 'Feature'
});

// Removable tag
const removableTag = new QTag({
    label: 'Bug',
    removable: true,
    onRemove: (label) => {
        console.log(`Removed tag: ${label}`);
    }
});
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `label` | String | The text to display inside the tag. |
| `removable` | Boolean | If true, displays a small close icon button to remove the tag. |
| `onRemove` | Function | Callback triggered when the remove button is clicked. Receives the tag label as an argument. |

## Advanced
Look at `src/components/QTag.js` for exact prop definitions and GJS implementations.
