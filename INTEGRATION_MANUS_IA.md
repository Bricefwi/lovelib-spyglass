# Guide d'Intégration MANUS IA 2.0 dans Lovable lovelib-spyglass

## 🎯 Vue d'Ensemble

Ce guide vous accompagne pas à pas pour intégrer le système d'orchestration multi-agents **MANUS IA 2.0** dans votre application Lovable **lovelib-spyglass**.

L'intégration remplace le workflow N8N actuel par un système d'orchestration avancé avec **17 agents spécialisés**, des **quality gates** stricts, et un système **anti-hallucination** intégré.

---

## 📋 Prérequis

### Comptes et Services

- ✅ Compte Lovable actif
- ✅ Projet Supabase configuré
- ✅ Compte Railway/Render/Fly.io (pour le backend Python)
- ✅ Clés API pour les LLMs :
  - OpenAI (GPT-5)
  - Anthropic (Claude Opus 4.1)
  - Google (Gemini 2.5 Ultra)
  - Perplexity (Sonar Pro)
  - Cohere (Command R)
  - Mistral (Large 2)

### Outils Locaux

- Node.js 18+ et npm
- Git
- Un éditeur de code (VS Code recommandé)

---

## 🚀 Installation - Étape par Étape

### Étape 1 : Déployer le Backend MANUS IA sur Railway

#### 1.1 Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Créez un nouveau projet

#### 1.2 Déployer depuis GitHub

1. Dans Railway, cliquez sur "New Project"
2. Sélectionnez "Deploy from GitHub repo"
3. Choisissez le repository contenant le code MANUS IA
4. Railway détectera automatiquement le `Dockerfile`

#### 1.3 Configurer les Variables d'Environnement

Dans Railway, allez dans l'onglet "Variables" et ajoutez :

```bash
# Application
APP_NAME=MANUS IA
ENVIRONMENT=production
DEBUG=False

# Database (utiliser Supabase)
DATABASE_URL=postgresql://user:password@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Redis (Railway peut fournir un add-on)
REDIS_URL=redis://default:password@redis.railway.internal:6379

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=...
SONAR_API_KEY=...
COHERE_API_KEY=...
MISTRAL_API_KEY=...

# Search APIs (optionnel)
TAVILY_API_KEY=...
SERPAPI_KEY=...
BRAVE_API_KEY=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

#### 1.4 Déployer

1. Railway déploiera automatiquement
2. Notez l'URL publique générée (ex: `https://manus-ia-production.up.railway.app`)
3. Testez l'endpoint de santé : `https://your-url/health`

**Coût estimé** : $5-20/mois selon l'usage

---

### Étape 2 : Configurer Supabase

#### 2.1 Ajouter les Secrets Supabase

Dans votre projet Supabase, allez dans **Settings > Edge Functions > Secrets** et ajoutez :

```bash
MANUS_BACKEND_URL=https://your-manus-backend.railway.app
MANUS_API_KEY=your-secure-random-api-key
```

Pour générer une clé API sécurisée :

```bash
openssl rand -base64 32
```

#### 2.2 Mettre à Jour la Fonction Edge `orchestrate-multi-agent`

Remplacez le contenu de `supabase/functions/orchestrate-multi-agent/index.ts` par le fichier `index-manus.ts` fourni.

**Via CLI Supabase** :

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref your-project-ref

# Copier le nouveau fichier
cp supabase/functions/orchestrate-multi-agent/index-manus.ts \
   supabase/functions/orchestrate-multi-agent/index.ts

# Déployer la fonction
supabase functions deploy orchestrate-multi-agent
```

**Via GitHub** (si vous utilisez le déploiement automatique) :

1. Commitez le fichier modifié
2. Pushez vers GitHub
3. Supabase déploiera automatiquement

---

### Étape 3 : Vérifier l'Intégration

#### 3.1 Test de l'Endpoint Backend

```bash
curl -X POST https://your-manus-backend.railway.app/api/v1/audit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "client": {
      "company": {"name": "Test Corp", "website": "https://test.com"},
      "business": {"sector": "SaaS"},
      "objectives": {"primary": ["Test"]}
    },
    "metadata": {"request_id": "test-123", "timestamp": "2025-01-01T00:00:00Z", "source": "test"},
    "orchestrationId": "test-orch-123",
    "callbackUrl": "https://your-supabase-url/functions/v1/n8n-callback"
  }'
