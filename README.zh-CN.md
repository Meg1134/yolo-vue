# electron-vue-vite

![awesome-vite](https://camo.githubusercontent.com/abb97269de2982c379cbc128bba93ba724d8822bfbe082737772bd4feb59cb54/68747470733a2f2f63646e2e7261776769742e636f6d2f73696e647265736f726875732f617765736f6d652f643733303566333864323966656437386661383536353265336136336531353464643865383832392f6d656469612f62616467652e737667)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/electron-vue-vite?style=flat)
![GitHub stars](https://img.shields.io/github/stars/caoxiemeihao/electron-vue-vite?color=fa6470&style=flat)
![GitHub forks](https://img.shields.io/github/forks/caoxiemeihao/electron-vue-vite?style=flat)


**[English](README.md) | 简体中文**

🥳 `Electron` + `Vue3` + `Vite2` 整合模板 -- **结构简单，容易上手！**

## 概述

&emsp;&emsp;这是一个追求精简的`Electron`类整合模板，只保持最基本的文件、最基本的依赖、最基本的功能；而不是大而全的、臃肿的设计。这样做的目的是能确保模板足够灵活。

所以说如果你是对 -- 工程模板追求精简的 Coder，或者刚入世的小白想弄明白`Electron`整合类模板最基础的工作原理，亦或者你是大神只是想偷懒少干点活；那么这个模板最合适你不过了。

尽管如此，我还是希望你对`Electron` `Vite`有一定的基础；因为除了项目结构简单外，这份`README`也显得 “精简” 。

模板的具体实现细节我相信你看两遍源码就能把它吃透了 😋

## 运行项目

  ```bash
  # clone the project
  git clone git@github.com:caoxiemeihao/electron-vue-vite.git

  # enter the project directory
  cd electron-vue-vite

  # install dependency
  npm install

  # develop
  npm run dev
  ```

## 目录结构

&emsp;&emsp;一旦启动或打包脚本执行过，会在根目录产生 **`dist` 文件夹，里面的文件夹同 `src` 一模一样**；在使用一些路径计算时，尤其是相对路径计算；`dist` 与 `src` 里面保持相同的目录结构能避开好多问题

```tree
├
├── configs
├   ├── vite-main.config.ts          主进程配置文件，编译 src/main
├   ├── vite-preload.config.ts       预加载脚本配置文件，编译 src/preload
├   ├── vite-renderer.config.ts      渲染进程配置文件，编译 src/renderer
├
├── dist                             构建后，根据 src 目录生成
├   ├── main
├   ├── preload
├   ├── renderer
├
├── scripts
├   ├── build.mjs                    项目构建脚本，对应 npm run build
├   ├── watch.mjs                    项目开发脚本，对应 npm run dev
├
├── src
├   ├── main                         主进程源码
├   ├── preload                      预加载脚本源码
├   ├── renderer                     渲染进程源码
├
```

## 渲染进程使用 NodeJs API

> 🚧 因为安全的原因 Electron 默认不支持在 渲染进程 中使用 NodeJs API，但是有些小沙雕就是想这么干，拦都拦不住；实在想那么干的话，这里有个 👉 npm 包 **[vitejs-plugin-electron](https://www.npmjs.com/package/vitejs-plugin-electron)** 或者使用另一个模板 **[electron-vite-boilerplate](https://github.com/caoxiemeihao/electron-vite-boilerplate)**


#### 推荐所有的 NodeJs、Electron API 通过 `Preload-script` 注入到 渲染进程中，例如：

* **src/preload/index.ts**

  ```typescript
  import fs from 'fs'
  import { contextBridge, ipcRenderer } from 'electron'

  // --------- Expose some API to Renderer-process. ---------
  contextBridge.exposeInMainWorld('fs', fs)
  contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
  ```

* **src/renderer/src/global.d.ts**

  ```typescript
  // Defined on the window
  interface Window {
    fs: typeof import('fs')
    ipcRenderer: import('electron').IpcRenderer
  }
  ```

* **src/renderer/main.ts**

  ```typescript
  // Use Electron, NodeJs API in Renderer-process
  console.log('fs', window.fs)
  console.log('ipcRenderer', window.ipcRenderer)
  ```

## 小白问题

```
小白直接使用(别墨迹): https://github.com/caoxiemeihao/electron-vite-boilerplate

一、经典报错: __dirname is not defined
  众所周知 - electron 共有三种环境/三种状态即: NodeJs、Electron-Main、Electron-Renderer。

  1. 使用 vite 启动 electron 时候，为 NodeJs 运行环境，node_modules/electron 包导出的只是一个 electron.exe 的文件路径。
当使用 vite 且在 Electron-Renderer 中使用且 Electron-Renderer 中未开启 node.js 集成；
那么此时 import/require(‘electron’) 会使用 NodeJs 环境下的 electron —— 遂报错

  2. 所以 Electron-Main、Electron-Renderer 中要使用 electron 必须保障能正确加载到对应的 electron-main、electron-renderer 版本。
vite build 与 build.lib 模式下只需要 build.rollupOptions.external 配置中加入 electron 即可
vite serve 下比较麻烦，需要对 import(‘electron’) 进行拦截，可以使用 vitejs-plugin-electron 处理

二、dependencies 与 devDependencies
  对待 Electron-Main、Preload-Script 时 vite 会以 lib 形式打包 commonjs 格式代码；
如果碰 node 环境的包可以直接放到 dependencies 中，vite 会解析为 require('xxxx')；
electron-builder 打包时候会将 dependencies 中的包打包到 app.asar 里面

  对待 Electron-Renderer 时 vite 会以 ESM 格式解析代码；
像 vue、react 这种前端用的包可以直接被 vite 构建，所以不需要 vue、react 源码；
现实情况 vue、react 放到 dependencies 或 devDependencies 中都可以被正确构建；
但是放到 dependencies 会被 electron-builder 打包到 app.asar 里面导致包体变大；
所以放到 devDependencies 既能被正确构建还可以减小 app.asar 体积，一举两得
```
这里有个值得看的 issues [请教一下vite-renderer.config中的resolveElectron函数](https://github.com/caoxiemeihao/electron-vue-vite/issues/52)

## 运行效果
<img width="400px" src="https://raw.githubusercontent.com/caoxiemeihao/blog/main/electron-vue-vite/screenshot/electron-15.png" />

## 微信 | | 请我喝杯下午茶 🥳

<div style="display:flex;">
  <img width="244px" src="https://raw.githubusercontent.com/caoxiemeihao/blog/main/assets/wechat/group/qrcode.jpg" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="244px" src="https://raw.githubusercontent.com/caoxiemeihao/blog/main/assets/wechat/%24qrcode/%24.png" />
</div>
