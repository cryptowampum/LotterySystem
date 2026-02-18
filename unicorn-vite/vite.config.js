import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' }),
  ],
  define: {
    global: 'globalThis',
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
