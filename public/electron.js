const { app, BrowserWindow, Menu, Tray, nativeImage, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'logo192.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTray() {
  try {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'logo192.png')).resize({ width: 16, height: 16 });
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Ritual', click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' },
    ]);
    tray.setToolTip('Ritual — Daily Habits');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => { if (mainWindow) mainWindow.show(); });
  } catch (e) { /* tray optional */ }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Keyboard shortcuts
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) mainWindow.webContents.reload();
  });
  globalShortcut.register('CommandOrControl+Shift+J', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'journal');
  });
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'new-habit');
  });
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'focus-timer');
  });
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });

  // Auto-launch on startup
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ── Multi-window: detach timer ────────────────────────────────────────────────
let timerWindow = null;
ipcMain.on('open-timer-window', () => {
  if (timerWindow && !timerWindow.isDestroyed()) { timerWindow.focus(); return; }
  timerWindow = new BrowserWindow({
    width: 380, height: 480,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0f',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
    title: 'Focus Timer',
  });
  const timerUrl = isDev
    ? 'http://localhost:3000?window=timer'
    : `file://${path.join(__dirname, '../build/index.html')}?window=timer`;
  timerWindow.loadURL(timerUrl);
  timerWindow.on('closed', () => { timerWindow = null; });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
