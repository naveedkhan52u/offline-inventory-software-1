const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inventoryAPI', {
  authStatus: () => ipcRenderer.invoke('auth:status'),
  createAccount: (data) => ipcRenderer.invoke('auth:create', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
  listProducts: () => ipcRenderer.invoke('products:list'),
  createProduct: (data) => ipcRenderer.invoke('products:create', data),
  updateProduct: (id, data) => ipcRenderer.invoke('products:update', id, data),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id)
});
