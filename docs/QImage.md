# QImage

## Overview
`QImage` is a native UI component for rendering images using `Gtk.Picture` in a constrained box, enabling robust shape clipping and responsive layouts. It scales images to fit their boundaries properly.

## Usage
```javascript
import { QImage } from 'alchemy';

const img = new QImage({
    src: '/path/to/my/image.png',
    width: 200,
    height: 150,
    shape: 'square' // applies a subtle 8px border-radius
});
```

## Props
- `src` or `image` (String): The absolute path to the image file.
- `width` (Number): The width of the image. Defaults to 100.
- `height` (Number): The height of the image. Defaults to 100.
- `size` (Number): Sets both `width` and `height` to the same dimension.
- `shape` (String): Optional mask. Supports `'circle'` (fully rounded) and `'square'` (subtly rounded corners).

## Advanced
Look at `src/components/QImage.js` for exact prop definitions and GJS implementations.
