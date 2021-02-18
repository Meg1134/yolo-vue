require('dotenv').config({ path: join(__dirname, '.env') })

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import externals from 'rollup-plugin-node-externals'
import { join } from 'path'
import { cjs2esm } from './script/utils'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: join(__dirname, 'src/render'),
  server: {
    port: +process.env.PORT,
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'src/render'),
      '@root': __dirname,
    },
  },
  optimizeDeps: {
    exclude: ['electron-store', 'electron']
  },
  build: {
    outDir: join(__dirname, 'dist/render'),
    rollupOptions: {
      external: ['electron'],
      plugins: [
        externals(),
        // cjs2esm(),
      ],
    },
  },
})
