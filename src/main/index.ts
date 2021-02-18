/**
 * electron 主文件
 */
require('dotenv').config({ path: join(__dirname, '../../.env') })

import { join } from 'path'
import { app, BrowserWindow } from 'electron'

let win: BrowserWindow

function createWin() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  const URL = app.isPackaged
    ? `file://${join(__dirname, '../render/index.html')}` // vite 构建后的静态文件地址
    : `http://localhost:${process.env.PORT}` // vite 启动的服务器地址

  win?.loadURL(URL)
}

app.whenReady().then(createWin)
