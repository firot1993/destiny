import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change this to your repo name for GitHub Pages
  // e.g. '/destiny/' if your repo is github.com/username/destiny
  base: '/destiny/',
})
