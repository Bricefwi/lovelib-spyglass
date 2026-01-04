# 🚀 Guide de Déploiement - Orchestrateur v7.0 Premium

## ✅ Ce qui a été fait

### 1. Orchestrateur v7.0 créé et pushé sur GitHub
- **Fichier** : `supabase/functions/orchestrate-multi-agent-v7/index.ts`
- **Commit** : `1ce461b` - "feat: Orchestrateur v7.0 Premium McKinsey/BCG"
- **Taille** : 690 lignes de code

### 2. Nouveaux Agents Premium
- ✅ Market Research Agent (étude de marché TAM/SAM/SOM)
- ✅ Competitive Intelligence Agent (5-10 concurrents)
- ✅ Economic Analyst Agent (Porter, chaîne de valeur)
- ✅ Industry Expert Agent (tendances, innovations)
- ✅ Data Analyst Agent (KPIs, projections)
- ✅ Strategic Consultant Agent (recommandations McKinsey)

### 3. Intégration Perplexity Pro
- ✅ Configuration API Perplexity
- ✅ Modèles : sonar, sonar-pro, sonar-reasoning, sonar-research
- ✅ Citations automatiques des sources
- ✅ Fallback sur OpenAI si Perplexity indisponible

### 4. Modèles IA Premium
- ✅ Freemium : `gpt-4o-mini`
- ✅ Pro : `gpt-5` + Perplexity Pro
- ✅ Agency : `gpt-5.1` + `o1-pro` + Perplexity Reasoning
- ✅ Enterprise : `gpt-5.2-pro` + `o1-pro` + Perplexity Research

### 5. Système de Rédaction Professionnelle
- ✅ Prompts McKinsey (pas d'acronymes, justifications chiffrées)
- ✅ Structure SCQR (Situation, Complication, Question, Resolution)
- ✅ Longueurs cibles : 3000-15000 mots par agent selon le plan

---

## 🚀 Déploiement

### Étape 1 : Déployer la nouvelle Edge Function

```bash
cd /path/to/lovelib-spyglass

# Déployer l'orchestrateur v7.0
supabase functions deploy orchestrate-multi-agent-v7 --no-verify-jwt
```

### Étape 2 : Configurer les Variables d'Environnement

Dans Supabase → Settings → Edge Functions → Secrets, vérifiez que vous avez :

```bash
SONAR_API_KEY=votre-clé-perplexity
OPENAI_API_KEY=votre-clé-openai
OPENAI_API_BASE=https://api.openai.com/v1
SUPABASE_URL=votre-url-supabase
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### Étape 3 : Tester l'Orchestrateur v7.0

#### Test Freemium
```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/orchestrate-multi-agent-v7 \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audit_id": "votre-audit-id-freemium"
  }'
```

#### Test Pro
```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/orchestrate-multi-agent-v7 \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audit_id": "votre-audit-id-pro"
  }'
```

#### Test Agency
```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/orchestrate-multi-agent-v7 \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audit_id": "votre-audit-id-agency"
  }'
```

#### Test Enterprise
```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/orchestrate-multi-agent-v7 \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audit_id": "votre-audit-id-enterprise"
  }'
```

---

## 📊 Vérification des Résultats

### 1. Vérifier les Logs
```bash
supabase functions logs orchestrate-multi-agent-v7 --tail
```

**Ce que vous devriez voir** :
```
🚀 ============================================
   ORCHESTRATEUR V7.0 - PREMIUM McKINSEY/BCG
   ============================================
   📊 Plan: PRO
   🌐 URL: https://www.example.com
   🤖 Modèle principal: gpt-5
   🔍 Modèle recherche: sonar-pro
   🧠 Modèle raisonnement: N/A
   ============================================

📋 Agents à exécuter: 12/11

🤖 Exécution: Market Research Agent
   Tâche: Étude de marché approfondie
   Utilise Perplexity: Oui
   🔍 Recherche via Perplexity (sonar-pro)...
   ✅ Analyse terminée (3245 mots, 12 sources)

🤖 Exécution: Competitive Intelligence Agent
   Tâche: Analyse concurrentielle approfondie
   Utilise Perplexity: Oui
   🔍 Recherche via Perplexity (sonar-pro)...
   ✅ Analyse terminée (4567 mots, 18 sources)

...

📊 ============================================
   STATISTIQUES DU RAPPORT
   ============================================
   📝 Nombre total de mots: 42,350
   📄 Pages estimées: 85
   🤖 Agents exécutés: 12
   📚 Sources citées: 87
   ============================================
