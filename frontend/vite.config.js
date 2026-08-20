import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Python agentic workflow can be exposed behind /api by a thin web layer.
// During development, requests to /api are proxied to that backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