```

Réponse attendue :

```json
{
  "success": true,
  "audit_id": "uuid-here",
  "message": "Audit started successfully"
}
```

#### 3.2 Test depuis Lovable

1. Allez sur votre application Lovable
2. Remplissez le formulaire de pré-audit
3. Soumettez
4. Allez sur la page "Monitoring des Audits Approfondis"
5. Vérifiez que l'orchestration démarre

Vous devriez voir :

- ✅ Statut : "En cours"
- ✅ Phase actuelle : "initialization"
- ✅ Progression : 0%
- ✅ 17 agents listés dans les phases

---

### Étape 4 : Monitoring et Debugging

#### 4.1 Logs Railway

Dans Railway, allez dans l'onglet "Deployments" puis "Logs" pour voir les logs en temps réel du backend MANUS IA.

#### 4.2 Logs Supabase

Dans Supabase, allez dans **Edge Functions > Logs** pour voir les logs de la fonction `orchestrate-multi-agent`.

#### 4.3 Monitoring UI Lovable

La page `OrchestrationMonitor` affiche en temps réel :

- Statut de l'orchestration
- Phase actuelle
- Progression (%)
- Erreurs éventuelles
- Rapports générés

---

## 🔧 Configuration Avancée

### Personnalisation des Agents

Pour personnaliser les agents, modifiez le fichier `src/agents/` dans le backend MANUS IA.

Exemple pour l'agent PESTEL :

```python
# src/agents/a03_pestel_analyst.py

class PESTELAnalyst(BaseAgent):
    def __init__(self, agent_id: str = "A03", config: Dict = None):
        super().__init__(agent_id, config)
        
        # Personnaliser les dimensions PESTEL
        self.pestel_dimensions = {
            "Politique": [...],
            "Économique": [...],
            # ...
        }
```

Redéployez sur Railway après modification.

### Ajustement des Quality Gates

Pour modifier les seuils des quality gates, éditez `src/core/config.py` :

```python
# Quality Gates Thresholds
QUALITY_GATE_PHASE_1 = 0.85  # 85% (Market Study)
QUALITY_GATE_PHASE_2 = 0.80  # 80% (Audits)
QUALITY_GATE_PHASE_3 = 0.85  # 85% (Analyses)
QUALITY_GATE_PHASE_4 = 0.95  # 95% (Synthesis)
```

### Optimisation des Coûts LLM

Pour réduire les coûts, privilégiez les modèles Tier 2/3 pour les tâches simples :

```python
# src/core/config.py

MODEL_REGISTRY = {
    # Tier 3 (économique) pour tâches simples
    "gpt-3.5-turbo": {
        "tier": 3,
        "cost_per_1k": 0.0005,
        # ...
    },
    # Tier 1 (premium) pour tâches complexes uniquement
    "gpt-5-turbo": {
        "tier": 1,
        "cost_per_1k": 0.01,
        # ...
    }
}
```

---

## 🐛 Troubleshooting

### Problème : "MANUS_BACKEND_URL not configured"

**Solution** : Vérifiez que vous avez bien ajouté le secret dans Supabase :

```bash
supabase secrets set MANUS_BACKEND_URL=https://your-url.railway.app
```

### Problème : "MANUS IA backend unreachable"

**Causes possibles** :

1. Le backend Railway n'est pas démarré
2. L'URL est incorrecte
3. Le firewall bloque les requêtes

**Solution** :

1. Vérifiez que le backend est en ligne : `curl https://your-url/health`
2. Vérifiez l'URL dans les secrets Supabase
3. Consultez les logs Railway

### Problème : "Quality Gate Failed"

**Causes possibles** :

1. Sources insuffisantes (< 2 sources)
2. Crédibilité des sources trop faible
3. Contradictions logiques

**Solution** :

1. Vérifiez les logs de l'agent A17 (Truth Guardian)
2. Consultez le rapport de validation dans les résultats
3. Ajustez les seuils de quality gates si nécessaire

### Problème : "Orchestration stuck at 0%"

**Causes possibles** :

1. Le callback Supabase ne fonctionne pas
2. Le backend MANUS IA a crashé
3. Problème de connexion à la base de données

**Solution** :

1. Vérifiez les logs Railway pour voir si le backend traite la requête
2. Vérifiez que le `callbackUrl` est correct
3. Testez manuellement le callback :

```bash
curl -X POST https://your-supabase-url/functions/v1/n8n-callback \
  -H "Content-Type: application/json" \
  -d '{
    "orchestrationId": "your-orch-id",
    "status": "running",
    "progress": 50,
    "currentPhase": "market_study"
  }'
```

---

## 📊 Métriques et Performance

### Temps d'Exécution Attendus

