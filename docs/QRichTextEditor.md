# QRichTextEditor

## Overview
`QRichTextEditor` is a native GTK4 rich text editing component for the Alchemy Framework. It supports standard text formatting (Bold, Italic, Underline, Strikethrough) and alignment.

Unlike basic text inputs, it comes with serialization adapters to extract your styled content into HTML or Markdown.

## Usage
```javascript
import { QRichTextEditor, ref } from 'alchemy';

const content = ref('<b>Hello</b> <i>World</i>');

const editor = new QRichTextEditor({
    modelValue: content,
    format: 'html' // 'html', 'markdown', or 'raw'
});
```

## Formats & Adapters
The `format` prop determines how the internal GTK text buffer is serialized to `modelValue`:
- `'html'`: Generates basic HTML tags (`<b>`, `<i>`, `<u>`, `<s>`, `<p>`).
- `'markdown'`: Generates standard Markdown syntax (`**`, `*`, `~~`). Note that Markdown doesn't natively support underline, so it falls back to HTML `<u>` tags.
- `'raw'`: Extracts only the raw text, stripping all formatting.

You can also use the adapters directly if you have a `Gtk.TextBuffer`:
```javascript
import { HTMLAdapter, MarkdownAdapter } from 'alchemy';

const htmlString = HTMLAdapter.serialize(buffer);
MarkdownAdapter.deserialize(markdownString, buffer);
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (String) | A reactive reference containing the text content. |
| `format` | String | Defines the serialization format: `'html'`, `'markdown'`, or `'raw'`. Defaults to `'html'`. |

## Advanced
Look at `src/components/QRichTextEditor.js` for implementation details regarding `Gtk.TextTag` application.
