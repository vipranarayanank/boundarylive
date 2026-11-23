import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const page = (name: string) => fileURLToPath(new URL('./' + name, import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: page('index.html'),
        details: page('details.html'),
        live: page('live.html'),
        contact: page('contact.html')
      }
    }
  }
})