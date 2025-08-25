# 🚀 Guide de déploiement pour https://www.gcuisinier.net/study-quizz/

## 📋 Configuration pour le déploiement

L'application Vue 3 Quiz QCM est maintenant configurée pour être déployée sur `https://www.gcuisinier.net/study-quizz/`.

### ⚙️ Configuration Vite

Le fichier `vite.config.js` a été configuré avec :
- **Base URL** : `/study-quizz/` 
- **Assets** : Dans le dossier `/study-quizz/assets/`
- **Fichiers statiques** : Copiés depuis `/public/`

### 🏗️ Build de production

```bash
# Construire l'application
npm run build

# Prévisualiser avant déploiement
npm run preview
```

L'application sera accessible sur : `http://localhost:4173/study-quizz/`

### 📁 Structure après build

```
dist/
├── index.html                 # Page principale
├── assets/                    # CSS et JS optimisés
│   ├── main-[hash].js        # JavaScript bundlé et minifié
│   └── main-[hash].css       # Styles compilés
├── .htaccess                 # Configuration Apache
└── *.json                    # Fichiers de données des quiz
    ├── quizz.json           # Liste des quiz disponibles
    ├── scenarios.json       # Questions scenarios
    ├── qcm_*.json          # Autres quiz
    └── ...
```

## 🌐 Déploiement sur serveur web

### Option 1: Upload FTP/SFTP

1. **Construire** l'application :
   ```bash
   npm run build
   ```

2. **Copier** tout le contenu du dossier `dist/` vers :
   ```
   www.gcuisinier.net/study-quizz/
   ```

3. **Vérifier** que la structure est :
   ```
   www.gcuisinier.net/
   └── study-quizz/
       ├── index.html
       ├── assets/
       ├── .htaccess
       └── *.json
   ```

### Option 2: Script automatisé

```bash
# Build et message de déploiement
npm run deploy
```

## 🔧 Configuration serveur

### Apache (.htaccess inclus)

Le fichier `.htaccess` est automatiquement copié et configure :
- **SPA Routing** : Toutes les routes vers `index.html`
- **MIME Types** : Pour les fichiers JSON
- **Compression GZIP** : Pour optimiser le chargement
- **Headers de sécurité** : X-Frame-Options, etc.
- **Cache** : Optimisation des assets statiques

### Nginx (si nécessaire)

Si votre serveur utilise Nginx, ajoutez cette configuration :

```nginx
location /study-quizz/ {
    alias /path/to/your/dist/;
    try_files $uri $uri/ /study-quizz/index.html;
    
    # Cache des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
    
    # Headers JSON
    location ~* \.json$ {
        add_header Content-Type application/json;
        expires 1d;
    }
}
```

## 🧪 Tests après déploiement

Une fois déployé, vérifiez :

1. **URL principale** : `https://www.gcuisinier.net/study-quizz/`
2. **Chargement des quiz** : La liste doit s'afficher
3. **Fichiers JSON** : `https://www.gcuisinier.net/study-quizz/quizz.json`
4. **Fonctionnalités** :
   - Sélection d'un quiz
   - Mode entraînement
   - Mode test
   - Persistance des questions vues
   - Responsive mobile

## 🔍 Dépannage

### URLs cassées
- Vérifiez que `base: '/study-quizz/'` est dans `vite.config.js`
- Reconstruisez avec `npm run build`

### Fichiers JSON non trouvés
- Vérifiez que tous les `*.json` sont dans `/public/`
- Assurez-vous qu'ils sont copiés dans `/dist/` après build

### Cache navigateur
- Videz le cache ou utilisez Ctrl+F5
- Les assets ont des hash qui changent à chaque build

### Erreur 404 sur routes
- Vérifiez que le `.htaccess` est présent
- Pour Nginx, ajoutez la config `try_files`

## 📊 Métriques de performance

Après build, l'application optimisée fait environ :
- **JavaScript** : ~80KB (30KB gzippé)
- **CSS** : ~10KB (2.5KB gzippé) 
- **HTML** : ~0.4KB
- **Total** : Moins de 100KB avant gzip

## 🚀 URL finale

Une fois déployé, votre application sera accessible sur :
**https://www.gcuisinier.net/study-quizz/**

Avec toutes les fonctionnalités Vue 3, la persistance des données et l'interface responsive !