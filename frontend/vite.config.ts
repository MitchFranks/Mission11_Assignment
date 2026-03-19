import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configure Vite to serve the React app on port 3000
// and proxy API requests to the ASP.NET backend on port 5156
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
