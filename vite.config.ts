import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    allowedHosts: ['pllysun.top'],
    hmr: {
      // 增加WebSocket帧大小限制
      clientPort: 24678,
      host: 'localhost'
    },
    // 增加最大请求体大小限制为10MB
    fs: {
      strict: true
    },
    proxy: {
      '/api': {
        target: 'http://pllysun.top:7500',
        changeOrigin: true,
        secure: false,
        // 增加代理的请求体大小限制
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 设置更大的请求体大小限制
            req.maxBodyLength = 10 * 1024 * 1024; // 10MB
          });
        }
      }
    }
  },
})
