# QChat

## Overview
`QChat` is a full-featured messenger interface component for the Alchemy Framework. It allows rendering a list of interactive chat bubbles separated by the `currentUser`.

## Usage
```javascript
import { QChat, ref } from 'alchemy';

const messages = ref([
    { id: '1', text: 'Hello!', senderId: 'user1', senderName: 'Alice', timestamp: '2023-01-01T12:00:00Z', avatar: '/path/to/img.png' },
    { id: '2', text: 'Hi Alice.', senderId: 'me', timestamp: '2023-01-01T12:01:00Z' }
]);

const chat = new QChat({
    modelValue: messages,
    currentUser: 'me', // Determines which side the bubbles render on
    onSend: (text) => {
        console.log("User sent:", text);
        // If onSend is provided, you must manually update the modelValue array
        // If onSend is not provided, QChat automatically pushes to modelValue.
    }
});
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (Array) | Array of message objects. Each object should have `id`, `text`, `senderId`, and `timestamp`. `senderName` and `avatar` are optional. |
| `currentUser` | String | The ID of the current user. Messages matching this ID will render on the right (sent). |
| `onSend` | Function | Optional callback when the user sends a message. Receives the typed text as an argument. |

## Styling
Chat bubbles automatically adapt to the user's GTK theme, leveraging `@theme_bg_color` and `@theme_fg_color`. Sent messages use a primary blue background.
