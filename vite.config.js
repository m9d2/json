import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 需要指定仓库名作为 base，确保资源路径正确
  base: '/json_formatter/', 
})
