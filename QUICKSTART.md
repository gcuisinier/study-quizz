# 🚀 QuickStart - Déploiement GitHub Pages

## 🎯 Objectif

Déployer automatiquement votre application Vue 3 Quiz sur GitHub Pages.

## ⚡ Configuration simple (Recommandé)

### 1. 📤 Push votre code

```bash
git add .
git commit -m "🚀 Ready for GitHub Pages"
git push origin main
```

### 2. 🔧 Configurer GitHub Pages

1. **Repository** → **Settings** → **Pages**
2. **Source** → **GitHub Actions** ✅
3. Sauvegarder

### 3. ✅ C'est tout !

Le workflow `deploy-pages.yml` se déclenche automatiquement et déploie sur :
**`https://[USERNAME].github.io/[REPOSITORY]/study-quizz/`**

## 🔄 Alternative: Submodule (Avancé)

Si vous préférez utiliser un submodule `dist` → `gh-pages` :

```bash
# Configuration du submodule
npm run setup-submodule
git add .gitmodules dist .github/
git commit -m "🚀 Setup submodule deployment"
git push
```

⚠️ **Note** : En cas de problème de permissions, utilisez la méthode simple ci-dessus.

## 🎮 Usage quotidien

### Déploiement automatique
```bash
# Développement normal
git add .
git commit -m "✨ New feature"
git push origin main
# → Déploiement automatique ! 🚀
```

### Déploiement manuel (si besoin)
```bash
# Via GitHub Actions (interface web)
# Actions → "Deploy to gh-pages (Submodule)" → "Run workflow"

# OU en local
npm run deploy-local
```

## 📋 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | 🟢 Serveur de développement |
| `npm run build` | 🏗️ Build de production |
| `npm run preview` | 👀 Preview du build |
| `npm run setup-submodule` | ⚙️ Configuration submodule |
| `npm run deploy-local` | 🚀 Déploiement manuel |
| `npm run deploy` | 📦 Build + instruction serveur |

## 🌐 URLs finales

- **GitHub Pages** : `https://[USER].github.io/[REPO]/study-quizz/`
- **Serveur perso** : `https://www.gcuisinier.net/study-quizz/`

## 🔍 Vérifications

### ✅ Configuration OK si :
- [ ] Dossier `dist/` existe et est un submodule
- [ ] Branche `gh-pages` existe
- [ ] Workflow `.github/workflows/deploy-submodule.yml` présent
- [ ] `npm run build` fonctionne
- [ ] GitHub Actions a les permissions d'écriture

### ❌ Problèmes courants

| Problème | Solution |
|----------|----------|
| "dist not found" | `npm run setup-submodule` |
| "Workflow failed" | Vérifier permissions dans Settings → Actions |
| "404 on pages" | Attendre 5-10min ou vérifier Settings → Pages |
| "Assets not loading" | Vérifier `base` in `vite.config.js` |

## 🎉 C'est fini !

Une fois configuré, chaque `git push` vers `main` déclenchera automatiquement :

1. 🏗️ **Build** de l'application Vue 3
2. 🚀 **Déploiement** sur GitHub Pages  
3. 🌐 **Mise en ligne** automatique

Votre Quiz QCM sera accessible publiquement ! 🎯