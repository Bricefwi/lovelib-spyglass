#!/bin/bash

# Script de déploiement automatique du backend MANUS IA sur Railway
# Usage: ./deploy-manus-backend.sh

set -e

echo "🚀 Déploiement du Backend MANUS IA sur Railway"
echo "================================================"

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "📦 Installation de Railway CLI..."
    npm install -g @railway/cli
fi

# Se connecter à Railway
echo "🔐 Connexion à Railway..."
railway login

# Créer un nouveau projet (ou lier un existant)
echo "📁 Création/liaison du projet Railway..."
railway init

# Copier le backend MANUS IA dans le répertoire
echo "📂 Copie des fichiers du backend MANUS IA..."
cp -r ../manus-orchestration/* .

# Configurer les variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."
echo ""
echo "Veuillez configurer les variables suivantes dans Railway Dashboard:"
echo "- OPENAI_API_KEY"
echo "- ANTHROPIC_API_KEY"
echo "- GOOGLE_API_KEY"
echo "- GEMINI_API_KEY"
echo "- PERPLEXITY_API_KEY"
echo "- SONAR_API_KEY"
echo "- COHERE_API_KEY"
echo "- MISTRAL_API_KEY"
echo "- DATABASE_URL (Supabase PostgreSQL)"
echo "- SUPABASE_URL"
echo "- SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_KEY"
echo "- REDIS_URL"
echo ""
read -p "Appuyez sur Entrée une fois les variables configurées dans Railway Dashboard..."

# Déployer
echo "🚢 Déploiement sur Railway..."
railway up

# Récupérer l'URL du déploiement
echo "🌐 Récupération de l'URL du déploiement..."
BACKEND_URL=$(railway domain)

echo ""
echo "✅ Déploiement terminé !"
echo "📍 URL du backend: https://$BACKEND_URL"
echo ""
echo "🔧 Prochaines étapes:"
echo "1. Testez l'endpoint de santé: https://$BACKEND_URL/health"
echo "2. Ajoutez MANUS_BACKEND_URL dans Supabase secrets:"
echo "   supabase secrets set MANUS_BACKEND_URL=https://$BACKEND_URL"
echo "3. Générez et ajoutez MANUS_API_KEY:"
echo "   supabase secrets set MANUS_API_KEY=\$(openssl rand -base64 32)"
echo ""

