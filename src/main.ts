// 先导入Tailwind CSS
import './assets/tailwind.css'
import './assets/markdown.css'
import './assets/code-editor.css'
import './assets/language-select.css'
import './assets/custom-select.css'
import './assets/language-order.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 导入Element Plus及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入弹窗样式修复 - 放在最后以确保最高优先级
import './assets/dialog-fix.css'
import './assets/dropdown-fix.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 全局配置Element Plus
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
})

// 设置Element Plus MessageBox的全局默认配置
import { ElMessageBox, ElConfigProvider } from 'element-plus'

// 使用全局配置提供者设置默认值
app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 3000,
}

// 使用ElConfigProvider组件配置全局属性
app.use(ElConfigProvider, {
  size: 'default',
  zIndex: 3000,
  button: {
    autoInsertSpace: true,
  },
  message: {
    max: 3,
  },
  // 配置MessageBox全局属性
  messageBox: {
    closeOnClickModal: false,
    closeOnPressEscape: true,
    distinguishCancelAndClose: true, // 区分取消和关闭操作
  },
})

app.mount('#app')
