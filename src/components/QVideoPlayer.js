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

/**
 * QVideoPlayer Component
 * 
 * A versatile, dual-engine video player component for Alchemy.
 * 
 * @param {Object} props
 * @param {string|Ref} props.src - The URI or path to the video file. Can be reactive.
 * @param {string} [props.engine='native'] - 'native' (GTK/GStreamer) or 'web' (WebKit HTML5).
 * @param {boolean} [props.controls=true] - Whether to display playback controls.
 * @param {boolean} [props.autoplay=false] - Whether to start playback automatically.
 * @param {boolean} [props.loop=false] - Whether to loop the video upon reaching the end.
 */
export class QVideoPlayer extends BaseComponent {
    constructor(props = {}) {
        const engine = props.engine || 'native';
        let widget;
        
        if (engine === 'native') {
            widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
            const picture = new Gtk.Picture();
            picture.can_shrink = true;
            picture.vexpand = true;
            
            // Put picture in an overlay so we can catch clicks easily without expanding issues
            const pictureOverlay = new Gtk.Overlay();
            pictureOverlay.set_child(picture);
            pictureOverlay.vexpand = true;
            widget.append(pictureOverlay);
            
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
                // Remove OSD class since it's no longer floating
                controlsBox.margin_top = 10;
                controlsBox.margin_bottom = 10;
                controlsBox.margin_start = 10;
                controlsBox.margin_end = 10;
                controlsBox.valign = Gtk.Align.CENTER;
                
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
                
                widget.append(controlsBox);
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
            pictureOverlay.add_controller(click);

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
                    
                    const autoplay = props.autoplay ? 'autoplay' : '';
                    const loop = props.loop ? 'loop' : '';
                    
                    const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; flex-direction: column; }
                            .video-container { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; }
                            video { max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer; }
                            .controls { height: 50px; background: #1e1e1e; display: ${props.controls !== false ? 'flex' : 'none'}; align-items: center; padding: 0 15px; gap: 15px; color: #ddd; font-family: sans-serif; font-size: 13px; }
                            button { background: none; border: none; color: white; cursor: pointer; font-size: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
                            button:hover { background: #333; border-radius: 4px; }
                            input[type=range] { flex: 1; accent-color: #3584e4; cursor: pointer; }
                        </style>
                    </head>
                    <body>
                        <div class="video-container">
                            <video id="vid" src="${src}" ${autoplay} ${loop}></video>
                        </div>
                        <div class="controls">
                            <button id="playBtn">▶</button>
                            <span id="cur">0:00</span>
                            <input type="range" id="seek" value="0" min="0" step="0.1">
                            <span id="dur">0:00</span>
                        </div>
                        <script>
                            const vid = document.getElementById('vid');
                            const playBtn = document.getElementById('playBtn');
                            const cur = document.getElementById('cur');
                            const dur = document.getElementById('dur');
                            const seek = document.getElementById('seek');
                            
                            function fmt(s) {
                                if (isNaN(s)) return '0:00';
                                const m = Math.floor(s/60);
                                const ss = Math.floor(s%60).toString().padStart(2,'0');
                                return m+':'+ss;
                            }
                            
                            function toggle() { if(vid.paused) vid.play(); else vid.pause(); }
                            playBtn.onclick = toggle;
                            vid.onclick = toggle;
                            
                            vid.onplay = () => playBtn.textContent = '⏸';
                            vid.onpause = () => playBtn.textContent = '▶';
                            
                            vid.onloadedmetadata = () => {
                                dur.textContent = fmt(vid.duration);
                                seek.max = vid.duration;
                            };
                            
                            vid.ontimeupdate = () => {
                                cur.textContent = fmt(vid.currentTime);
                                if(document.activeElement !== seek) seek.value = vid.currentTime;
                            };
                            
                            seek.oninput = () => vid.currentTime = seek.value;
                        </script>
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
