const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  getScreenSize: () => ipcRenderer.sendSync('get-screen-size'),
  closeApp: () => ipcRenderer.send('close-app'),
  restartApp: () => ipcRenderer.send('restart-app'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  installUpdate: () => ipcRenderer.send('install-update'),
});
