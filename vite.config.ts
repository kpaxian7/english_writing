import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 纯前端静态站点。base 设为 './' 便于在任意子路径 / GitHub Pages 下直接打开。
export default defineConfig({
  base: './',
  plugins: [react()],
})
