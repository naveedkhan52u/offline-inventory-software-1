const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inventoryAPI', {
  authStatus: () => ipcRenderer.invoke('auth:status'),
  createAccount: (data) => ipcRenderer.invoke('auth:create', data),
  login: (data) => ipcRenderer.invoke('auth:login', data)
});
