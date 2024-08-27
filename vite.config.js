import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows connections from any IP address
    port: 8080,
  },
  build: {
    sourcemap: false,
  }
})
