import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/centurygame': {
        target: 'https://wos-giftcode-api.centurygame.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/centurygame/, ''),
        headers: {
          'Origin': 'https://wos-giftcode.centurygame.com',
          'Referer': 'https://wos-giftcode.centurygame.com/'
        }
      }
    }
  }
})
