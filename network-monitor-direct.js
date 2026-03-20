const { exec } = require('child_process');
const util = require('util');

// 将 exec 转换为 Promise 版本
const execPromise = util.promisify(exec);

// 获取所有网络接口的每秒字节统计信息
async function getAllNetworkStats() {
  try {
    // 使用 PowerShell 获取所有网络接口的每秒字节统计数据
    const command = `powershell -Command "Get-WmiObject -Class Win32_PerfFormattedData_Tcpip_NetworkInterface | Select-Object Name, BytesSentPersec, BytesReceivedPersec | ConvertTo-Json"`;
    
    const { stdout } = await execPromise(command, { 
      timeout: 10000,
      maxBuffer: 1024 * 1024 // 1MB
    });
    
    // 清理输出中的特殊字符
    const cleanOutput = stdout.replace(/\u0000/g, '').trim();
    
    if (!cleanOutput) {
      throw new Error('PowerShell 命令返回空输出');
    }
    
    let interfaces;
    try {
      interfaces = JSON.parse(cleanOutput);
    } catch (parseError) {
      throw new Error('无法解析 PowerShell 输出: ' + parseError.message);
    }
    
    // 确保 interfaces 是数组格式
    if (!Array.isArray(interfaces)) {
      interfaces = [interfaces];
    }
    
    // 过滤掉回环适配器和空名称的接口
    const validInterfaces = interfaces.filter(iface => 
      iface.Name && 
      !iface.Name.includes('Loopback') && 
      !iface.Name.includes('isatap') &&
      !iface.Name.includes('Teredo')
    );
    
    // 格式化结果
    const result = validInterfaces.map(iface => ({
      iface: iface.Name,
      tx_sec: parseInt(iface.BytesSentPersec) || 0,
      rx_sec: parseInt(iface.BytesReceivedPersec) || 0,
      timestamp: new Date().toISOString()
    }));
    
    return result;
  } catch (error) {
    console.error('获取网络统计数据失败:', error.message);
    // 返回一个默认的网络接口数据，避免完全失败
    return [{
      iface: 'Default Network Interface',
      tx_sec: 0,
      rx_sec: 0,
      timestamp: new Date().toISOString()
    }];
  }
}

// 获取网络速度（每秒字节数）
async function getNetworkSpeed() {
  try {
    // 获取当前统计数据
    const currentStats = await getAllNetworkStats();
    
    if (currentStats.length === 0) {
      return null;
    }
    
    // 筛选出有网络活动的接口（上传或下载速度大于0）
    const activeInterfaces = currentStats.filter(iface => 
      iface.tx_sec > 0 || iface.rx_sec > 0
    );
    
    // 如果有活动的接口，返回所有活动接口的速率总和；否则返回第一个接口
    if (activeInterfaces.length > 0) {
      const totalTx = activeInterfaces.reduce((sum, iface) => sum + iface.tx_sec, 0);
      const totalRx = activeInterfaces.reduce((sum, iface) => sum + iface.rx_sec, 0);
      
      return {
        iface: 'Total of ' + activeInterfaces.length + ' active interfaces',
        tx_sec: totalTx,
        rx_sec: totalRx,
        timestamp: new Date().toISOString()
      };
    } else {
      // 如果没有活动接口，返回第一个接口
      return currentStats[0];
    }
  } catch (error) {
    console.error('获取网络速度失败:', error.message);
    return null;
  }
}

module.exports = {
  getAllNetworkStats,
  getNetworkSpeed
};