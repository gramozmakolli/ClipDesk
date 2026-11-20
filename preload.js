const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('clipdesk', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: patch => ipcRenderer.invoke('settings:set', patch),
  setKey: key => ipcRenderer.invoke('key:set', key),
  openFile: kind => ipcRenderer.invoke('dialog:open', kind),
  readImage: p => ipcRenderer.invoke('fs:readImage', p),
  saveImage: (dataUrl, name) => ipcRenderer.invoke('fs:saveImage', dataUrl, name),
  showInFolder: p => ipcRenderer.invoke('shell:show', p),
  convert: opts => ipcRenderer.invoke('convert', opts),
  grabFrame: (input, t) => ipcRenderer.invoke('frame:grab', input, t),
  ask: payload => ipcRenderer.invoke('claude:ask', payload),
  onProgress: cb => {
    ipcRenderer.removeAllListeners('convert:progress');
    ipcRenderer.on('convert:progress', (_e, v) => cb(v));
  },
  transcribe: opts => ipcRenderer.invoke('transcribe', opts),
  onTranscribeStatus: cb => {
    ipcRenderer.removeAllListeners('transcribe:status');
    ipcRenderer.on('transcribe:status', (_e, v) => cb(v));
  },
  pathForFile: file => webUtils.getPathForFile(file),
  fileUrl: p => 'file://' + String(p).split('/').map(encodeURIComponent).join('/'),
});
