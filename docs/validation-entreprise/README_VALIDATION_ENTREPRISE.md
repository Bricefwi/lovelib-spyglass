# 🏢 Système de Validation d'Entreprise IMOTION MANUS IA 2.0

## 📦 Contenu du Package

Ce package contient tout le nécessaire pour déployer le système de validation d'entreprise avec SIRET/SIREN, vérification email obligatoire, et mécanismes anti-abus.

### Fichiers Inclus

1. **GUIDE_DEPLOIEMENT_VALIDATION_ENTREPRISE.md** (📘 Guide principal)
   - Instructions pas-à-pas pour le déploiement complet
   - 5 étapes détaillées avec captures d'écran
   - Tests de validation
   - Troubleshooting

2. **PLAN_ARCHITECTURE_VALIDATION_ENTREPRISE.md** (🏗️ Architecture)
   - Architecture complète du système (50+ pages)
   - Schémas de base de données
   - Flux d'authentification
   - Algorithmes de trust score
   - Spécifications techniques

3. **DEPLOYMENT_SQL_VALIDATION_ENTREPRISE.sql** (🗄️ Script SQL)
   - Migrations SQL complètes
   - 3 nouvelles tables
   - 17 nouvelles colonnes dans `profiles`
   - Fonctions, triggers, vues
   - Contraintes et index

4. **MESSAGES_LOVABLE_VALIDATION_ENTREPRISE.md** (💬 Messages Lovable)
   - 7 messages séquentiels pour Lovable
   - Instructions détaillées pour chaque modification frontend
   - Tests de validation pour chaque étape

5. **edge-functions-validation/** (⚡ Edge Functions)
   - `validate-company-siret/index.ts` : Validation SIRET via API INSEE
   - `check-audit-access/index.ts` : Contrôle d'accès aux audits

## 🚀 Démarrage Rapide

### Prérequis

- Projet Supabase configuré
- Compte Resend (pour les emails)
- Compte API INSEE (gratuit)
- Accès Lovable pour modifier le frontend

### Étapes de Déploiement (2-3 heures)

1. **Obtenir un token API INSEE** (5 min)
   - S'inscrire sur https://api.insee.fr/catalogue/
   - Créer une application et souscrire à l'API Sirene V3
   - Récupérer le token Bearer

2. **Déployer les migrations SQL** (10 min)
   - Ouvrir Supabase SQL Editor
   - Copier-coller `DEPLOYMENT_SQL_VALIDATION_ENTREPRISE.sql`
   - Exécuter et vérifier

3. **Déployer les Edge Functions** (15 min)
   - Copier les 2 fonctions dans `supabase/functions/`
   - Déployer via Lovable ou Supabase CLI
   - Tester les endpoints

4. **Configurer l'authentification** (10 min)
   - Activer la confirmation email dans Supabase Auth
   - Configurer SMTP avec Resend
   - Personnaliser le template d'email

5. **Modifier le frontend via Lovable** (1-2 heures)
   - Envoyer les 7 messages de `MESSAGES_LOVABLE_VALIDATION_ENTREPRISE.md`
   - Tester chaque modification avant de passer à la suivante

## 📊 Fonctionnalités Principales

### Authentification Robuste
- ✅ Email obligatoire avec vérification par lien
- ✅ Aucun accès sans confirmation email
- ✅ Session sécurisée avec JWT

### Identification Entreprise
- ✅ SIRET/SIREN obligatoire validé via API INSEE officielle
- ✅ Données légales automatiquement récupérées
- ✅ Rôle utilisateur dans l'entreprise

### Anti-Abus
- ✅ SIRET unique : une entreprise = un compte
- ✅ Rate limiting : max 10 tentatives/heure par IP
- ✅ Trust score : algorithme de détection de faux comptes
- ✅ Modération manuelle pour comptes suspects
- ✅ Limite de 3 audits gratuits par entreprise

### Qualité des Audits
- ✅ Données d'entrée vérifiables pour les agents IA
- ✅ Correspondance email professionnel / domaine du site
- ✅ Logs complets pour analytics anti-fraude

## 📖 Documentation Détaillée

Consultez les fichiers suivants pour plus d'informations :

- **Guide de déploiement** : `GUIDE_DEPLOIEMENT_VALIDATION_ENTREPRISE.md`
- **Architecture complète** : `PLAN_ARCHITECTURE_VALIDATION_ENTREPRISE.md`
- **Messages Lovable** : `MESSAGES_LOVABLE_VALIDATION_ENTREPRISE.md`

## 🧪 Tests de Validation

Après le déploiement, testez le parcours complet :

1. **Inscription** : S'inscrire → Recevoir email → Confirmer → Redirection onboarding
2. **Onboarding** : Saisir SIRET → Voir infos pré-remplies → Valider
3. **Audit** : Lancer audit → Voir "Audits restants" → Vérifier incrémentation
4. **Limites** : Lancer 3 audits → 4ème audit bloqué → Redirection pricing
5. **Admin** : Modérer utilisateur → Approuver → Vérifier trust_score

## 🚨 Support

En cas de problème :

1. Consultez la section "Problèmes Courants" du guide de déploiement
2. Vérifiez les logs des Edge Functions dans Supabase
3. Testez les API manuellement (INSEE, Resend)
4. Contactez le support IMOTION

## 📈 Métriques à Surveiller

- Taux de confirmation email
- Taux de complétion onboarding
- Distribution trust_score
- Taux de conversion audit gratuit → Premium
- Taux de rejet admin

## 🎯 Prochaines Étapes

Après le déploiement :

1. Monitorer les métriques clés
2. Ajuster les seuils si nécessaire
3. Former les admins à la modération
4. Implémenter les optimisations futures (cache INSEE, ML scoring)

## 📞 Contact

Pour toute question ou assistance :
- Email : patrice.simion@imotion.fr
- Documentation : https://docs.imotion.fr

---

**Version** : 1.0.0  
**Date** : 2025-01-14  
**Auteur** : MANUS IA

Bon déploiement ! 🚀
