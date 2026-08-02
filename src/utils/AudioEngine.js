import GLib from 'gi://GLib';
import Gst from 'gi://Gst';
import { ref } from '../reactivity.js';

let _gstInitialized = false;

export class AudioEngine {
    constructor(videoSink = null) {
        if (!_gstInitialized) {
            Gst.init(null);
            _gstInitialized = true;
        }

        this.player = Gst.ElementFactory.make("playbin", null);
        
        if (videoSink) {
            this.player.set_property('video-sink', videoSink);
        }
        
        // Reactive state
        this.src = ref('');
        this.isPlaying = ref(false);
        this.currentTime = ref(0);
        this.duration = ref(0);
        this.volume = ref(1.0);
        this.muted = ref(false);

        // Gst Bus for messages (EOS, Errors, State Changes)
        const bus = this.player.get_bus();
        bus.add_signal_watch();
        bus.connect('message', (bus, msg) => this._onBusMessage(bus, msg));

        // Periodic timer to update currentTime
        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
            if (this.isPlaying.value) {
                this._updatePosition();
            }
            return GLib.SOURCE_CONTINUE;
        });
    }

    setSrc(uri) {
        this.player.set_state(Gst.State.NULL);
        this.src.value = uri;
        this.player.set_property('uri', uri);
        this.currentTime.value = 0;
        this.duration.value = 0;
    }

    play() {
        this.player.set_state(Gst.State.PLAYING);
    }

    pause() {
        this.player.set_state(Gst.State.PAUSED);
    }
    
    stop() {
        this.player.set_state(Gst.State.NULL);
        this.currentTime.value = 0;
        this.isPlaying.value = false;
    }

    seek(seconds) {
        const nanoseconds = seconds * 1000000000;
        this.player.seek_simple(
            Gst.Format.TIME, 
            Gst.SeekFlags.FLUSH | Gst.SeekFlags.KEY_UNIT, 
            nanoseconds
        );
        this.currentTime.value = seconds;
    }

    setVolume(vol) {
        // GStreamer volume is typically 0.0 to 1.0, though can go higher
        this.player.set_property('volume', vol);
        this.volume.value = vol;
    }
    
    setMuted(muted) {
        this.player.set_property('mute', muted);
        this.muted.value = muted;
    }

    _updatePosition() {
        const [ret, pos] = this.player.query_position(Gst.Format.TIME);
        if (ret) {
            this.currentTime.value = pos / 1000000000; // Convert ns to seconds
        }
        
        if (this.duration.value === 0) {
            const [durRet, dur] = this.player.query_duration(Gst.Format.TIME);
            if (durRet) {
                this.duration.value = dur / 1000000000;
            }
        }
    }

    _onBusMessage(bus, msg) {
        switch (msg.type) {
            case Gst.MessageType.STATE_CHANGED:
                if (msg.src === this.player) {
                    const [oldState, newState, pending] = msg.parse_state_changed();
                    this.isPlaying.value = (newState === Gst.State.PLAYING);
                }
                break;
            case Gst.MessageType.EOS:
                this.isPlaying.value = false;
                this.player.set_state(Gst.State.READY);
                this.currentTime.value = 0;
                break;
            case Gst.MessageType.ERROR:
                const [err, debug] = msg.parse_error();
                console.error("GStreamer Error:", err.message, debug);
                this.isPlaying.value = false;
                break;
        }
    }

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
        this.player.set_state(Gst.State.NULL);
        // Clear references
        this.player = null;
    }
}
