import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  build: {
    outDir: '../backend/public',
    emptyOutDir: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
