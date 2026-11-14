import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Served from a GitHub project page: https://jandromv-arch.github.io/lern-deutsch/
// Absolute base makes the service worker + manifest resolve correctly on that subpath.
// https://vite.dev/config/
export default defineConfig({
  base: "/lern-deutsch/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lern Deutsch',
        short_name: 'Lern Deutsch',
        description: 'Apprends le vocabulaire allemand — pour francophones.',
        lang: 'fr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#f97316',
        background_color: '#fffbeb',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
