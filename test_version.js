import GLib from 'gi://GLib';
let versionStr = 'Unknown';
try {
    const [success, stdout, stderr, exit_status] = GLib.spawn_command_line_sync('git describe --tags --abbrev=0');
    if (success && exit_status === 0) {
        const decoder = new TextDecoder('utf-8');
        versionStr = decoder.decode(stdout).trim();
    }
} catch (e) {
    console.error(e);
}
console.log(versionStr);
