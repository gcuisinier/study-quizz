#!/bin/bash

# Script pour configurer le submodule dist -> gh-pages
# Usage: ./setup-submodule.sh

set -e

echo "🔧 Configuration du submodule dist -> gh-pages"
echo "=============================================="

# Vérifier si on est dans un repo git
if [ ! -d ".git" ]; then
    echo "❌ Erreur: Vous devez être dans un repository git"
    exit 1
fi

# Obtenir l'URL du repository actuel
REPO_URL=$(git remote get-url origin)
echo "📍 Repository: $REPO_URL"

# Supprimer le dossier dist s'il existe déjà
if [ -d "dist" ]; then
    echo "🗑️  Suppression de l'ancien dossier dist..."
    rm -rf dist
fi

# Vérifier si la branche gh-pages existe
echo "🔍 Vérification de la branche gh-pages..."
if git ls-remote --heads origin | grep -q "refs/heads/gh-pages"; then
    echo "✅ La branche gh-pages existe"
    # Cloner la branche gh-pages comme submodule
    git submodule add -b gh-pages "$REPO_URL" dist
else
    echo "⚠️  La branche gh-pages n'existe pas, création..."
    
    # Créer une branche gh-pages vide
    git checkout --orphan gh-pages
    git rm -rf .
    echo "# GitHub Pages Branch" > README.md
    echo "Cette branche contient les fichiers buildés pour GitHub Pages" >> README.md
    git add README.md
    git commit -m "🎉 Initial commit for gh-pages"
    git push origin gh-pages
    
    # Retourner à la branche principale
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        git checkout main 2>/dev/null || git checkout master
    else
        git checkout main 2>/dev/null || git checkout master
    fi
    
    # Ajouter le submodule
    git submodule add -b gh-pages "$REPO_URL" dist
fi

echo "📁 Initialisation du submodule..."
git submodule update --init --recursive

echo "🏗️  Test de build..."
npm run build

echo "✅ Configuration terminée!"
echo ""
echo "📝 Étapes suivantes:"
echo "   1. Commitez les changements du submodule:"
echo "      git add .gitmodules dist"
echo "      git commit -m 'Add dist submodule for gh-pages'"
echo "      git push"
echo ""
echo "   2. Le workflow GitHub Actions se déclenchera automatiquement"
echo "      lors du prochain push sur main/master"
echo ""
echo "🌐 Votre app sera disponible sur:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/study-quizz/"