# 🚀 IMOTION MANUS IA 2.0 - Guide d'Implémentation

## 📋 Fichiers à Déployer

### 1. `supabase/functions/_shared/aiUniversalClient.ts`
**Client AI Universel** - Route les appels vers les bonnes APIs (OpenAI, Anthropic, Perplexity, Google)

### 2. `supabase/functions/_shared/aiModelsConfig.ts`
**Configuration des Modèles** - Définit les modèles par plan et par tâche

### 3. `supabase/functions/_shared/imotionLogo.ts`
**Logo IMOTION en Base64** - Pour l'intégration dans les emails et rapports

### 4. `supabase/functions/_shared/infographicsGenerator.ts`
**Générateur d'Infographies SVG** - Génère les graphiques réels (3 à 25 selon le plan)

### 5. `supabase/functions/orchestrate-multi-agent-v8/index.ts`
**Orchestrateur Multi-Agents V8** - Coordonne les 17 agents IA

---

## 🎯 Modèles IA par Plan

| Plan | Recherche | Analyse | Stratégie | Rédaction | Synthèse | Vérification |
|------|-----------|---------|-----------|-----------|----------|--------------|
| **Freemium** | Gemini 2.5 Flash Lite | Gemini 2.5 Flash Lite | Gemini 2.5 Flash Lite | Gemini 2.5 Flash Lite | Gemini 2.5 Flash Lite | Gemini 2.5 Flash Lite |
| **Pro** | **Perplexity Sonar PRO** | Gemini 3 Pro | Claude Sonnet 4.5 | Claude Sonnet 4.5 | Gemini 3 Pro | Perplexity Sonar PRO |
| **Agency** | **Perplexity Sonar Reasoning PRO** | **Claude Opus 4.5** | GPT-5.1 | **Claude Opus 4.5** | GPT-5.1 | Perplexity Sonar Reasoning PRO |
| **Enterprise** | **Perplexity Deep Research (Labs)** | GPT-5.2 Pro | **Claude Opus 4.5** | **Claude Opus 4.5** | O1-Pro | Perplexity Deep Research (Labs) |

---

## 🔐 Variables d'Environnement Requises

Configurez ces clés dans **Supabase > Edge Functions > Secrets** :

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
GOOGLE_AI_API_KEY=AIza...
```

---

## 🤖 Les 17 Agents Spécialisés

### Phase 1: Recherche & Collecte
| Agent | Nom | Fonction |
|-------|-----|----------|
| A01 | Orchestrateur Principal | Planification et coordination |
| A02 | Scraping & Data Cleaning | Extraction et normalisation des données |
| A03 | Market Research | Dimensionnement marché (TAM/SAM/SOM) |
| A04 | Competitive Intelligence | Analyse concurrentielle (5-10 concurrents) |

### Phase 2: Cadres Stratégiques
| Agent | Nom | Fonction |
|-------|-----|----------|
| A05 | Analyse PESTEL | Facteurs macro-environnementaux |
| A06 | Porter 5 Forces | Analyse structurelle du secteur |
| A07 | SWOT Synthesis | Synthèse + Matrice TOWS |

### Phase 3: Audits Spécialisés
| Agent | Nom | Fonction |
|-------|-----|----------|
| A08 | SEO/SEM Specialist | Audit technique SEO (score /100) |
| A09 | UX/UI Designer | Évaluation ergonomie et design |
| A10 | Content Strategist | Inventaire et stratégie contenu |
| A11 | Performance Engineer | Performance, sécurité, accessibilité |
| A12 | Social Media Analyst | Présence et engagement réseaux |
| A13 | Conversion Optimizer | Analyse tunnel et CRO |
| A14 | Data Analytics Expert | Maturité data (4 niveaux) |

### Phase 4: Stratégie & Synthèse
| Agent | Nom | Fonction |
|-------|-----|----------|
| A15 | Strategy Consultant | 3 scénarios + roadmap 36 mois |
| A16 | Report Writer | Rédaction rapport McKinsey |
| A17 | Anti-Hallucination Verifier | Validation 100% des sources |

---

## 📊 Infographies Générées

| Plan | Nombre | Types |
|------|--------|-------|
| **Freemium** | 3 | Jauge score, Barres performance, Radar |
| **Pro** | 8 | + SWOT, Comparaison concurrents, Funnel, Priorités, Timeline |
| **Agency** | 15 | + PESTEL, Porter, Positionnement, ROI, Risques, Budget, Roadmap |
| **Enterprise** | 25 | + Scénarios, Prévisions, Tech Stack, Migration, KPIs, Parts de marché, Pricing, Change Management, Governance |

---

## 📝 Instructions de Déploiement

### Option A: Via LOVABLE (Recommandé)

1. **Ouvrez votre projet LOVABLE**

2. **Créez/remplacez les fichiers _shared** :
   - Naviguez vers `supabase/functions/_shared/`
   - Créez ou remplacez chaque fichier

3. **Créez le nouvel orchestrateur** :
   - Naviguez vers `supabase/functions/`
   - Créez le dossier `orchestrate-multi-agent-v8`
   - Ajoutez le fichier `index.ts`

4. **Configurez les secrets** :
   - Dans Supabase Dashboard > Edge Functions > Secrets
   - Ajoutez toutes les clés API

5. **Déployez** :
   - LOVABLE déploiera automatiquement via GitHub

### Option B: Via GitHub Direct

1. **Clonez le repo** :
   ```bash
   git clone https://github.com/Bricefwi/lovelib-spyglass.git
   cd lovelib-spyglass
   ```

2. **Copiez les fichiers** :
   ```bash
   cp -r imotion-corrected-files/supabase/functions/* supabase/functions/
   ```

3. **Commit et push** :
   ```bash
   git add .
   git commit -m "feat: MANUS IA 2.0 - 17 agents + modèles premium"
   git push
   ```

4. **Configurez les secrets Supabase**

---

## ✅ Test de Validation

Une fois déployé, testez avec :

1. Créez un pré-audit de test
2. Déclenchez l'orchestrateur V8
3. Vérifiez dans les logs :
   - `🤖 AI Call: perplexity/sonar-pro` (Pro)
   - `🤖 AI Call: anthropic/claude-opus-4-5-20251101` (Agency/Enterprise)
   - `🤖 AI Call: perplexity/sonar-deep-research` (Enterprise)

---

## 🎨 Charte Graphique IMOTION

- **Couleur primaire** : `#d8232a` (Rouge IMOTION)
- **Couleur secondaire** : `#ff4d54` (Rouge clair)
- **Police** : Inter (400-800)
- **Logo** : Intégré en Base64 dans `imotionLogo.ts`

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs Supabase Edge Functions
2. Testez les clés API individuellement
3. Vérifiez les quotas API

---

*Version 2.0 - Janvier 2026*
*IMOTION - L'Intelligence Artificielle au Service de Votre Croissance*
