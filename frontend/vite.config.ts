//frontend/ vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // IMPORTANT FOR GITHUB PAGES
  base: '/ict-library-office/',

  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://dioxide-gibberish-enforcer.ngrok-free.dev',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})