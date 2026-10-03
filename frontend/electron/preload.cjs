const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
})
