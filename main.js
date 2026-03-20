const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getNetworkSpeed } = require('./network-monitor-direct');

// 全局变量用于存储累计数据
let totalUpload = 0;
let totalDownload = 0;
let previousNetworkData = null;
let previousTime = Date.now();

// 创建浏览器窗口
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 移除菜单栏
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);

  // 加载应用的 HTML 文件
  mainWindow.loadFile('index.html');

  // 在开发环境中打开开发者工具
  // mainWindow.webContents.openDevTools();
  
  // 启动网络监控
  startNetworkMonitoring(mainWindow);
};

// 网络监控函数
const startNetworkMonitoring = (window) => {
  setInterval(async () => {
    try {
      const currentData = await getNetworkSpeed();
      
      if (currentData) {
        const currentTime = Date.now();
        const timeDiff = (currentTime - previousTime) / 1000; // 转换为秒
        
        // 计算实时速度 (bytes/sec)
        let uploadSpeed = currentData.tx_sec || 0;
        let downloadSpeed = currentData.rx_sec || 0;
        
        // 计算累计流量
        if (timeDiff > 0) {
          totalUpload += uploadSpeed * timeDiff;
          totalDownload += downloadSpeed * timeDiff;
        }
        
        previousNetworkData = currentData;
        previousTime = currentTime;
        
        const networkData = {
          uploadSpeed: uploadSpeed,
          downloadSpeed: downloadSpeed,
          totalUpload: totalUpload,
          totalDownload: totalDownload,
          uploadSpeedFormatted: formatBytes(uploadSpeed) + '/s',
          downloadSpeedFormatted: formatBytes(downloadSpeed) + '/s',
          totalUploadFormatted: formatBytes(totalUpload),
          totalDownloadFormatted: formatBytes(totalDownload)
        };
        
        // 发送数据到渲染进程
        window.webContents.send('network-data', networkData);
      }
    } catch (error) {
      console.error('Error getting network stats:', error);
    }
  }, 1000); // 每秒更新一次
};

// 格式化字节单位
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，应用程序及其菜单栏通常会保持活动状态，直到用户明确退出
  if (process.platform !== 'darwin') app.quit();
});

// IPC 处理程序
ipcMain.handle('request-network-data', async () => {
  return {
    totalUpload: totalUpload,
    totalDownload: totalDownload,
    totalUploadFormatted: formatBytes(totalUpload),
    totalDownloadFormatted: formatBytes(totalDownload)
  };
});