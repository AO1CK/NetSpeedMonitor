// renderer.js
const uploadSpeedElement = document.getElementById('upload-speed');
const downloadSpeedElement = document.getElementById('download-speed');
const totalUploadElement = document.getElementById('total-upload');
const totalDownloadElement = document.getElementById('total-download');
const lastUpdatedElement = document.getElementById('last-updated');

// 监听来自主进程的网络数据
window.electronAPI.onUpdateNetworkData((event, data) => {
    // 更新实时速度显示
    uploadSpeedElement.textContent = data.uploadSpeedFormatted || '0 KB/s';
    downloadSpeedElement.textContent = data.downloadSpeedFormatted || '0 KB/s';
    
    // 更新累计流量显示
    totalUploadElement.textContent = data.totalUploadFormatted || '0 KB';
    totalDownloadElement.textContent = data.totalDownloadFormatted || '0 KB';
    
    // 更新最后更新时间
    const now = new Date();
    lastUpdatedElement.textContent = now.toLocaleTimeString();
});

// 页面加载完成后请求初始数据
document.addEventListener('DOMContentLoaded', () => {
    // 请求初始数据
    window.electronAPI.onRequestNetworkData().then(data => {
        if (data) {
            totalUploadElement.textContent = data.totalUploadFormatted || '0 KB';
            totalDownloadElement.textContent = data.totalDownloadFormatted || '0 KB';
        }
    });
});