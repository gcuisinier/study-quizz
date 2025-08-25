# 🔧 Dépannage GitHub Pages

## ❌ Erreur de permissions (403)

### Problème
```
remote: Permission to username/repo.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/username/repo.git/': The requested URL returned error: 403
```

### 🛠️ Solutions

#### Solution 1: Vérifier les permissions du repository

1. **Settings** → **Actions** → **General**
2. **Workflow permissions** → Sélectionner **"Read and write permissions"**
3. Cocher **"Allow GitHub Actions to create and approve pull requests"**

#### Solution 2: Utiliser le workflow Pages officiel

Désactivez `deploy-submodule.yml` et utilisez `deploy-pages.yml` :

```bash
# Renommer pour désactiver
mv .github/workflows/deploy-submodule.yml .github/workflows/deploy-submodule.yml.disabled

# Le workflow deploy-pages.yml sera utilisé automatiquement
```

#### Solution 3: Configurer GitHub Pages

1. **Settings** → **Pages**
2. **Source** → **GitHub Actions** (pas "Deploy from branch")
3. Sauvegarder

## ❌ Submodule non trouvé

### Problème
```bash
fatal: not a git repository (or any of the parent directories): .git
```

### 🛠️ Solution

```bash
# Réinitialiser le submodule
rm -rf dist
git submodule deinit -f dist
git rm -f dist
git submodule add -b gh-pages $(git remote get-url origin) dist
git add .gitmodules dist
git commit -m "Fix submodule"
git push
```

## ❌ URLs cassées

### Problème
Les assets (CSS, JS) ne se chargent pas sur GitHub Pages.

### 🛠️ Solution

Vérifier la configuration dans `vite.config.js` :

```javascript
base: process.env.GITHUB_REPOSITORY 
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/study-quizz/`
  : '/study-quizz/'
```

Et rebuild :
```bash
GITHUB_REPOSITORY="votre-user/votre-repo" npm run build
```

## ❌ Workflow qui ne se déclenche pas

### Problèmes possibles

1. **Mauvaise branche** : Le workflow ne s'active que sur `main` ou `master`
2. **Pas de permissions** : Voir Solution 1 ci-dessus
3. **Syntax error** : Vérifier la syntaxe YAML

### 🛠️ Solution

```bash
# Forcer le déclenchement
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

## 🚀 Solutions alternatives

### Option A: Workflow Pages officiel (Recommandé)

Utilisez `deploy-pages.yml` qui est plus fiable :

1. Renommez `deploy-submodule.yml.disabled`
2. Settings → Pages → Source → **GitHub Actions**
3. Push vers main

### Option B: Déploiement manuel

```bash
# Build et push manuel vers gh-pages
npm run build
cd dist
git add -A
git commit -m "Manual deploy"
git push origin gh-pages
```

### Option C: Token personnel

Si les permissions ne suffisent pas :

1. **Settings** → **Developer settings** → **Personal access tokens**
2. Créer un token avec scope `repo`
3. **Repository** → **Settings** → **Secrets** → Ajouter `DEPLOY_TOKEN`
4. Modifier le workflow pour utiliser `${{ secrets.DEPLOY_TOKEN }}`

## 📊 Vérifications

### ✅ Checklist de débogage

- [ ] **Permissions** : Read and write dans Settings → Actions
- [ ] **Pages config** : Source = GitHub Actions
- [ ] **Branche** : Push sur main/master
- [ ] **Build** : `npm run build` fonctionne localement
- [ ] **Workflow** : Pas d'erreurs de syntaxe YAML
- [ ] **Submodule** : `git submodule status` OK

### 🔍 Logs utiles

```bash
# Vérifier les submodules
git submodule status
git submodule foreach 'git status'

# Vérifier les remotes
git remote -v
cd dist && git remote -v

# Tester les permissions
git ls-remote --heads origin
```

## 💡 Conseils

1. **Simplicité** : Utilisez `deploy-pages.yml` plutôt que le submodule si vous avez des problèmes
2. **Patience** : GitHub Pages peut prendre 5-10 minutes pour se mettre à jour
3. **Cache** : Videz le cache navigateur (Ctrl+F5)
4. **Logs** : Consultez les logs dans Actions pour identifier le problème exact

## 🆘 En cas de blocage total

```bash
# Reset complet
rm -rf dist .github/workflows/deploy-submodule.yml
git add -A
git commit -m "Clean slate"
git push

# Puis utiliser deploy-pages.yml uniquement
git push origin main  # Déclenchera le nouveau workflow
```

Cette approche est plus simple et évite les problèmes de submodule ! 🎉