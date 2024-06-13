import { BrowserWindow } from 'electron';

export function showWindow(window: BrowserWindow): void {
  if (!window) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  if (!window.isFocused()) {
    window.focus();
  }

  window.show();
}
