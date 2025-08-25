import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Base URL pour GitHub Pages - sera adapté selon l'environnement
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.GITHUB_REPOSITORY 
        ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/study-quizz/`  // GitHub Pages
        : '/study-quizz/')  // Serveur personnalisé
    : '/',  // Development
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