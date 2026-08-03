# QTagInput

## Overview
`QTagInput` is a native UI component in the Alchemy Framework that allows users to enter multiple text tags. It binds to a reactive array of strings, displaying each item as a removable `QTag` pill alongside a text entry field.

## Usage
```javascript
import { QTagInput, ref } from 'alchemy';

// Create a reactive reference array for the tags
const tagsRef = ref(['UI', 'Frontend']);

const tagInput = new QTagInput({
    modelValue: tagsRef,
    placeholder: 'Type a tag and press Enter...'
});
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | Ref (Array) | A reactive reference containing an array of strings representing the current tags. |
| `placeholder` | String | (Optional) The placeholder text shown in the input field when empty. |

## Interactivity
- **Adding Tags**: The user types a string into the input and presses `Enter`. The new tag is automatically appended to the `modelValue` array and displayed as a `QTag`.
- **Removing Tags**: Each tag has an `x` button. Clicking it removes the tag from the `modelValue` array.

## Advanced
Look at `src/components/QTagInput.js` for exact prop definitions and GJS implementations.
