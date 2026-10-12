const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inventoryAPI', {
  authStatus: () => ipcRenderer.invoke('auth:status'),
  createAccount: (data) => ipcRenderer.invoke('auth:create', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
  getDashboardSummary: () => ipcRenderer.invoke('dashboard:summary'),
  listSales: (filters) => ipcRenderer.invoke('sales:list', filters),
  createSale: (data) => ipcRenderer.invoke('sales:create', data),
  listPurchases: (filters) => ipcRenderer.invoke('purchases:list', filters),
  createPurchase: (data) => ipcRenderer.invoke('purchases:create', data),
  listStockMovements: (filters) => ipcRenderer.invoke('stock:movements', filters),
  adjustStock: (data) => ipcRenderer.invoke('stock:adjust', data),
  listProducts: () => ipcRenderer.invoke('products:list'),
  createProduct: (data) => ipcRenderer.invoke('products:create', data),
  updateProduct: (id, data) => ipcRenderer.invoke('products:update', id, data),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id)
});
