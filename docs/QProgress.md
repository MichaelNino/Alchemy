# QProgress

## Overview
`QProgress` is a customizable progress bar wrapper for `Gtk.ProgressBar`. It supports dynamic color changes using scoped `Gtk.CssProvider`, and built-in label formatting for displaying progress as either a percentage (`50%`) or a ratio (`5 / 10`).

## Usage
```javascript
import { QProgress } from 'alchemy';

// Basic progress bar without label
const prog1 = new QProgress({ value: 50 });

// Progress bar with default percentage label
const prog2 = new QProgress({ value: 75, max: 100, showLabel: true });

// Colored progress bar
const prog3 = new QProgress({ value: 40, color: '#ff0000' });

// Ratio formatted label (e.g., '3 / 10')
const prog4 = new QProgress({ value: 3, max: 10, showLabel: true, labelFormat: 'ratio' });
```

## Props
- `value` (Number): The current progress value (defaults to `0`).
- `max` (Number): The maximum progress value. (defaults to `100`).
- `color` (String): Any valid CSS color string (e.g., `'#32CD32'`, `'red'`) to override the default theme color of the progress bar fill.
- `showLabel` (Boolean): If `true`, a text label is overlaid on the progress bar.
- `labelFormat` (String): If `showLabel` is true, determines the text format. 
  - `'percentage'` (default): Displays the percentage (e.g., `75%`).
  - `'ratio'`: Displays the exact value and max (e.g., `75 / 100`).

## Methods
- `setValue(newValue)`: Updates the progress bar to the new value and recalculates the fraction and label.
- `setMax(newMax)`: Updates the maximum value and recalculates.
- `setColor(cssColor)`: Dynamically updates the color of the progress bar.
