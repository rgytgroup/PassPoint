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
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
