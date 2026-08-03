import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import GLib from 'gi://GLib';
import { BaseComponent } from '../component.js';
import { ref, effect, computed } from '../reactivity.js';
import { QBtn } from './QBtn.js';
import { QLabel } from './QLabel.js';
import { QOptionGroup } from './QOptionGroup.js';
import { QDialog } from './QDialog.js';
import { QForm } from './QForm.js';
import { QInput } from './QInput.js';
import { QSelect } from './QSelect.js';

export class QScheduler extends BaseComponent {
    constructor(props = {}) {
        const outerBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
        super(outerBox);
        
        this.events = props.events || ref([]);
        this.currentDate = props.currentDate || ref(new Date());
        this.currentView = props.currentView || ref('month'); // 'day', 'week', 'month'
        this.backgroundColor = props.backgroundColor || '#ffffff';
        this.fontColor = props.fontColor || '#000000';
        
        // Toolbar setup
        const toolbar = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        toolbar.add_css_class('toolbar');
        toolbar.margin_top = 10;
        toolbar.margin_bottom = 10;
        toolbar.margin_start = 10;
        toolbar.margin_end = 10;
        
        // Left: Navigation
        const todayBtn = new QBtn({ label: 'Today', onClick: () => this.currentDate.value = new Date() });
        const prevBtn = new QBtn({ icon: 'go-previous-symbolic', onClick: () => this.navigate(-1) });
        const nextBtn = new QBtn({ icon: 'go-next-symbolic', onClick: () => this.navigate(1) });
        
        const navBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 5 });
        navBox.append(todayBtn.widget);
        navBox.append(prevBtn.widget);
        navBox.append(nextBtn.widget);
        toolbar.append(navBox);
        
        // Center: Date Label
        const titleLabel = new QLabel({ label: '' });
        titleLabel.widget.add_css_class('title-2');
        titleLabel.widget.hexpand = true;
        titleLabel.widget.halign = Gtk.Align.CENTER;
        toolbar.append(titleLabel.widget);
        
        // Right: View Switcher
        // Since we don't have a SegmentedButton component, we'll use a horizontal box with toggle buttons
        const viewGroupBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        viewGroupBox.add_css_class('linked');
        
        const views = [
            { id: 'day', label: 'Day' },
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' }
        ];
        
        const viewBtns = {};
        views.forEach(v => {
            const btn = new Gtk.ToggleButton({ label: v.label });
            btn.connect('toggled', () => {
                if (btn.get_active()) {
                    this.currentView.value = v.id;
                }
            });
            viewGroupBox.append(btn);
            viewBtns[v.id] = btn;
        });
        
        toolbar.append(viewGroupBox);
        outerBox.append(toolbar);
        
        // Main view area (Scrollable)
        const scrollArea = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });
        
        const viewContainer = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        viewContainer.hexpand = true;
        viewContainer.vexpand = true;
        
        // Apply configurable background and font color
        viewContainer.add_css_class('scheduler-bg');
        const provider = new Gtk.CssProvider();
        provider.load_from_string(`.scheduler-bg { background-color: ${this.backgroundColor}; color: ${this.fontColor}; }`);
        viewContainer.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
        
        scrollArea.set_child(viewContainer);
        outerBox.append(scrollArea);
        
        // Internal Dialog for Event Add/Edit
        this.setupEventDialog();
        
        // Reactivity effect
        effect(() => {
            // Update Toggle buttons
            Object.keys(viewBtns).forEach(id => {
                const btn = viewBtns[id];
                if (id === this.currentView.value && !btn.get_active()) {
                    btn.set_active(true);
                } else if (id !== this.currentView.value && btn.get_active()) {
                    btn.set_active(false);
                }
            });
            
            // Update Title
            titleLabel.widget.set_label(this.getFormattedTitle());
            
            // Clear view container
            let child = viewContainer.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                viewContainer.remove(child);
                child = next;
            }
            
            // Render View
            if (this.currentView.value === 'month') {
                viewContainer.append(this.renderMonthView());
            } else if (this.currentView.value === 'week') {
                viewContainer.append(this.renderWeekView());
            } else if (this.currentView.value === 'day') {
                viewContainer.append(this.renderDayView());
            }
        });
    }
    
    navigate(direction) {
        const d = new Date(this.currentDate.value);
        if (this.currentView.value === 'month') {
            d.setMonth(d.getMonth() + direction);
        } else if (this.currentView.value === 'week') {
            d.setDate(d.getDate() + (direction * 7));
        } else if (this.currentView.value === 'day') {
            d.setDate(d.getDate() + direction);
        }
        this.currentDate.value = d;
    }
    
    getFormattedTitle() {
        const d = this.currentDate.value;
        const options = { year: 'numeric', month: 'long' };
        if (this.currentView.value === 'day') {
            options.day = 'numeric';
        } else if (this.currentView.value === 'week') {
            const start = this.getStartOfWeek(d);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            return `${start.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - ${end.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})}`;
        }
        return d.toLocaleDateString(undefined, options);
    }
    
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Sunday is 0
        return new Date(d.setDate(diff));
    }
    
    isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }
    
    // ----------- RENDER MONTH VIEW -----------
    renderMonthView() {
        const grid = new Gtk.Grid({
            row_homogeneous: true,
            column_homogeneous: true,
            column_spacing: 1,
            row_spacing: 1,
            hexpand: true,
            vexpand: true
        });
        grid.add_css_class('calendar-grid'); // We'll add this CSS to app in the future if needed
        
        // Days of week header
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach((day, i) => {
            const label = new Gtk.Label({ label: `<b>${day}</b>`, use_markup: true });
            label.margin_top = 10;
            label.margin_bottom = 10;
            grid.attach(label, i, 0, 1, 1);
        });
        
        const current = this.currentDate.value;
        const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
        const startOfCalendar = this.getStartOfWeek(startOfMonth);
        
        let cursorDate = new Date(startOfCalendar);
        let row = 1;
        
        // Render 6 weeks
        for (let i = 0; i < 42; i++) {
            const cell = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
            cell.add_css_class('card'); // Give it a border/background
            cell.margin_top = 2; cell.margin_bottom = 2;
            cell.margin_start = 2; cell.margin_end = 2;
            
            // Highlight today
            if (this.isSameDay(cursorDate, new Date())) {
                cell.add_css_class('accent');
            } else if (cursorDate.getMonth() !== current.getMonth()) {
                cell.opacity = 0.5; // Dim days not in current month
            }
            
            const dateLabel = new Gtk.Label({ label: `${cursorDate.getDate()}` });
            dateLabel.halign = Gtk.Align.END;
            dateLabel.margin_top = 5;
            dateLabel.margin_end = 5;
            cell.append(dateLabel);
            
            // Find events for this day
            const dayEvents = this.events.value.filter(e => this.isSameDay(new Date(e.start), cursorDate));
            const eventsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 4 });
            eventsBox.halign = Gtk.Align.CENTER;
            eventsBox.margin_top = 5;
            eventsBox.margin_start = 5;
            eventsBox.margin_end = 5;
            eventsBox.vexpand = true;
            
            dayEvents.forEach(evt => {
                const dot = new Gtk.Box();
                dot.set_size_request(8, 8);
                dot.halign = Gtk.Align.CENTER;
                dot.valign = Gtk.Align.CENTER;
                
                const css = `* { min-width: 8px; min-height: 8px; border-radius: 50%; background-color: ${evt.color || '#3584e4'}; }`;
                const provider = new Gtk.CssProvider();
                provider.load_from_string(css);
                dot.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
                
                // Keep the dot clickable to edit the event
                const dotClick = new Gtk.GestureClick();
                dotClick.connect('pressed', () => this.openEventDialog(evt));
                dot.add_controller(dotClick);
                
                eventsBox.append(dot);
            });
            
            cell.append(eventsBox);
            
            // Make cell clickable to add event
            const click = new Gtk.GestureClick();
            const slotDate = new Date(cursorDate); // capture date
            click.connect('pressed', () => {
                this.openEventDialog(null, slotDate);
            });
            cell.add_controller(click);
            
            const col = i % 7;
            grid.attach(cell, col, row, 1, 1);
            
            if (col === 6) row++;
            cursorDate.setDate(cursorDate.getDate() + 1);
        }
        
        return grid;
    }
    
    // ----------- RENDER WEEK VIEW -----------
    renderWeekView() {
        const grid = new Gtk.Grid({
            column_homogeneous: false,
            row_homogeneous: true,
            column_spacing: 1,
            row_spacing: 1,
            hexpand: true,
            vexpand: true
        });
        grid.add_css_class('calendar-grid');
        
        // Header row
        const current = this.currentDate.value;
        const startOfCalendar = this.getStartOfWeek(current);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Time column header (empty)
        grid.attach(new Gtk.Label({ label: '' }), 0, 0, 1, 1);
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfCalendar);
            d.setDate(d.getDate() + i);
            const label = new Gtk.Label({ label: `<b>${days[i]} ${d.getDate()}</b>`, use_markup: true });
            label.margin_top = 10;
            label.margin_bottom = 10;
            label.hexpand = true;
            grid.attach(label, i + 1, 0, 1, 1);
        }
        
        // Time rows (0 to 23)
        for (let r = 0; r < 24; r++) {
            const timeLabel = new Gtk.Label({ label: `${r}:00` });
            timeLabel.margin_start = 10;
            timeLabel.margin_end = 10;
            grid.attach(timeLabel, 0, r + 1, 1, 1);
            
            // Empty slots
            for (let c = 0; c < 7; c++) {
                const cell = new Gtk.Box();
                cell.add_css_class('card');
                cell.vexpand = true;
                cell.hexpand = true;
                
                const d = new Date(startOfCalendar);
                d.setDate(d.getDate() + c);
                d.setHours(r, 0, 0, 0);
                
                const click = new Gtk.GestureClick();
                click.connect('pressed', () => {
                    this.openEventDialog(null, d);
                });
                cell.add_controller(click);
                
                grid.attach(cell, c + 1, r + 1, 1, 1);
            }
        }
        
        // Overlay Events on the grid
        const endOfCalendar = new Date(startOfCalendar);
        endOfCalendar.setDate(endOfCalendar.getDate() + 7);
        
        const weekEvents = this.events.value.filter(e => {
            const s = new Date(e.start);
            return s >= startOfCalendar && s < endOfCalendar;
        });
        
        // We use attach to span rows
        weekEvents.forEach(evt => {
            const s = new Date(evt.start);
            const e = new Date(evt.end);
            
            const col = s.getDay() + 1; // 0 is time col
            const startHour = s.getHours();
            let durationHours = Math.ceil((e - s) / (1000 * 60 * 60));
            if (durationHours < 1) durationHours = 1;
            
            const evtBtn = new Gtk.Button({ label: evt.title });
            evtBtn.add_css_class('suggested-action'); // Colorize
            evtBtn.vexpand = true;
            evtBtn.hexpand = true;
            evtBtn.margin_top = 2; evtBtn.margin_bottom = 2;
            evtBtn.margin_start = 2; evtBtn.margin_end = 2;
            
            evtBtn.connect('clicked', () => this.openEventDialog(evt));
            
            // To overlay, we can just attach it directly. It will share the cell with the background box.
            grid.attach(evtBtn, col, startHour + 1, 1, durationHours);
        });
        
        return grid;
    }
    
    // ----------- RENDER DAY VIEW -----------
    renderDayView() {
        const grid = new Gtk.Grid({
            column_homogeneous: false,
            row_homogeneous: true,
            column_spacing: 1,
            row_spacing: 1,
            hexpand: true,
            vexpand: true
        });
        grid.add_css_class('calendar-grid');
        
        const current = this.currentDate.value;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Time column header (empty)
        grid.attach(new Gtk.Label({ label: '' }), 0, 0, 1, 1);
        
        const label = new Gtk.Label({ label: `<b>${days[current.getDay()]} ${current.getDate()}</b>`, use_markup: true });
        label.margin_top = 10;
        label.margin_bottom = 10;
        label.hexpand = true;
        grid.attach(label, 1, 0, 1, 1);
        
        for (let r = 0; r < 24; r++) {
            const timeLabel = new Gtk.Label({ label: `${r}:00` });
            timeLabel.margin_start = 10;
            timeLabel.margin_end = 10;
            grid.attach(timeLabel, 0, r + 1, 1, 1);
            
            const cell = new Gtk.Box();
            cell.add_css_class('card');
            cell.vexpand = true;
            cell.hexpand = true;
            
            const d = new Date(current);
            d.setHours(r, 0, 0, 0);
            
            const click = new Gtk.GestureClick();
            click.connect('pressed', () => {
                this.openEventDialog(null, d);
            });
            cell.add_controller(click);
            
            grid.attach(cell, 1, r + 1, 1, 1);
        }
        
        // Overlay Events on the grid
        const dayEvents = this.events.value.filter(e => this.isSameDay(new Date(e.start), current));
        
        dayEvents.forEach(evt => {
            const s = new Date(evt.start);
            const e = new Date(evt.end);
            
            const startHour = s.getHours();
            let durationHours = Math.ceil((e - s) / (1000 * 60 * 60));
            if (durationHours < 1) durationHours = 1;
            
            const evtBtn = new Gtk.Button({ label: evt.title });
            evtBtn.add_css_class('suggested-action');
            evtBtn.vexpand = true;
            evtBtn.hexpand = true;
            evtBtn.margin_top = 2; evtBtn.margin_bottom = 2;
            evtBtn.margin_start = 2; evtBtn.margin_end = 2;
            
            evtBtn.connect('clicked', () => this.openEventDialog(evt));
            grid.attach(evtBtn, 1, startHour + 1, 1, durationHours);
        });
        
        return grid;
    }
    
    // ----------- EVENT DIALOG -----------
    setupEventDialog() {
        this.isDialogOpen = ref(false);
        this.dialogFormContext = {
            id: null,
            title: ref(''),
            start: ref(''),
            end: ref(''),
            color: ref('#3584e4')
        };
        
        this.eventDialog = new QDialog({ modelValue: this.isDialogOpen });
        
        const form = new QForm();
        form.widget.margin_top = 20; form.widget.margin_bottom = 20;
        form.widget.margin_start = 20; form.widget.margin_end = 20;
        
        form.append(new QInput({ label: 'Event Title', modelValue: this.dialogFormContext.title }));
        form.append(new QInput({ label: 'Start Time (YYYY-MM-DDTHH:mm)', modelValue: this.dialogFormContext.start }));
        form.append(new QInput({ label: 'End Time (YYYY-MM-DDTHH:mm)', modelValue: this.dialogFormContext.end }));
        
        form.append(new QLabel({ label: '<b>Color</b>', useMarkup: true, margin_top: 10 }));
        form.append(new QSelect({
            options: ['#3584e4', '#e01b24', '#2ec27e', '#f6d32d', '#986a44'],
            modelValue: this.dialogFormContext.color
        }));
        
        const saveBtn = new QBtn({ label: 'Save', onClick: () => this.saveEvent() });
        saveBtn.widget.add_css_class('suggested-action');
        
        const delBtn = new QBtn({ label: 'Delete', onClick: () => this.deleteEvent() });
        delBtn.widget.add_css_class('destructive-action');
        
        const btnBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10, margin_top: 20 });
        btnBox.append(delBtn.widget);
        
        const spacer = new Gtk.Box({ hexpand: true });
        btnBox.append(spacer);
        btnBox.append(saveBtn.widget);
        
        form.append({ widget: btnBox });
        this.eventDialog.append(form);
    }
    
    openEventDialog(evt, presetDate) {
        if (evt) {
            this.dialogFormContext.id = evt.id;
            this.dialogFormContext.title.value = evt.title;
            // Pad to ISO local
            this.dialogFormContext.start.value = this.toLocalISOString(new Date(evt.start)).slice(0, 16);
            this.dialogFormContext.end.value = this.toLocalISOString(new Date(evt.end)).slice(0, 16);
            this.dialogFormContext.color.value = evt.color || '#3584e4';
            this.eventDialog.widget.set_title('Edit Event');
        } else {
            this.dialogFormContext.id = null;
            this.dialogFormContext.title.value = 'New Event';
            const s = presetDate || new Date();
            const e = new Date(s);
            e.setHours(s.getHours() + 1);
            
            this.dialogFormContext.start.value = this.toLocalISOString(s).slice(0, 16);
            this.dialogFormContext.end.value = this.toLocalISOString(e).slice(0, 16);
            this.dialogFormContext.color.value = '#3584e4';
            this.eventDialog.widget.set_title('Add Event');
        }
        
        // Mount dynamically if needed, or if already mounted, present
        const root = this.widget.get_root();
        if (root instanceof Gtk.Window) {
            this.eventDialog.mount({ get_root: () => root });
        }
        
        this.isDialogOpen.value = true;
    }
    
    toLocalISOString(d) {
        const pad = (n) => n < 10 ? '0' + n : n;
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
               pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    
    saveEvent() {
        const newEvents = [...this.events.value];
        const evt = {
            id: this.dialogFormContext.id || Date.now(),
            title: this.dialogFormContext.title.value,
            start: new Date(this.dialogFormContext.start.value),
            end: new Date(this.dialogFormContext.end.value),
            color: this.dialogFormContext.color.value
        };
        
        if (this.dialogFormContext.id) {
            const idx = newEvents.findIndex(e => e.id === evt.id);
            if (idx > -1) newEvents[idx] = evt;
        } else {
            newEvents.push(evt);
        }
        
        this.events.value = newEvents;
        this.isDialogOpen.value = false;
    }
    
    deleteEvent() {
        if (this.dialogFormContext.id) {
            this.events.value = this.events.value.filter(e => e.id !== this.dialogFormContext.id);
        }
        this.isDialogOpen.value = false;
    }
}
