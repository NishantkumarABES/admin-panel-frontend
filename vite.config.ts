import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: true,  
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost', '127.0.0.1',
      '.ngrok-free.app',
      '.onrender.com'  
    ],
  },
})