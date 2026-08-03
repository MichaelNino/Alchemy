# QFileDialog

## Overview
`QFileDialog` is a custom native dialog component that provides a secure, sandboxed file selection experience. Unlike standard OS-level file dialogs, `QFileDialog` allows you to strictly control which directories the user is allowed to browse (Directory Jailing) and filters the available files using globs or extensions.

## Features
- **Directory Jailing**: Limits navigation strictly to configured 'Shortcuts'.
- **Glob Filtering**: Shows only files matching specific extensions (e.g. `*.png`).
- **Asynchronous IO**: Powered by `Gio.FileEnumerator` for non-blocking directory reads.

## Usage
```javascript
import { QFileDialog } from 'alchemy';
import GLib from 'gi://GLib';

const dialog = new QFileDialog({
    title: 'Select Asset',
    
    // Define the sandbox limits (Shortcuts)
    allowedLocations: [
        { name: 'Home', path: GLib.get_home_dir() },
        { name: 'Projects', path: GLib.get_home_dir() + '/Projects' }
    ],
    
    // Filter visible files
    filters: ['*.js', '*.md', '*.png'],
    
    // Callback when user selects a file
    onAccept: (selectedFilePath) => {
        console.log('Selected file:', selectedFilePath);
    }
});

dialog.show();
```

## Props
- `title` (String): The window title of the modal dialog.
- `allowedLocations` (Array): An array of `{ name, path }` objects defining the shortcuts on the left sidebar. The user cannot navigate "Up" above these roots.
- `filters` (Array): An array of glob strings to filter visible files. (e.g., `['*.jpg']`).
- `selectDirectories` (Boolean): If true, only directories are shown and selectable.
- `onAccept` (Function): Callback invoked with the absolute file path when the user clicks 'Open'.
