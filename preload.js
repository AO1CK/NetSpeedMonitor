// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateNetworkData: (callback) => ipcRenderer.on('network-data', callback),
  onRequestNetworkData: () => ipcRenderer.invoke('request-network-data')
});