import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        }
      ],
    }),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html',
        background: './src/background.ts',
      },
      output: {
        entryFileNames: chunk => {
          // Si es el background script, llámalo background.js
          if (chunk.name === 'background') return 'background.js'
          return 'assets/[name]-[hash].js'
        }
      }
    },
  },
});