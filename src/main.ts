import { createApp } from 'vue'
import App from './App.vue'
import pinia from '@/store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import './assets/style.css'
// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'


const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)


app.mount('#app')
