const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

function isWebUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 850,
    minHeight: 600,
    title: 'Nova PC',
    backgroundColor: '#090b15',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    // Keep the embedded browser isolated from the app's JavaScript context.
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    if (params.src && !isWebUrl(params.src)) event.preventDefault();
  });

  win.webContents.on('did-attach-webview', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (isWebUrl(url)) shell.openExternal(url);
      return { action: 'deny' };
    });
    contents.on('will-navigate', (event, url) => {
      if (!isWebUrl(url) && !url.startsWith('about:')) event.preventDefault();
    });
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
