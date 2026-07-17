import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// PWA instalable con caché offline del contenido comprado (SPEC §2, §5).
// La estrategia de caché del banco por estado se afina en la fase offline.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PassPoint — Examen DMV',
        short_name: 'PassPoint',
        description:
          'Preparación bilingüe para el examen teórico del DMV (USA).',
        lang: 'es',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
      workbox: {
        // Offline del contenido comprado (SPEC §5).
        runtimeCaching: [
          {
            // Banco del estado (temas y preguntas): red primero, con
            // respaldo en caché para funcionar sin conexión.
            urlPattern: /\/api\/states\//,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'passpoint-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Intentos: si se está offline, se encolan y se reenvían al
            // reconectar (Background Sync).
            urlPattern: /\/api\/attempts$/,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'passpoint-attempts',
                options: { maxRetentionTime: 60 * 24 }, // 24 h en minutos
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  // El preview también proxea /api para poder probar el offline localmente.
  preview: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
