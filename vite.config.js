import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/study-quizz/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimiser pour le déploiement - utiliser esbuild par défaut
    minify: 'esbuild',
    sourcemap: false,
    // Copier les fichiers JSON dans le dossier de build
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // S'assurer que les assets statiques sont copiés
  publicDir: 'public'
})