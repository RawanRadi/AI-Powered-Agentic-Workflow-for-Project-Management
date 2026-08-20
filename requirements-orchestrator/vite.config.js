import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Requirements Orchestrator dev server config.
// Requests to /api are proxied to the orchestration backend during `npm run dev`.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
