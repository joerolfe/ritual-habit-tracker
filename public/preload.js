const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut', (event, key) => callback(key));
  },
  openTimerWindow: () => ipcRenderer.send('open-timer-window'),
  removeShortcutListener: () => ipcRenderer.removeAllListeners('shortcut'),
});

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron-app');
});
