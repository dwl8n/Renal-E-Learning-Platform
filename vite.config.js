import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this repo from /Renal-E-Learning-Platform/, so
  // built asset URLs need this base path to resolve correctly.
  base: '/Renal-E-Learning-Platform/',
})
