import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // so the dev server can be opened from a phone on the same wifi
  server: { host: true },
})
