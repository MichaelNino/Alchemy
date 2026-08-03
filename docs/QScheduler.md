# QScheduler

## Overview
`QScheduler` is a comprehensive calendar and scheduling component in the Alchemy Framework. It provides multiple time views (Month, Week, Day) and a complete built-in event management system, drawing inspiration from industry standards like Webix Scheduler.

## Features
- **Multiple Views**: Seamlessly switch between Month, Week, and Day layouts.
- **Event Overlay**: Automatically positions and sizes events across time blocks in the grid.
- **Built-in Editor**: Clicking on an empty time slot opens a native dialog to create a new event. Clicking an existing event allows you to edit its details.
- **Reactivity**: Fully integrated with the framework's reactive state. Changes to the `events` array update the view instantly.

## Usage
```javascript
import { QScheduler, ref } from 'alchemy';

// 1. Define events
const currentDate = new Date();
const events = ref([
    { 
        id: 1, 
        title: 'Team Sync', 
        start: new Date(currentDate.setHours(10, 0, 0, 0)), 
        end: new Date(currentDate.setHours(11, 0, 0, 0)), 
        color: '#3584e4' 
    }
]);

// 2. Create scheduler
const scheduler = new QScheduler({
    events: events,
    currentDate: ref(new Date()),
    currentView: ref('week') // 'month', 'week', or 'day'
});
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `events` | Ref (Array) | Array of event objects (`{ id, title, start, end, color }`). |
| `currentDate` | Ref (Date) | The currently focused date on the calendar. |
| `currentView` | Ref (String)| The active layout: `'month'`, `'week'`, or `'day'`. |
| `backgroundColor`| String | (Optional) The background color of the calendar view area (defaults to `#ffffff`). |
| `fontColor` | String | (Optional) The font color for text inside the calendar view area (defaults to `#000000`). |

## Event Object Structure
| Field | Type | Description |
|-------|------|-------------|
| `id` | String / Number | Unique identifier for the event. |
| `title` | String | The text displayed on the event block. |
| `start` | Date | Start date/time. |
| `end` | Date | End date/time. |
| `color` | String (Hex)| (Optional) Color of the event block. |

## Advanced
Look at `src/components/QScheduler.js` for exact prop definitions and GJS implementations.
