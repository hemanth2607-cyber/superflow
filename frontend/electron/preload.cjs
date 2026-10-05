const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
  executeCode: (args) => ipcRenderer.invoke('code:execute', args),
  checkCompilers: () => ipcRenderer.invoke('code:checkCompilers'),
})
