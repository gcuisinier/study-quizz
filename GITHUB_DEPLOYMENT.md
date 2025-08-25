# 🚀 Déploiement GitHub Pages avec Submodule

Ce guide explique comment configurer et utiliser le déploiement automatique vers GitHub Pages avec un submodule `dist` pointant vers la branche `gh-pages`.

## 📋 Architecture

```
Repository Principal (main/master)
├── src/                     # Code source Vue 3
├── public/                  # Assets statiques
├── dist/                    # Submodule → branche gh-pages
├── .github/workflows/       # Actions de déploiement
└── package.json             # Configuration build
```

## ⚙️ Configuration initiale

### Option 1: Script automatique (Recommandé)

```bash
# Exécuter le script de configuration
./setup-submodule.sh
```

Ce script va :
- ✅ Créer la branche `gh-pages` si elle n'existe pas
- ✅ Configurer le submodule `dist` → `gh-pages`
- ✅ Tester le build
- ✅ Vous donner les étapes suivantes

### Option 2: Configuration manuelle

1. **Créer la branche gh-pages** :
```bash
git checkout --orphan gh-pages
git rm -rf .
echo "# GitHub Pages" > README.md
git add README.md
git commit -m "Initial gh-pages commit"
git push origin gh-pages
git checkout main  # ou master
```

2. **Ajouter le submodule** :
```bash
git submodule add -b gh-pages [URL_DE_VOTRE_REPO] dist
git submodule update --init --recursive
```

3. **Commiter la configuration** :
```bash
git add .gitmodules dist
git commit -m "Add dist submodule for gh-pages deployment"
git push
```

## 🔄 Workflows GitHub Actions

### Workflow Principal: `deploy-submodule.yml`

**Déclenchement** :
- ✅ Push sur `main` ou `master`
- ✅ Déclenchement manuel via l'interface GitHub

**Étapes** :
1. 📥 **Checkout** avec submodules récursifs
2. 🟢 **Setup Node.js** 18 avec cache npm
3. 📦 **Install** des dépendances
4. 🏗️ **Build** avec Vite
5. 🚀 **Deploy** vers le submodule gh-pages
6. 📊 **Résumé** avec liens et statistiques

### Workflow Alternatif: `deploy.yml`

Version plus robuste avec :
- ✅ Support des Pull Requests
- ✅ Tests automatiques (si disponibles)
- ✅ Commentaires automatiques sur les PRs
- ✅ Gestion d'erreurs avancée

## 🌐 URLs de déploiement

Une fois configuré, votre application sera automatiquement déployée sur :

```
https://[USERNAME].github.io/[REPOSITORY]/study-quizz/
```

Exemple : `https://gcuisinier.github.io/quiz-app/study-quizz/`

## 🔧 Configuration Vite

Le fichier `vite.config.js` est configuré avec :

```javascript
export default defineConfig({
  base: '/study-quizz/',  // Chemin pour GitHub Pages
  // ... autres options
})
```

## 📝 Utilisation quotidienne

### Déploiement automatique

1. **Développer normalement** :
```bash
git add .
git commit -m "✨ New feature"
git push origin main
```

2. **Le workflow se déclenche automatiquement** et déploie sur GitHub Pages

### Déploiement manuel

Via l'interface GitHub :
1. Aller dans **Actions**
2. Sélectionner **Deploy to gh-pages (Submodule)**
3. Cliquer **Run workflow**

### Build et test local

```bash
# Development
npm run dev

# Build local
npm run build

# Preview de production
npm run preview
```

## 🔍 Debugging

### Vérifier le submodule

```bash
# Status du submodule
git submodule status

# Mettre à jour le submodule
git submodule update --remote --merge

# Voir les commits récents sur gh-pages
cd dist && git log --oneline -10
```

### Vérifier les workflows

1. **GitHub Actions** : Onglet "Actions" de votre repo
2. **Logs détaillés** : Cliquer sur un run spécifique
3. **GitHub Pages** : Settings → Pages → Source = gh-pages

### Problèmes courants

#### ❌ Submodule non initialisé
```bash
git submodule update --init --recursive
```

#### ❌ Permissions GitHub
- Vérifier que **GitHub Actions** a les permissions d'écriture
- Settings → Actions → General → Workflow permissions

#### ❌ URLs cassées
- Vérifier `base: '/study-quizz/'` dans `vite.config.js`
- Reconstruire avec `npm run build`

## 📊 Monitoring

### Vérifications après déploiement

1. **URL principale** : `https://[USER].github.io/[REPO]/study-quizz/`
2. **Assets** : CSS et JS chargent correctement
3. **API JSON** : `https://[USER].github.io/[REPO]/study-quizz/quizz.json`
4. **Fonctionnalités** : Quiz, timer, persistance

### Métriques de performance

Les workflows affichent automatiquement :
- 📁 Nombre de fichiers déployés
- 💾 Taille totale du build
- ⏱️ Temps de build
- 🔗 Commit source

## 🎯 Avantages de cette approche

✅ **Déploiement automatique** à chaque push  
✅ **Historique complet** des déploiements via gh-pages  
✅ **Preview automatique** sur les Pull Requests  
✅ **Zero downtime** - GitHub Pages très fiable  
✅ **CDN gratuit** - Distribution mondiale  
✅ **HTTPS automatique** - Certificats gérés par GitHub  

## 🔄 Workflow typique

1. 💻 **Développement** sur branche feature
2. 🔀 **Pull Request** vers main
3. 👀 **Review** + preview automatique
4. ✅ **Merge** vers main
5. 🚀 **Déploiement automatique** vers GitHub Pages
6. 🌐 **Application live** mise à jour

Cette configuration vous garantit un déploiement robuste et automatisé ! 🎉