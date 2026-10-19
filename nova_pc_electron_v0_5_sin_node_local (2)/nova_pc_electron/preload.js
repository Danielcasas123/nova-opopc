const { contextBridge, shell } = require('electron');
contextBridge.exposeInMainWorld('nova', {
  openExternal: (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') shell.openExternal(parsed.href);
    } catch (_) {}
  }
});
