import { join } from 'path'
import { builtinModules } from 'module'
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import resolve from 'vite-plugin-resolve'
import pkg from '../../package.json'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    vue(),
    resolveElectron(
      /**
       * you can custom other module in here
       * 🚧 need to make sure custom-resolve-module in `dependencies`, that will ensure that the electron-builder can package them correctly
       * @example
       * {
       *   'electron-store': 'const Store = require("electron-store"); export defalut Store;',
       * }
       */
    ),
  ],
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../dist/renderer',
  },
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT,
  },
})

// ------- For use Electron, NodeJs in Renderer-process -------
// https://github.com/caoxiemeihao/electron-vue-vite/issues/52
export function resolveElectron(resolves: Parameters<typeof resolve>[0] = {}): Plugin {
  const builtins = builtinModules.filter(t => !t.startsWith('_'))

  // https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/resolve#readme
  return resolve({
    electron: electronExport(),
    ...builtinModulesExport(builtins),
    ...resolves,
  })

  function electronExport() {
    return `
  /**
   * All exports module see https://www.electronjs.org -> API -> Renderer Process Modules
   */
  const electron = require("electron");
  const {
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
    deprecate,
  } = electron;
  
  export {
    electron as default,
    clipboard,
    nativeImage,
    shell,
    contextBridge,
    crashReporter,
    ipcRenderer,
    webFrame,
    desktopCapturer,
    deprecate,
  }
  `
  }

  function builtinModulesExport(modules: string[]) {
    return modules.map((moduleId) => {
      const nodeModule = require(moduleId)
      const requireModule = `const M = require("${moduleId}");`
      const exportDefault = `export default M;`
      const exportMembers = Object.keys(nodeModule).map(attr => `export const ${attr} = M.${attr}`).join(';\n') + ';'
      const nodeModuleCode = `
${requireModule}

${exportDefault}

${exportMembers}
  `

      return { [moduleId]: nodeModuleCode }
    }).reduce((memo, item) => Object.assign(memo, item), {})
  }
}
