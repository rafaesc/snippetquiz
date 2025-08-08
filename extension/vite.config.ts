import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    server: {
      port: 4000,
      open: isDev ? '/index.dev.html' : '/index.html',
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
          'content-script': './src/content-script.ts',
        },
        output: {
          entryFileNames: chunk => {
            // Background script
            if (chunk.name === 'background') return 'background.js'
            // Content script
            if (chunk.name === 'content-script') return 'content-script.js'
            return 'assets/[name]-[hash].js'
          }
        }
      },
    },
  };
});
