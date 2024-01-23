import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'


const router = createRouter({
  history: createWebHashHistory(),
    routes: [
        // 这是我们检测的管理页面
        { path: '/', 
        component: () => import('@/views/layout/LayoutContainer.vue'),
        redirect: '/result',
        children:[
            {   
                path: '/result',
                component: () => import('@/views/detect/DetectManage.vue'),
              },
              { name: 'detect',
                path: '/detect',
                component: () => import('@/views/detect/Detect.vue'),
              },
              {
                path: '/show',
                component: () => import('@/views/show/ShowManage.vue'),
              }
        ]
    },
    ]
})

export default router