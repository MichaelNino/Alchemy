# QAvatar

## Overview
`QAvatar` is a native UI component for displaying user profile pictures or generic icons within a stylized circular or square frame. It is built upon `Gtk.Overlay` and `QImage`, allowing fallback components (like `QIcon`) to be perfectly centered on top of the background. 

When a valid image is provided (or dynamically loaded), any appended fallback icons are automatically hidden, revealing the perfectly clipped `QImage` underneath.

It also supports an interactive mode (unless `readonly: true`) where clicking the avatar automatically opens a strictly-jailed `QFileDialog` to let the user pick a new image from their disk!

## Usage
```javascript
import { QAvatar } from 'alchemy';

const avatar = new QAvatar({
    size: 64,
    shape: 'circle', // or 'square'
    image: '/path/to/profile.png',
    readonly: false, // Default is false, which enables the file dialog
    onImageSelect: (newPath) => {
        console.log('User picked new avatar:', newPath);
    }
});
```

## Props
- `size` (Number): The width and height request of the avatar in pixels. Default is `48`.
- `shape` (String): The mask shape of the avatar. Accepts `'circle'` (default) or `'square'`.
- `image` (String): The absolute path to the image file to load into the avatar.
- `readonly` (Boolean): If `false` (default), the avatar is clickable and automatically launches a `QFileDialog` when clicked, allowing the user to select an image (`.png`, `.jpg`, `.svg`). If `true`, the avatar is view-only (though the image can still be updated programmatically via `setImage(path)`).
- `onImageSelect` (Function): A callback function that receives the absolute path of the selected image.

## Advanced
Look at `src/components/QAvatar.js` for exact prop definitions and GJS implementations.
