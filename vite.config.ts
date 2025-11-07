import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        short_name: "BlancAlergic",
        name: "BlancAlergic App - Gestión de Alergias",
        description: "Aplicación médica para gestionar alergias alimentarias y medicamentos",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        start_url: "/BlancAlergic-APP/",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/BlancAlergic-APP/",
        theme_color: "#2563eb",
        orientation: "portrait",
        categories: ["health", "medical", "lifestyle"],
        lang: "es",
        dir: "ltr"
      },
      registerType: "autoUpdate",
      // En desarrollo usar generateSW, en producción injectManifest
      strategies: process.env.NODE_ENV === 'production' ? 'injectManifest' : 'generateSW',
      filename: 'sw.js',
      // Solo usar inyectManifest en producción
      ...(process.env.NODE_ENV === 'production' && {
        injectManifest: {
          injectionPoint: 'self.__WB_MANIFEST'
        }
      }),
      devOptions: {
        enabled: false,
        type: 'module'
      },
    // Desactivar PWA completamente en desarrollo para evitar errores
    disable: process.env.NODE_ENV === 'development',
      // Configuración para desarrollo
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          }
        ]
      }
    }),
  ],
  base: "/BlancAlergic-APP/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  });
