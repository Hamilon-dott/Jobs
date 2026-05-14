import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'Jobs BD - All Govt Job Circulars',
          short_name: 'Jobs BD',
          description: 'Bangladesh Govt Job Circular Updates',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/192px-Government_Seal_of_Bangladesh.svg.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/512px-Government_Seal_of_Bangladesh.svg.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/512px-Government_Seal_of_Bangladesh.svg.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
