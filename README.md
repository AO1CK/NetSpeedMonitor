# 网络速度监控器

一个基于 Electron 开发的实时网络速度监控工具，可以监控网络接口的上传和下载速度。

## 功能特性

- 实时显示网络上传和下载速度
- 累计统计总上传和下载流量
- 自动检测所有活动的网络接口
- 美观的渐变背景界面
- 每秒自动更新数据

## 系统要求

- Windows 操作系统
- Node.js (推荐 v16 或更高版本)
- npm 或 yarn

## 安装步骤

1. 克隆或下载项目到本地

2. 安装依赖：
```bash
npm install
```

## 使用方法

### 开发模式运行

```bash
npm start
```

或

```bash
npm run dev
```

### 直接运行（无控制台）

双击 `start-monitor.vbs` 文件可以在后台运行应用，不会显示命令行窗口。

### 打包应用

打包成可执行文件：

```bash
npm run dist
```

打包但不生成安装包（用于测试）：

```bash
npm run pack
```

打包后的文件将输出到 `dist` 目录。

## 技术栈

- **Electron**: 桌面应用框架
- **systeminformation**: 系统信息获取库
- **PowerShell**: Windows 网络性能数据获取
- **HTML5/CSS3**: 前端界面展示

## 项目结构

```
electron/
├── main.js              # Electron 主进程
├── renderer.js          # 渲染进程
├── preload.js           # 预加载脚本
├── network-monitor-direct.js  # 网络监控核心模块
├── index.html           # 主界面
├── start-monitor.vbs    # 无控制台运行脚本
├── package.json         # 项目配置
└── README.md            # 项目说明
```

## 工作原理

1. 主进程通过 PowerShell 命令获取 Windows 网络接口的性能数据
2. 使用 `Win32_PerfFormattedData_Tcpip_NetworkInterface` WMI 类获取实时流量统计
3. 每秒计算上传和下载速度，并累计总流量
4. 通过 IPC 将数据发送到渲染进程显示

## 作者

张丁予
