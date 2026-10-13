import { useFileSystemStore } from '#stores/filesystem.store';
import { useThemeStore } from '#stores/theme.store';

/**
 * System Reset Service
 *
 * Performs an operating-system-level factory reset (equivalent to `sudo rm -rf`):
 * 1. Resets the Virtual File System (VFS) to pristine initial system files (bio.md, skills.md, contact.md, welcome.txt, demo.js).
 * 2. Closes all active/open viewer and IDE file tabs.
 * 3. Restores desktop wallpaper to Deep Space and accent color to Aurora Cyan with auto-sync enabled.
 * 4. Clears custom desktop icon positions from localStorage and in-memory stores.
 * 5. Dispatches an 'aec-system-reset' window event to synchronously notify desktop and components.
 */
export function performSystemReset(): void {
  // 1. Reset VFS files and tab states
  useFileSystemStore.getState().reset();

  // 2. Reset Theme & Wallpaper to default
  useThemeStore.getState().reset();

  // 3. Clear localStorage items
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('aec-desktop-icon-positions');
    } catch {
      // ignore
    }
  }

  // 4. Dispatch custom event for Desktop and other listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aec-system-reset'));
  }
}
