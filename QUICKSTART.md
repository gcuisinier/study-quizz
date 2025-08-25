# 🚀 QuickStart - Déploiement GitHub Pages

## 🎯 Objectif

Déployer automatiquement votre application Vue 3 Quiz sur GitHub Pages via un submodule `dist` → branche `gh-pages`.

## ⚡ Configuration en 3 étapes

### 1. 🔧 Setup initial (une seule fois)

```bash
# Configurer le submodule automatiquement
npm run setup-submodule

# OU manuellement
./setup-submodule.sh
```

### 2. 📤 Commiter la configuration

```bash
# Ajouter les fichiers de configuration
git add .gitmodules dist .github/

# Commiter
git commit -m "🚀 Setup GitHub Pages deployment with submodule"

# Pousser vers GitHub
git push origin main
```

### 3. ✅ Vérification

1. **GitHub Actions** : Vérifiez que le workflow se déclenche dans l'onglet "Actions"
2. **GitHub Pages** : Settings → Pages → Source = gh-pages ✅
3. **URL live** : `https://[USERNAME].github.io/[REPOSITORY]/study-quizz/`

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