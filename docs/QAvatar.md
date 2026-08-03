# QAvatar

## Overview
`QAvatar` is a native UI component for displaying user profile pictures or generic icons within a stylized circular or square frame. 

It also supports an `editable` mode where clicking the avatar automatically opens a strictly-jailed `QFileDialog` to let the user pick a new image from their disk!

## Usage
```javascript
import { QAvatar } from 'alchemy';

const avatar = new QAvatar({
    size: 64,
    shape: 'circle', // or 'square'
    image: '/path/to/profile.png',
    editable: true,
    onImageSelect: (newPath) => {
        console.log('User picked new avatar:', newPath);
    }
});
```

## Props
- `size` (Number): The width and height request of the avatar in pixels. Default is `48`.
- `shape` (String): The mask shape of the avatar. Accepts `'circle'` (default) or `'square'`.
- `image` (String): The absolute path to the image file to load into the avatar.
- `editable` (Boolean): If `true`, the avatar becomes clickable and automatically launches a `QFileDialog` when clicked, allowing the user to select an image (`.png`, `.jpg`, `.svg`).
- `onImageSelect` (Function): A callback function that receives the absolute path of the selected image if `editable` is true.

## Advanced
Look at `src/components/QAvatar.js` for exact prop definitions and GJS implementations.
