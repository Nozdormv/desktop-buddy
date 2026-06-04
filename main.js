const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 160,
    height: 220,
    x: Math.floor(screenW / 2 - 80),
    y: Math.floor(screenH / 2 - 80),
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('renderer.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify();
}

autoUpdater.on('update-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available');
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded');
  }
});

app.whenReady().then(() => {
  createWindow();
  checkForUpdates();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('move-window', (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.on('get-screen-size', (event) => {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  event.returnValue = { width, height };
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('restart-app', () => {
  app.relaunch();
  app.quit();
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});
