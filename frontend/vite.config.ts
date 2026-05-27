// frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // =========================================================
  // PRODUCTION BASE PATH
  // =========================================================
  // Docker + Nginx Production
  // IMPORTANT:
  // GitHub Pages uses /ict-library-office/
  // Docker/Nginx localhost uses /
  // =========================================================
  base: '/',

  server: {
    host: true,

    allowedHosts: [
      'frontend',
      'localhost',
    ],

    proxy: {

      // =========================================================
      // BACKEND API
      // =========================================================
      '/api': {
        target: 'https://ict-library-office-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },

      // =========================================================
      // GRAPHQL
      // =========================================================
      '/graphql': {
        target: 'https://ict-library-office-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})