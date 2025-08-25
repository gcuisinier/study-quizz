#!/bin/bash

# Script pour réinitialiser le déploiement en cas de problème
# Usage: ./reset-deployment.sh

set -e

echo "🔄 Réinitialisation du déploiement GitHub Pages"
echo "=============================================="

# Demander confirmation
read -p "⚠️  Cela va supprimer le submodule et utiliser le workflow Pages officiel. Continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo "🧹 Nettoyage du submodule..."

# Supprimer le submodule si il existe
if [ -f ".gitmodules" ]; then
    echo "📁 Suppression du submodule dist..."
    git submodule deinit -f dist 2>/dev/null || true
    git rm -f dist 2>/dev/null || true
    rm -f .gitmodules
    rm -rf dist
fi

echo "📋 Désactivation du workflow submodule..."

# Désactiver le workflow submodule
if [ -f ".github/workflows/deploy-submodule.yml" ]; then
    mv .github/workflows/deploy-submodule.yml .github/workflows/deploy-submodule.yml.disabled
    echo "✅ Workflow submodule désactivé"
fi

echo "🏗️ Test du build..."

# Tester que le build fonctionne
npm run build

echo "✅ Réinitialisation terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Commitez les changements:"
echo "      git add ."
echo "      git commit -m '🔄 Reset to GitHub Pages workflow'"
echo "      git push origin main"
echo ""
echo "   2. Configurez GitHub Pages:"
echo "      Repository → Settings → Pages → Source → GitHub Actions"
echo ""
echo "   3. Le déploiement se fera automatiquement avec deploy-pages.yml"
echo ""
echo "🌐 Votre app sera disponible sur:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/study-quizz/"