| Phase | Durée Estimée | Agents |
|-------|---------------|--------|
| Phase 0 - Initialization | 3 min | 1 |
| Phase 1 - Market Study | 20 min | 6 |
| Phase 2 - Conversational Audits | 15 min | 2 |
| Phase 3 - Specialized Analyses | 25 min | 6 |
| Phase 4 - Synthesis & Verification | 15 min | 2 |
| **Total** | **~78 min** | **17** |

### Coûts LLM Estimés par Audit

| Modèle | Tokens Moyens | Coût Unitaire | Coût Total |
|--------|---------------|---------------|------------|
| GPT-5 Turbo | 50,000 | $0.01/1k | $0.50 |
| Claude Opus 4.1 | 30,000 | $0.015/1k | $0.45 |
| Gemini 2.5 Ultra | 40,000 | $0.0075/1k | $0.30 |
| Perplexity Pro | 20,000 | $0.005/1k | $0.10 |
| **Total par audit** | **140,000** | | **~$1.35** |

**Note** : Les coûts varient selon la complexité de l'audit et la sélection dynamique des modèles.

---

## 🔄 Migration depuis N8N

### Coexistence Temporaire

Pour une migration progressive, vous pouvez faire coexister N8N et MANUS IA :

1. Créez une variable d'environnement `USE_MANUS_BACKEND` :

```typescript
// supabase/functions/orchestrate-multi-agent/index.ts

const useManus = Deno.env.get('USE_MANUS_BACKEND') === 'true';

if (useManus) {
  // Appeler MANUS IA
  fetch(`${manusBackendUrl}/api/v1/audit`, ...);
} else {
  // Appeler N8N (ancien système)
  fetch(n8nWebhookUrl, ...);
}
```

2. Testez avec `USE_MANUS_BACKEND=false` (N8N)
3. Passez à `USE_MANUS_BACKEND=true` (MANUS IA)
4. Comparez les résultats
5. Supprimez le code N8N une fois validé

### Désactivation de N8N

Une fois MANUS IA validé :

1. Supprimez la variable `N8N_WEBHOOK_URL` des secrets Supabase
2. Supprimez le code N8N de `index.ts`
3. Désactivez le workflow N8N

---

## 📚 Ressources Supplémentaires

### Documentation

- [Documentation MANUS IA 2.0](../manus-orchestration/README.md)
- [Architecture Technique](../integration-strategy.md)
- [API Reference](../manus-orchestration/docs/api-reference.md)

### Support

- **Issues GitHub** : [github.com/your-org/manus-orchestration/issues](https://github.com)
- **Email** : support@manus-ia.com
- **Discord** : [discord.gg/manus-ia](https://discord.gg)

### Exemples

- [Exemple d'audit complet](../manus-orchestration/examples/full-audit.json)
- [Exemple de callback](../manus-orchestration/examples/callback-payload.json)
- [Exemple de rapport](../manus-orchestration/examples/audit-report.pdf)

---

## ✅ Checklist de Déploiement

### Préparation

- [ ] Compte Railway créé
- [ ] Clés API LLM obtenues
- [ ] Backend MANUS IA déployé sur Railway
- [ ] URL du backend notée

### Configuration Supabase

- [ ] Secret `MANUS_BACKEND_URL` ajouté
- [ ] Secret `MANUS_API_KEY` ajouté
- [ ] Fonction `orchestrate-multi-agent` modifiée
- [ ] Fonction déployée

### Tests

- [ ] Test de santé du backend (`/health`)
- [ ] Test de l'endpoint `/api/v1/audit`
- [ ] Test depuis l'UI Lovable
- [ ] Vérification du monitoring temps réel
- [ ] Vérification des quality gates

### Mise en Production

- [ ] Migration progressive configurée
- [ ] Monitoring Sentry activé
- [ ] Alertes configurées
- [ ] Documentation utilisateur créée
- [ ] Équipe formée

---

## 🎉 Félicitations !

Vous avez intégré avec succès **MANUS IA 2.0** dans votre application Lovable !

Votre système dispose maintenant de :

✅ **17 agents spécialisés** (vs 12 avant)
✅ **Quality gates stricts** (85-95%)
✅ **Système anti-hallucination** intégré
✅ **Sélection dynamique des modèles IA**
✅ **Monitoring temps réel** via Supabase
✅ **Architecture scalable** et maintenable

**Prochaines étapes** :

1. Lancez vos premiers audits
2. Analysez les résultats et les métriques
3. Ajustez les paramètres selon vos besoins
4. Partagez vos retours avec la communauté

---

**MANUS IA 2.0** - Orchestration Multi-Agents de Nouvelle Génération 🚀
