import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from 'vite-plugin-singlefile';

// Review 专用配置：构建为可在 Windows 下双击 index.html 直接打开的单文件产物
// - base: './' 使用相对路径，避免 file:// 协议下资源 404
// - viteSingleFile 把 JS/CSS 内联进 HTML，规避 ES module 在 file:// 下的 CORS 限制
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-review',
    emptyOutDir: true,
    sourcemap: false,
    // 关闭代码分割，确保所有 JS 被内联
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
    // 提升内联阈值，小资源也直接 base64 内联
    assetsInlineLimit: 100000000,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    viteSingleFile({
      removeViteModuleLoader: true,
      inlinePattern: ['**/*'],
    }),
  ],
})
