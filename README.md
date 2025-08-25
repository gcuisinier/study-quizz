# Quiz QCM - Vue 3

Application de quiz QCM refactorisée avec Vue 3 et la Composition API.

## 🚀 Technologies utilisées

- **Vue 3** - Framework JavaScript progressif
- **Composition API** - API moderne de Vue 3 pour la logique des composants
- **Vite** - Outil de build rapide et moderne
- **JavaScript ES6+** - Avec modules et fonctions modernes

## 📁 Structure du projet

```
├── src/
│   ├── main.js                 # Point d'entrée de l'application
│   ├── App.vue                # Composant principal
│   └── composables/           # Logique métier réutilisable
│       ├── useQuizLogic.js    # Gestion du quiz et des questions
│       ├── useTimer.js        # Gestion du timer
│       ├── useAudio.js        # Gestion des sons
│       └── useToast.js        # Gestion des notifications toast
├── public/                    # Assets statiques
├── *.json                     # Fichiers de données des quiz
├── package.json               # Configuration des dépendances
├── vite.config.js            # Configuration Vite
└── index.html                # Template HTML principal
```

## 🛠️ Installation et lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur http://localhost:3000

3. **Construire pour la production** :
   ```bash
   npm run build
   ```

4. **Prévisualiser la build de production** :
   ```bash
   npm run preview
   ```
   L'application sera accessible sur http://localhost:4173/study-quizz/

5. **Déployer en production** :
   ```bash
   npm run deploy
   ```
   Puis copiez le contenu du dossier `dist/` vers `https://www.gcuisinier.net/study-quizz/`

## 🎯 Fonctionnalités

### Modes de jeu
- **Mode Entraînement** : 25 questions avec système de pool intelligente
- **Mode Test** : 10 questions fixes avec notation finale

### Fonctionnalités avancées
- **Tracker visuel** : Suivi des questions avec couleurs selon les résultats
- **Persistance** : Mémorisation des questions vues via localStorage
- **Timer** : 20 secondes par question avec indicateur visuel
- **Sons** : Mélodie de réussite pour les bonnes réponses
- **Notifications** : Toasts pour les séries de bonnes réponses
- **Explications** : Affichage optionnel d'explications détaillées
- **Révision** : Vue dédiée aux questions ratées

### Interface responsive
- **Desktop** : Interface complète avec tracker latéral
- **Mobile** : Interface optimisée sans tracker

## 📊 Fichiers de données

L'application supporte deux sources de données :

1. **Quiz prédéfinis** : Listés dans `quizz.json`
2. **Upload manuel** : Fichier JSON personnalisé

### Format des fichiers JSON

```json
{
  "questions": [
    {
      "id": "Q1", // Optionnel
      "question": "Texte de la question",
      "options": [
        "Réponse A",
        "Réponse B",
        "Réponse C",
        "Réponse D"
      ],
      "correct_answer": 0, // Index de la bonne réponse (0-3)
      "explanation": "Explication optionnelle"
    }
  ]
}
```

## 🔧 Architecture Vue 3

### Composition API

L'application utilise la Composition API de Vue 3 avec des composables spécialisés :

- **`useQuizLogic`** : Gestion complète de la logique du quiz
- **`useTimer`** : Timer avec progression visuelle
- **`useAudio`** : Génération de sons de succès
- **`useToast`** : Système de notifications

### Avantages de la refactorisation

1. **Meilleure organisation** : Code séparé par responsabilités
2. **Réutilisabilité** : Logique métier dans des composables
3. **Maintenance** : Plus facile à maintenir et déboguer
4. **Performance** : Vue 3 optimisé avec réactivité fine
5. **Type safety** : Structure plus robuste
6. **Modern JavaScript** : Utilisation des features ES6+

## 🎨 Personnalisation

### Couleurs et thème
Les couleurs sont définies dans le CSS global du composant `App.vue` :
- Primaire : `#667eea` (bleu-violet)
- Succès : `#2ed573` (vert)
- Erreur : `#ff3742` (rouge)
- Warning : `#ffd700` (jaune)

### Timer et difficulté
Modifiez les valeurs dans `useTimer.js` :
- Durée par question : 20 secondes (configurable)
- Seuil d'alerte : 5 secondes restantes

## 🌐 Déploiement

L'application est configurée pour être déployée sur **https://www.gcuisinier.net/study-quizz/**

### 🚀 Process de déploiement :

1. **Build optimisé** :
   ```bash
   npm run build
   ```

2. **Test local** :
   ```bash
   npm run preview  # http://localhost:4173/study-quizz/
   ```

3. **Déploiement** :
   - Copier tout le contenu de `dist/` vers le serveur web
   - Structure finale : `www.gcuisinier.net/study-quizz/`

### 📋 Fichiers inclus dans le déploiement :
- `index.html` - Application principale
- `assets/` - JavaScript et CSS optimisés
- `*.json` - Données des quiz
- `.htaccess` - Configuration Apache

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet.

## 🚀 Migration depuis JavaScript vanilla

Cette version Vue 3 maintient toutes les fonctionnalités de l'version originale tout en apportant :

- Structure plus maintenable
- Composants réactifs
- Gestion d'état simplifiée
- Meilleure séparation des préoccupations
- Code plus testable
- Performance améliorée

## 📝 Développement

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche feature
3. Développer avec `npm run dev`
4. Tester la build avec `npm run build`
5. Soumettre une pull request