import Gtk from 'gi://Gtk?version=4.0';
import { BaseComponent } from '../component.js';
import { effect, computed } from '../reactivity.js';
import { AudioEngine } from '../utils/AudioEngine.js';
import { QBtn } from './QBtn.js';
import { QSlider } from './QSlider.js';
import { QLabel } from './QLabel.js';

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export class QAudioPlayer extends BaseComponent {
    constructor(props = {}) {
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        super(box);

        // Allow passing a custom engine (e.g. LiveKitEngine) for future extensibility
        this.engine = props.engine || new AudioEngine();
        
        if (props.src) {
            effect(() => {
                const src = props.src.value !== undefined ? props.src.value : props.src;
                if (src) this.engine.setSrc(src);
            });
        }

        // --- Play/Pause Button ---
        const playBtn = new QBtn({
            icon: computed(() => this.engine.isPlaying.value ? 'media-playback-pause-symbolic' : 'media-playback-start-symbolic'),
            onClick: () => {
                if (this.engine.isPlaying.value) {
                    this.engine.pause();
                } else {
                    this.engine.play();
                }
            }
        });
        box.append(playBtn.widget);

        // --- Current Time Label ---
        const timeLabel = new QLabel({
            label: computed(() => formatTime(this.engine.currentTime.value))
        });
        timeLabel.widget.valign = Gtk.Align.CENTER;
        box.append(timeLabel.widget);

        // --- Scrubber ---
        // We handle user dragging vs engine updating to prevent fighting
        let isDragging = false;
        
        const scrubber = new QSlider({
            min: 0,
            max: computed(() => this.engine.duration.value || 100),
            modelValue: computed(() => this.engine.currentTime.value)
        });
        scrubber.widget.hexpand = true;
        
        // Listen for user changes on the underlying GtkScale to trigger seek
        scrubber.widget.connect('change-value', (scale, scroll_type, value) => {
            if (this.engine.duration.value > 0) {
                this.engine.seek(value);
            }
            return false;
        });

        box.append(scrubber.widget);

        // --- Duration Label ---
        const durationLabel = new QLabel({
            label: computed(() => formatTime(this.engine.duration.value))
        });
        durationLabel.widget.valign = Gtk.Align.CENTER;
        box.append(durationLabel.widget);

        // --- Volume ---
        const volBtn = new QBtn({
            icon: computed(() => {
                if (this.engine.muted.value || this.engine.volume.value === 0) return 'audio-volume-muted-symbolic';
                if (this.engine.volume.value < 0.5) return 'audio-volume-low-symbolic';
                return 'audio-volume-high-symbolic';
            }),
            onClick: () => {
                this.engine.setMuted(!this.engine.muted.value);
            }
        });
        box.append(volBtn.widget);

        // Clean up when the player is destroyed
        const root = box.get_root();
        if (root) {
            this._attachCleanup(root);
        } else {
            const sigId = box.connect('notify::root', () => {
                const newRoot = box.get_root();
                if (newRoot) {
                    this._attachCleanup(newRoot);
                    box.disconnect(sigId);
                }
            });
        }
    }
    
    _attachCleanup(rootWidget) {
        if (!this._cleanupConnected) {
            this._cleanupConnected = true;
            rootWidget.connect('close-request', () => {
                if (this.engine && this.engine.destroy) {
                    this.engine.destroy();
                }
                return false;
            });
        }
    }
}
