import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Generate public/version.json so it's served as a static file
mkdirSync('./public', { recursive: true })
writeFileSync('./public/version.json', JSON.stringify({ service: pkg.name, version: pkg.version }, null, 2) + '\n')

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' }),
  ],
  define: {
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'thirdweb-core': ['thirdweb'],
          'thirdweb-react': ['thirdweb/react'],
          'thirdweb-wallets': ['thirdweb/wallets'],
          'thirdweb-chains': ['thirdweb/chains'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'analytics': ['react-ga4'],
        },
      },
    },
  },
})
