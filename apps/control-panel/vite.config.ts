import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import json5Plugin from 'vite-plugin-json5'
import * as path from "node:path";

const reactVisualizedFixup = {
  name: 'resolve-fixup',
  setup: (build: any) => {
    build.onResolve({ filter: /react-virtualized/ }, async () => {
      return {
        path: path.resolve('./node_modules/react-virtualized/dist/umd/react-virtualized.js'),
      }
    })
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 10086,
    host: '0.0.0.0',
    proxy: {
      '/api/v1/services/aigc/text-generation/generation': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    json5Plugin(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        reactVisualizedFixup,
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  html: {
    cspNonce: crypto.randomUUID()
  }
})


