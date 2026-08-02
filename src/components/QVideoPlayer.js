import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import Gst from 'gi://Gst';
import { BaseComponent } from '../component.js';
import { effect, computed } from '../reactivity.js';
import { AudioEngine as MediaEngine } from '../utils/AudioEngine.js';
import { QBtn } from './QBtn.js';
import { QSlider } from './QSlider.js';
import { QLabel } from './QLabel.js';

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export class QVideoPlayer extends BaseComponent {
    constructor(props = {}) {
        const engine = props.engine || 'native';
        let widget;
        
        if (engine === 'native') {
            widget = new Gtk.Overlay();
            const picture = new Gtk.Picture();
            picture.can_shrink = true;
            widget.set_child(picture);
            
            let sink = null;
            try {
                Gst.init(null);
                sink = Gst.ElementFactory.make('gtk4paintablesink', null);
                if (sink) {
                    picture.set_paintable(sink.get_property('paintable'));
                }
            } catch (e) {
                console.error("GStreamer gtk4paintablesink not available.");
            }
            
            const mediaEngine = new MediaEngine(sink);
            
            if (props.src) {
                effect(() => {
                    const src = props.src.value !== undefined ? props.src.value : props.src;
                    if (src) {
                        mediaEngine.setSrc(src);
                        if (props.autoplay) mediaEngine.play();
                    }
                });
            }

            if (props.controls !== false) {
                const controlsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
                controlsBox.add_css_class('osd');
                controlsBox.margin_bottom = 15;
                controlsBox.margin_start = 15;
                controlsBox.margin_end = 15;
                controlsBox.valign = Gtk.Align.END;
                
                const playBtn = new QBtn({
                    icon: computed(() => mediaEngine.isPlaying.value ? 'media-playback-pause-symbolic' : 'media-playback-start-symbolic'),
                    onClick: () => {
                        if (mediaEngine.isPlaying.value) {
                            mediaEngine.pause();
                        } else {
                            mediaEngine.play();
                        }
                    }
                });
                controlsBox.append(playBtn.widget);
                
                const timeLabel = new QLabel({ label: computed(() => formatTime(mediaEngine.currentTime.value)) });
                controlsBox.append(timeLabel.widget);
                
                const scrubber = new QSlider({
                    min: 0,
                    max: computed(() => mediaEngine.duration.value || 100),
                    modelValue: mediaEngine.currentTime
                });
                scrubber.widget.hexpand = true;
                scrubber.widget.connect('change-value', (scale, scroll_type, value) => {
                    if (mediaEngine.duration.value > 0) mediaEngine.seek(value);
                    return false;
                });
                controlsBox.append(scrubber.widget);
                
                const durLabel = new QLabel({ label: computed(() => formatTime(mediaEngine.duration.value)) });
                controlsBox.append(durLabel.widget);
                
                widget.add_overlay(controlsBox);
            }
            
            // Add click-to-play on the video itself
            const click = new Gtk.GestureClick();
            click.connect('released', () => {
                if (mediaEngine.isPlaying.value) {
                    mediaEngine.pause();
                } else {
                    mediaEngine.play();
                }
            });
            picture.add_controller(click);

            // Cleanup when removed from DOM
            widget.connect('destroy', () => {
                mediaEngine.destroy();
            });

        } else if (engine === 'web') {
            const webKitMod = imports.gi.WebKit ? imports.gi.WebKit : null;
            if (!webKitMod) {
                widget = new Gtk.Label({ label: 'WebKit engine requested but not available.' });
            } else {
                widget = new webKitMod.WebView();
                
                const loadVideo = (src) => {
                    if (!src) return;
                    
                    const controls = props.controls !== false ? 'controls' : '';
                    const autoplay = props.autoplay ? 'autoplay' : '';
                    const loop = props.loop ? 'loop' : '';
                    
                    const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
                            video { width: 100%; height: 100%; object-fit: contain; }
                        </style>
                    </head>
                    <body>
                        <video src="${src}" ${controls} ${autoplay} ${loop}></video>
                    </body>
                    </html>
                    `;
                    widget.load_html(html, null);
                };

                if (props.src && props.src.value !== undefined) {
                    effect(() => loadVideo(props.src.value));
                } else if (props.src) {
                    loadVideo(props.src);
                }
            }
        }
        
        super(widget);
    }
}