```

### 2. Vérifier la Base de Données

```sql
SELECT 
  id,
  ai_tier,
  status,
  report_data->'version' as version,
  report_data->'statistics'->>'totalWords' as total_words,
  report_data->'statistics'->>'estimatedPages' as estimated_pages,
  report_data->'statistics'->>'agentsExecuted' as agents_executed,
  report_data->'statistics'->>'citationsCount' as citations_count
FROM pre_audits
WHERE id = 'votre-audit-id'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultats attendus** :
| Plan | Total Words | Estimated Pages | Agents Executed | Citations Count |
|------|-------------|-----------------|-----------------|-----------------|
| Freemium | 8,000-12,000 | 16-24 | 7 | 10-20 |
| Pro | 35,000-50,000 | 70-100 | 12 | 50-80 |
| Agency | 60,000-80,000 | 120-160 | 15 | 100-150 |
| Enterprise | 100,000-150,000 | 200-300 | 17 | 200-300 |

---

## 🎯 Critères de Succès

### ✅ Le rapport doit contenir :

1. **Études de Marché** (Pro+)
   - TAM, SAM, SOM
   - Taux de croissance (CAGR)
   - Tendances sectorielles
   - Segments de marché

2. **Analyse Concurrentielle** (Pro+)
   - 5-10 concurrents identifiés
   - Analyse comparative
   - Matrice de positionnement
   - Forces/faiblesses

3. **Analyse Économique** (Agency+)
   - Forces de Porter
   - Chaîne de valeur
   - Modèles économiques
   - KPIs sectoriels

4. **Rédaction Professionnelle**
   - Phrases complètes (pas de bullet points)
   - Pas d'acronymes sans définition
   - Justifications chiffrées
   - Plans d'action détaillés (qui, quoi, quand, combien)

5. **Sources et Citations**
   - 50+ sources pour Pro
   - 100+ sources pour Agency
   - 200+ sources pour Enterprise

6. **Longueur**
   - Freemium : 15-25 pages
   - Pro : 70-100 pages
   - Agency : 120-160 pages
   - Enterprise : 200-300 pages

---

## 🚨 Dépannage

### Problème : Quota Perplexity dépassé

**Erreur** : `429 Too Many Requests`

**Solution** :
1. Vérifiez votre quota Perplexity sur https://www.perplexity.ai/settings/api
2. Augmentez votre plan Perplexity si nécessaire
3. L'orchestrateur utilise automatiquement OpenAI en fallback

### Problème : Rapport trop court

**Symptôme** : Le rapport fait moins de 50 pages pour Pro

**Solution** :
1. Vérifiez que les agents de recherche sont bien exécutés (logs)
2. Vérifiez que Perplexity Pro est bien configuré
3. Vérifiez que les prompts demandent bien 3000-15000 mots par agent

### Problème : Pas de sources citées

**Symptôme** : `citations_count: 0`

**Solution** :
1. Vérifiez que Perplexity Pro est utilisé (pas OpenAI seul)
2. Vérifiez que `return_citations: true` dans l'appel Perplexity
3. Vérifiez les logs pour voir si Perplexity répond correctement

### Problème : Erreur 500

**Symptôme** : `AI API error: 500`

**Solution** :
1. Vérifiez les logs de l'Edge Function
2. Vérifiez que les clés API sont valides
3. Vérifiez que les modèles (gpt-5, gpt-5.2-pro) sont disponibles
4. Réduisez `max_tokens` si timeout

---

## 📋 Checklist de Déploiement

- [ ] Orchestrateur v7.0 déployé sur Supabase
- [ ] Variables d'environnement configurées (SONAR_API_KEY, OPENAI_API_KEY)
- [ ] Test Freemium réussi (15-25 pages)
- [ ] Test Pro réussi (70-100 pages, 50+ sources)
- [ ] Test Agency réussi (120-160 pages, 100+ sources)
- [ ] Test Enterprise réussi (200-300 pages, 200+ sources)
- [ ] Vérification de la qualité de rédaction (pas d'acronymes)
- [ ] Vérification des études de marché (TAM, SAM, SOM)
- [ ] Vérification des analyses concurrentielles (5-10 concurrents)
- [ ] Vérification des sources et citations

---

## 🎉 Prochaines Étapes

Une fois que tous les tests sont réussis :

1. **Migrer les utilisateurs** de v6 à v7
2. **Mettre à jour le frontend** pour afficher les nouveaux rapports
3. **Créer un Quality Guardian v7** avec critères stricts (90/100)
4. **Ajouter la génération de PDF** avec mise en page professionnelle
5. **Implémenter les infographies** (graphiques de marché, matrices)

---

**Version** : 7.0 - Premium McKinsey/BCG  
**Date** : 2026-01-04  
**Statut** : ✅ Prêt pour Déploiement  
**Auteur** : MANUS IA Team
