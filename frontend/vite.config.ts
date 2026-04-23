import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 🔥 para gumana sa mobile
    proxy: {
      '/api': {
        target: 'http://192.168.8.236:4000',
        changeOrigin: true,
      }
    }
  }
})