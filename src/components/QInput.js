import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect } from '../reactivity.js';

export class QInput extends BaseComponent {
    constructor(props = {}) {
        super(new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 }));
        
        this.entry = new Gtk.Entry();
        this.errorLabel = new Gtk.Label({ xalign: 0 });
        this.errorLabel.visible = false;
        
        this.widget.append(this.entry);
        this.widget.append(this.errorLabel);

        this.rules = props.rules || [];
        this.hasError = false;
        this.type = props.type || 'text';

        if (props.placeholder) {
            this.entry.placeholder_text = props.placeholder;
        }

        // Configure based on type
        this._configureType();

        if (props.modelValue !== undefined) {
            this.entry.text = props.modelValue.value || '';
            
            this.entry.connect('changed', () => {
                if (props.modelValue.value !== this.entry.text) {
                    props.modelValue.value = this.entry.text;
                }
                this.validate();
            });
            
            effect(() => {
                if (this.entry.text !== props.modelValue.value) {
                    this.entry.text = props.modelValue.value || '';
                }
            });
        }
        
        this.validate = () => {
            if (!this.rules || this.rules.length === 0) return true;
            
            for (let rule of this.rules) {
                const result = rule(this.entry.text);
                if (typeof result === 'string') {
                    this.hasError = true;
                    this.entry.add_css_class('error');
                    this.errorLabel.set_markup(`<span foreground="red" size="small">${result}</span>`);
                    this.errorLabel.visible = true;
                    return false;
                }
            }
            
            this.hasError = false;
            this.entry.remove_css_class('error');
            this.errorLabel.visible = false;
            return true;
        };
    }

    _configureType() {
        switch (this.type) {
            case 'password':
                this.entry.visibility = false;
                this.entry.input_purpose = Gtk.InputPurpose.PASSWORD;
                break;
            case 'email':
                this.entry.input_purpose = Gtk.InputPurpose.EMAIL;
                break;
            case 'tel':
                this.entry.input_purpose = Gtk.InputPurpose.PHONE;
                break;
            case 'url':
                this.entry.input_purpose = Gtk.InputPurpose.URL;
                break;
            case 'number':
                this.entry.input_purpose = Gtk.InputPurpose.NUMBER;
                break;
            case 'date':
                this._setupDatePicker();
                break;
            case 'time':
                this._setupTimePicker();
                break;
        }
    }

    _setupDatePicker() {
        this.entry.set_icon_from_icon_name(Gtk.EntryIconPosition.SECONDARY, 'x-office-calendar-symbolic');
        this.entry.set_icon_activatable(Gtk.EntryIconPosition.SECONDARY, true);

        const popover = new Gtk.Popover();
        const calendar = new Gtk.Calendar();
        
        calendar.connect('day-selected', () => {
            const date = calendar.get_date(); // GLib.DateTime
            if (date) {
                const yyyy = date.get_year();
                const mm = String(date.get_month()).padStart(2, '0');
                const dd = String(date.get_day_of_month()).padStart(2, '0');
                this.entry.text = `${yyyy}-${mm}-${dd}`;
            }
            popover.popdown();
        });

        popover.set_child(calendar);
        popover.set_parent(this.entry);
        
        const attachCleanup = (rootWidget) => {
            if (rootWidget && rootWidget.connect && !this._dateCleanupConnected) {
                this._dateCleanupConnected = true;
                rootWidget.connect('close-request', () => {
                    popover.unparent();
                    return false;
                });
            }
        };

        const root = this.entry.get_root();
        if (root) {
            attachCleanup(root);
        } else {
            const sigId = this.entry.connect('notify::root', () => {
                const newRoot = this.entry.get_root();
                if (newRoot) {
                    attachCleanup(newRoot);
                    this.entry.disconnect(sigId);
                }
            });
        }

        this.entry.connect('icon-press', (entry, iconPos) => {
            if (iconPos === Gtk.EntryIconPosition.SECONDARY) {
                popover.popup();
            }
        });
    }

    _setupTimePicker() {
        this.entry.set_icon_from_icon_name(Gtk.EntryIconPosition.SECONDARY, 'document-open-recent-symbolic');
        this.entry.set_icon_activatable(Gtk.EntryIconPosition.SECONDARY, true);

        const popover = new Gtk.Popover();
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 5, margin_start: 10, margin_end: 10, margin_top: 10, margin_bottom: 10 });
        
        const hrSpin = Gtk.SpinButton.new_with_range(0, 23, 1);
        hrSpin.orientation = Gtk.Orientation.VERTICAL;
        
        const minSpin = Gtk.SpinButton.new_with_range(0, 59, 1);
        minSpin.orientation = Gtk.Orientation.VERTICAL;

        box.append(hrSpin);
        box.append(new Gtk.Label({ label: ':' }));
        box.append(minSpin);
        
        const updateTime = () => {
            const hr = String(hrSpin.get_value_as_int()).padStart(2, '0');
            const mn = String(minSpin.get_value_as_int()).padStart(2, '0');
            this.entry.text = `${hr}:${mn}`;
        };
        
        hrSpin.connect('value-changed', updateTime);
        minSpin.connect('value-changed', updateTime);

        popover.set_child(box);
        popover.set_parent(this.entry);
        
        const attachCleanupTime = (rootWidget) => {
            if (rootWidget && rootWidget.connect && !this._timeCleanupConnected) {
                this._timeCleanupConnected = true;
                rootWidget.connect('close-request', () => {
                    popover.unparent();
                    return false;
                });
            }
        };

        const rootTime = this.entry.get_root();
        if (rootTime) {
            attachCleanupTime(rootTime);
        } else {
            const sigIdTime = this.entry.connect('notify::root', () => {
                const newRootTime = this.entry.get_root();
                if (newRootTime) {
                    attachCleanupTime(newRootTime);
                    this.entry.disconnect(sigIdTime);
                }
            });
        }

        this.entry.connect('icon-press', (entry, iconPos) => {
            if (iconPos === Gtk.EntryIconPosition.SECONDARY) {
                popover.popup();
            }
        });
    }
}
