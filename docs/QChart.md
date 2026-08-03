# QChart

`QChart` is a powerful, native, hardware-accelerated charting component for the Alchemy Framework. It utilizes GTK4's `Gtk.DrawingArea` combined with Cairo graphics to render charts with zero DOM overhead, resulting in blazingly fast performance and crisp visual quality.

## Features

- **Native Cairo Rendering:** No heavy browser DOM or web views are used. Everything is painted directly via the GPU/CPU using native bindings.
- **Reactivity:** Fully integrated with Alchemy's reactivity system. Wrap your datasets in `ref()`, and the charts will automatically repaint in real-time when the data updates.
- **8 Chart Types:** Matches the primary standard chart types found in Chart.js.
- **Responsive Legends:** Uses native `Gtk.FlowBox` to generate responsive, wrap-around legends for applicable charts.

## Basic Usage

```javascript
import { QChart } from 'alchemy';
import { ref } from 'alchemy/reactivity';

const myData = ref([
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 19 },
    { label: 'Mar', value: 3 }
]);

const chart = new QChart({
    type: 'bar',          // The type of chart
    data: myData,         // The reactive dataset
    color: '#3584e4'      // The primary color
});
```

## Chart Types and Data Formats

Depending on the chart type, `QChart` expects specific data formats.

### Standard Format

Used by **Bar, Line, Pie, Doughnut, Radar,** and **Polar Area** charts.
The data array should consist of objects containing `label` (String) and `value` (Number).

```javascript
const standardData = ref([
    { label: 'A', value: 20 },
    { label: 'B', value: 35 }
]);
```

- `type: 'bar'`: Vertical bars with automatic scaling.
- `type: 'line'`: Connected lines with plotted data points.
- `type: 'pie'`: A standard pie chart. Includes a native responsive legend below.
- `type: 'doughnut'`: A pie chart with a hollow center. Includes a native responsive legend below.
- `type: 'radar'`: A spider-web chart mapping values along radial axes.
- `type: 'polarArea'`: Similar to a pie chart, but all slices have the same angle, and the radius of each slice represents the value.

### Cartesian 2D Format

Used by **Scatter** and **Bubble** charts.
The data array should consist of objects containing `x` (Number) and `y` (Number) coordinates. For the Bubble chart, an optional `r` (Number) determines the radius of the bubble. You can also provide an optional `label` (String) to generate a legend for the data points.

```javascript
// For Scatter Chart
const scatterData = ref([
    { label: 'Point A', x: -10, y: 0 },
    { label: 'Point B', x: 5, y: 15 }
]);

// For Bubble Chart
const bubbleData = ref([
    { label: 'Product 1', x: 10, y: 20, r: 5 },
    { label: 'Product 2', x: 30, y: 40, r: 15 } // 'r' determines the size of the bubble
]);
```

- `type: 'scatter'`: Plots points on a 2D Cartesian plane based on the X/Y coordinates.
- `type: 'bubble'`: Plots points on a 2D Cartesian plane, scaling the size of each bubble based on its relative `r` value.

## Styling

`QChart` generates its own internal variations of the primary `color` prop passed during initialization. For charts requiring multiple colors (like Pie, Doughnut, and Polar Area), it procedurally shifts the brightness of the primary color to create a beautiful, harmonious palette for the slices.
