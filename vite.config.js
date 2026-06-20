import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置，GitHub Pages 部署需要设置 base 为仓库名
export default defineConfig({
  plugins: [vue()],
  base: '/baby-feeding-record/',
  build: {
    outDir: 'dist'
  }
})
