import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { release } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PythonShell } from 'python-shell';
import { dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';



const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST


  let yoloSettings = {
    pythonPath: 'E:\\Anaconda3\\envs\\python310\\python.exe',
    scriptPath: 'E:\\CVProject\\yolov7-main',
    modelWeights: 'E:\\CVProject\\yolov7-main\\yolov7.pt',
    directory: 'E:\\Electron Project\\demo1\\detect',
  };  


// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.mjs')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      webSecurity: false, // 关闭web安全特性，慎用
      nodeIntegration: true, // 允许在页面中使用 Node.js
      
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      webSecurity: false, // 关闭web安全特性，慎用
      nodeIntegration: true, // 允许在页面中使用 Node.js
      contextIsolation: false, // 关闭上下文隔离
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})


ipcMain.on('update-settings', (event, serializedSettings) => {

  const newSettings = JSON.parse(serializedSettings);
  yoloSettings = newSettings;
  console.log('Updated settings:', yoloSettings);
});



ipcMain.on('detect-objects', async (event, filePaths) => {
  // 这里执行 YOLOv7 的检测逻辑
  // 假设 `runYoloDetection` 是你的 YOLOv7 检测函数
  // console.log(filePaths);
  const detectionResults = await runYoloDetection(filePaths);
  // 可以通过 event.sender.send 将检测结果发送回渲染器进程
  event.sender.send('detection-results', detectionResults);
});

function runYoloDetection(filePaths) {
  console.log("filePaths:", filePaths); // 输出选择的结果
  const sourceArg = Array.isArray(filePaths) ? filePaths.join(' ') : filePaths;
  console.log("sourceArg:", sourceArg); // 输出选择的结果
  let options = {
    mode: 'text',
    pythonPath: yoloSettings.pythonPath, // 替换为你的 Conda 环境中的 Python 路径  'E:\\Anaconda3\\envs\\python310\\python.exe'
    scriptPath: yoloSettings.scriptPath,          //'E:\\CVProject\\yolov7-main'
    pythonOptions: ['-u'], // get print results in real-time
    args: [
        '--weights', yoloSettings.modelWeights , // 替换为实际权重文件的路径   'E:\\CVProject\\yolov7-main\\yolov7.pt'
        '--source',  sourceArg,                  // 上传的文件路径，由用户选择
        '--project', yoloSettings.directory ,    // 结果保存路径   'E:\\Electron Project\\demo1\\detect'
        '--save-txt',          
    ]
};

  PythonShell.run('detect_dev.py', { ...options, mode: 'text' });
}


ipcMain.handle('open-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'] // 允许选择多个文件
  });
  if (result.canceled) {
    return []; // 如果用户取消了操作，返回空数组
  } 
  console.log("Dialog result:", result.filePaths); // 输出选择的结果
  return result.filePaths; // 返回所选文件的路径数组

});



// 在 Electron 主进程中
ipcMain.handle('open-file-dialog-for-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  console.log("Dialog result:", result.filePaths); // 输出选择的结果
  return result.filePaths; // 返回选择的目录路径
});

ipcMain.handle('traverse-directory', (event, directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject('Unable to scan directory: ' + err);
      } else {
        const fileData = files.map(file => {
          const filePath = path.join(directoryPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            creationTime: stats.birthtime
          };
        });
        resolve(fileData);
      }
    });
  });
});


ipcMain.handle('read-dir', async (event, dirPath) => {
  const files = fs.readdirSync(dirPath);
  const filePaths = files.map(file => path.join(dirPath, file));
  return filePaths;
});

ipcMain.handle('read-csv', async (event, filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8'); // 同步读取文件内容
  const results = Papa.parse(fileContent, { header: true }); // 解析 CSV 文件
  return results.data; // 返回解析后的数据
});