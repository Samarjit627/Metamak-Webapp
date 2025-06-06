import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: [
      '@react-three/fiber',
      '@react-three/drei',
      'zustand',
      'react-zoom-pan-pinch',
      'js-tiktoken',
      'pdfjs-dist',
      'tesseract.js',
      'openai',
      'uuid'
    ],
    exclude: ['occt-import-js']
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
        }
      },
      '/api': {
        target: 'http://localhost:58059',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: ['esnext'],
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          pdfjs: ['pdfjs-dist'],
          mathjs: ['mathjs'],
          tiktoken: ['js-tiktoken'],
          tesseract: ['tesseract.js'],
          openai: ['openai'],
          uuid: ['uuid']
        }
      }
    }
  }
});