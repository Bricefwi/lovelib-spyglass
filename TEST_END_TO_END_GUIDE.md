# Guide de Test End-to-End - Système Multi-Agents

## 🎯 Objectif

Tester l'ensemble du système d'audit multi-agents de bout en bout pour vérifier la qualité des rapports générés à chaque étape.

## 📋 Prérequis

1. **Environnement configuré**:
   - Supabase Local Dev ou projet Supabase Cloud
   - Toutes les Edge Functions déployées
   - Variables d'environnement configurées:
     ```
     OPENAI_API_KEY=sk-...
     PERPLEXITY_API_KEY=pplx-...
     ANTHROPIC_API_KEY=sk-ant-...
     ```

2. **Compte utilisateur test** avec un plan configuré (Starter, Agency, ou Enterprise)

3. **Données de test**:
   - URL d'entreprise : `https://www.apple.com` (exemple)
   - Secteur : Technology
   - Budget LLM : 15-20€ pour un audit complet

## 🚀 Scénario de Test Complet

### Étape 1: Créer un Pré-Audit

**Interface**: `/client/new-project`

```typescript
// Données à saisir:
{
  url: "https://www.apple.com",
  company_guess: "Apple Inc.",
  sector: "Technology",
  target_countries: ["US", "FR", "UK"],
  objectives: [
    "Améliorer présence digitale",
    "Augmenter conversion e-commerce"
  ]
}
```

**Vérifications**:
- [ ] Le pré-audit est créé dans `pre_audits`
- [ ] Status = `pending`
- [ ] Plan_tier correct (selon votre abonnement)

**Capture**: Screenshot du formulaire rempli

---

### Étape 2: Lancer l'Orchestration V2

**Méthode 1**: Via l'interface UI

1. Cliquer sur "Lancer l'analyse" dans `/client/audits`
2. Observer la progression en temps réel

**Méthode 2**: Via curl (pour debug détaillé)

```bash
# Récupérer le JWT token
TOKEN="YOUR_SUPABASE_JWT_TOKEN"
AUDIT_ID="uuid-of-your-audit"
PROJECT_URL="https://YOUR_PROJECT.supabase.co"

curl -X POST "$PROJECT_URL/functions/v1/orchestrate-v2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audit_id": "'$AUDIT_ID'"
  }'
```

**Durée attendue** (selon plan):
- Starter: ~4-6 minutes (4 agents en séquentiel)
- Agency: ~8-10 minutes (9 agents en parallèle)
- Enterprise: ~10-14 minutes (9 agents + analyses approfondies)

**Vérifications**:
- [ ] Orchestration démarre sans erreur
- [ ] Logs dans la console Supabase Functions
- [ ] Budget LLM tracking visible

---

### Étape 3: Vérifier les Agents Individuels

#### 3.1. Agent Scraper (Perplexity Sonar Pro)

**Log attendu**:
```
🕷️ ========== SCRAPER START ==========
🔍 Scraping: https://www.apple.com
📊 Using Perplexity Sonar Pro (citations: true)
✅ Scraper: OK ($0.0850) - 850 tokens
📄 Company profile extracted
  - Name: Apple Inc.
  - Industry: Technology, Consumer Electronics
  - Confidence: 95/100
  - Citations: 12 sources
🕷️ ========== SCRAPER END ==========
```

**Qualité attendue**:
- ✅ Nom entreprise correct
- ✅ Secteur identifié
- ✅ Citations avec URLs et timestamps
- ✅ Confidence score > 85
- ✅ Pas d'hallucination (rule: if unsure → confidence < 50)

**Données extraites** (JSON):
```json
{
  "company_profile": {
    "name": "Apple Inc.",
    "industry": "Technology, Consumer Electronics",
    "description": "Multinational technology company...",
    "headquarters": "Cupertino, California",
    "founded": 1976,
    "ceo": "Tim Cook",
    "revenue": "$394.3 billion (2022)",
    "employees": 164000
  },
  "sources": [
    {
      "url": "https://www.apple.com/about/",
      "title": "About Apple",
      "timestamp": "2025-11-26T16:00:00Z"
    }
  ],
  "confidence": 95,
  "narrative": "Apple Inc. est un géant technologique américain..."
}
```

**Capture**: Screenshot du JSON dans Supabase Database Explorer

---

#### 3.2. Agent PESTEL (Claude 3.5 Sonnet)

**Log attendu**:
```
🌐 ========== PESTEL START ==========
📊 PESTEL analysis for: Apple Inc.
🤖 Using Claude 3.5 Sonnet
✅ PESTEL: OK ($0.1200) - 1200 tokens
📈 6 factors analyzed with impact chiffré
🌐 ========== PESTEL END ==========
```

**Qualité attendue**:
- ✅ 6 facteurs (Political, Economic, Social, Technological, Environmental, Legal)
- ✅ Impact chiffré pour chaque facteur (ex: "Réglementation RGPD → -2.5% marge")
- ✅ Narrative fluide (pas de bullet points bruts)
- ✅ Connexions entre facteurs (ex: "Impact politique amplifié par contexte économique...")

**Données extraites** (JSON):
```json
{
  "factors": [
    {
      "category": "Political",
      "impact": "medium_negative",
      "score": -2,
      "description": "Tensions géopolitiques US-Chine impactent la supply chain...",
      "quantified_impact": "-5% production capacity en Chine",
      "timeframe": "2024-2025",
      "mitigation": "Diversification vers Inde et Vietnam"
    },
    {
      "category": "Technological",
      "impact": "high_positive",
      "score": 4,
      "description": "IA générative ouvre nouvelles opportunités...",
      "quantified_impact": "+15% innovation pipeline",
      "timeframe": "2024-2026"
    }
    // ... 4 autres facteurs
  ],
  "synthesis": "L'environnement macro d'Apple est marqué par...",
  "strategic_implications": [
    "Accélérer diversification supply chain",
    "Investir massivement dans IA",
    "Renforcer conformité réglementaire EU"
  ],
  "confidence": 88
}
```

**Capture**: Screenshot de la section PESTEL dans le rapport final

---

#### 3.3. Agent Porter 5 Forces (Claude 3.5 Sonnet)

**Log attendu**:
```
⚔️ ========== PORTER START ==========
🔍 Porter 5 Forces for: Apple Inc.
📊 Analyzing competitive environment
✅ Porter: OK ($0.0950) - 950 tokens
⚔️ ========== PORTER END ==========
```

**Qualité attendue**:
- ✅ 5 forces avec scores 1-5
- ✅ Analyse détaillée par force
- ✅ Strategic implications
- ✅ Competitive positioning

**Données extraites** (JSON):
```json
{
  "forces": [
    {
      "name": "Threat of New Entrants",
      "score": 2,
      "intensity": "low",
      "analysis": "Barrières à l'entrée élevées: 1) Capex R&D (20B$/an)...",
      "key_factors": [
        "Economies of scale massives",
        "Propriété intellectuelle (brevets)",
        "Fidélité marque Apple"
      ],
      "trend": "stable"
    },
    {
      "name": "Bargaining Power of Suppliers",
      "score": 3,
      "intensity": "medium",
      "analysis": "Apple dépend de fournisseurs clés (TSMC pour puces)...",
      "key_factors": [
        "Concentration fournisseurs (TSMC = 100% puces A-series)",
        "Switching costs élevés",
        "Volumes d'achat donnent pouvoir de négociation"
      ],
      "trend": "increasing"
    }
    // ... 3 autres forces
  ],
  "overall_attractiveness": "high",
  "competitive_position": "Dominant player with strong moats",
  "strategic_implications": [
    "Maintenir leadership innovation pour contrer substituts",
    "Diversifier supply chain (risque TSMC)",
    "Renforcer écosystème pour lock-in clients"
  ],
  "confidence": 90
}
```

---

#### 3.4. Agent SWOT (Claude 3.5 Sonnet)

**Log attendu**:
```
🎯 ========== SWOT START ==========
📊 SWOT analysis synthesizing Scraper + PESTEL + Porter
✅ SWOT: OK ($0.1100) - 1100 tokens
🎯 ========== SWOT END ==========
```

**Qualité attendue**:
- ✅ Synthèse cohérente des 3 agents précédents
- ✅ Connexions explicites (ex: "Force identifiée dans Scraper se confirme dans Porter...")
- ✅ Narrative stratégique avec climax
- ✅ Priorisation des opportunités (top 3-5)

**Données extraites** (JSON):
```json
{
  "strengths": [
    {
      "item": "Brand equity #1 mondial",
      "evidence": "Valorisation marque 482B$ (Interbrand 2023) - Scraper",
      "strategic_value": "Permet pricing premium +30% vs concurrents",
      "source": "scraper_data"
    },
    {
      "item": "Écosystème fermé lock-in",
      "evidence": "iCloud + iMessage + AirDrop créent switching costs >1000$",
      "strategic_value": "Rétention clients 92% (vs 74% Android)",
      "source": "porter_analysis"
    }
    // ... 5-8 strengths
  ],
  "weaknesses": [
    {
      "item": "Dépendance Chine (manufacturing)",
      "evidence": "85% production en Chine - PESTEL",
      "risk_level": "high",
      "mitigation": "Diversification Inde/Vietnam en cours",
      "source": "pestel_analysis"
    }
    // ... 3-5 weaknesses
  ],
  "opportunities": [
    {
      "item": "IA générative intégrée (Apple Intelligence)",
      "market_size": "Marché IA = 1.8T$ d'ici 2030",
      "revenue_potential": "+50-80B$ revenus annuels",
      "timeframe": "2024-2027",
      "feasibility": "high",
      "priority": 1
    }
    // ... 5-10 opportunities
  ],
  "threats": [
    {
      "item": "Réglementation antitrust EU (DMA)",
      "impact": "Obligation ouverture App Store → -15-20% services revenue",
      "probability": "high",
      "timeframe": "2025",
      "mitigation": "Lobby + compliance + diversification revenue streams"
    }
    // ... 5-8 threats
  ],
  "narrative": "Apple se trouve à un point d'inflexion stratégique...",
  "top_3_priorities": [
    "Accélérer IA générative (Apple Intelligence)",
    "Diversifier supply chain hors Chine",
    "Renforcer services pour compenser régulation"
  ],
  "confidence": 92
}
```

---

#### 3.5. Agent SEO (GPT-4o)

**Log attendu**:
```
🔍 ========== SEO AUDIT START ==========
🌐 URL: https://www.apple.com
📊 Depth: full_audit
✅ SEO: OK ($0.2400) - 2400 tokens
🔍 ========== SEO AUDIT END ==========
```

**Qualité attendue**:
- ✅ 6 axes d'analyse (Technique, Mots-clés, Backlinks, SERPs, Benchmark, Quick-wins)
- ✅ Scores 0-100 par axe
- ✅ Quick-wins avec ROI chiffré
- ✅ Priorités actionnables

**Données extraites** (JSON):
```json
{
  "technical": {
    "score": 85,
    "issues": [
      {
        "type": "critical",
        "issue": "Core Web Vitals: LCP 3.2s (target <2.5s)",
        "impact": "SEO ranking -5 positions",
        "fix": "Optimize images + CDN + lazy loading",
        "effort": "2 jours dev"
      }
    ]
  },
  "keywords": {
    "current_positions": [
      {"keyword": "iphone", "position": 1, "volume": 2240000},
      {"keyword": "macbook", "position": 1, "volume": 673000}
    ],
    "opportunities": [
      {
        "keyword": "apple intelligence ai",
        "volume": 45000,
        "difficulty": 35,
        "potential_position": "3-5",
        "monthly_traffic_gain": "+12000 visits",
        "revenue_potential": "+180k€/an"
      }
    ]
  },
  "quick_wins": [
    {
      "action": "Ajouter schema markup Product sur toutes pages produits",
      "impact": "+25% CTR dans SERPs → +45k visits/mois",
      "effort": "1 jour dev",
      "roi": "10x"
    }
  ]
}
```

---

#### 3.6. Agent Content Strategy (GPT-4o)

**Log attendu**:
```
📝 ========== CONTENT MARKETING START ==========
📊 Content strategy for: Apple Inc.
✅ Content: OK ($0.1800) - 1800 tokens
📝 ========== CONTENT MARKETING END ==========
```

**Qualité attendue**:
- ✅ Audit contenu existant avec scores
- ✅ Stratégie piliers thématiques SEO
- ✅ Calendar éditorial 3 mois avec formats variés
- ✅ ROI projeté avec KPIs

**Données extraites** (JSON):
```json
{
  "audit_existant": {
    "volume_mensuel": "8 articles/mois",
    "score_qualite": 78,
    "performance": {
      "trafic_mensuel": 245000,
      "leads_generes": 3800,
      "taux_conversion": "1.55%"
    }
  },
  "strategie_proposee": {
    "piliers_thematiques": [
      {
        "pilier": "Apple Intelligence & AI Innovation",
        "opportunite_seo": "340k recherches/mois",
        "content_mix": {
          "blog_long_form": "50%",
          "video_tutorials": "25%",
          "infographics": "15%",
          "case_studies": "10%"
        }
      }
    ]
  },
  "calendar_3_mois": [
    {
      "semaine": "S1 Déc 2025",
      "contenu": "Ultimate Guide: Apple Intelligence Features Explained",
      "format": "blog long-form (3500 mots)",
      "funnel": "ToFu",
      "keywords_cibles": ["apple intelligence", "ai features iphone"],
      "effort": "12h",
      "roi_attendu": "+2500 leads/trimestre"
    }
  ]
}
```

---

### Étape 4: Agent Senior Writer - Synthèse Narrative

**Log attendu**:
```
✍️ ========== SENIOR WRITER START ==========
📊 Context size: ~45000 chars (all 9 agents)
📡 Calling OpenAI GPT-4 Turbo...
✅ Senior Writer: OK ($0.7500)
📄 Narrative: 68 pages, 6 sections
⭐ Quality score: 9.2/10
✍️ ========== SENIOR WRITER END ==========
```

**Qualité attendue**:
- ✅ Rapport 50-100+ pages selon quality_level
- ✅ Narrative fluide "Laboratoire Perplexity" (pas de bullet points bruts)
- ✅ 6 sections cohérentes avec storytelling
- ✅ Executive summary 1 page ultra-condensé
- ✅ Recommandations prioritaires avec ROI chiffré
- ✅ Insights non-obvieux (connexions inattendues entre données)

**Structure du rapport**:

1. **Executive Summary** (4-8 pages)
   - Context marché PESTEL résumé
   - Position actuelle SWOT
   - Top 3-5 opportunités chiffrées
   - Recommandations exécutives

2. **Diagnostic Entreprise** (8-12 pages)
   - Histoire, mission, modèle économique (Scraper)
   - Environnement macro (PESTEL narrative)
   - Environnement compétitif (Porter 5 Forces)
   - Position actuelle (SWOT narrative)

3. **Audits Marketing & Digital** (15-25 pages)
   - SEO/SEM avec quick-wins ROI
   - Content strategy + calendar 3 mois
   - Social media audit + calendar 1 mois
   - Email marketing + automation workflows
   - Data analytics + KPIs dashboards

4. **Scénarios Stratégiques** (3 scénarios × 3-5 pages = 8-15 pages)
   - Scénario 1: "Apple Intelligence Leadership"
   - Scénario 2: "Services-First Transformation"
   - Scénario 3: "Diversification Supply Chain"
   - Pour chaque: actions, ressources, timeline, ROI, risques

5. **Plan d'Action & Roadmap** (12-18 pages)
   - Vision 3 ans chiffrée
   - Stratégies par pilier (Digital, Commercial, Organisation)
   - Roadmap 12 mois détaillée mois par mois
   - Budget prévisionnel global
   - Risques & plan mitigation

6. **Annexes** (5-10 pages)
   - Méthodologie
   - Sources & références
   - Glossaire
   - Contact & next steps

**Capture**: PDF du rapport complet généré

---

### Étape 5: Génération HTML + Visualisation

**Log attendu**:
```
📄 Generating HTML report with narrative...
✅ Report created: uuid-xxx
📊 Estimated pages: 68
📈 Sections: 6
```

**Qualité attendue**:
- ✅ HTML professionnel avec branding (couleurs, logo)
- ✅ Table des matières cliquable
- ✅ Executive summary highlighted (box gold)
- ✅ Recommandations priority cards (color-coded)
- ✅ Markdown correctement converti (headers, bold, italic, code, links, lists)
- ✅ Print-ready CSS (@media print)
- ✅ Insights boxes bleus
- ✅ Footer avec quality scores

**Test d'affichage**:
1. Ouvrir `/audit-report/[id]`
2. Vérifier le rendu HTML
3. Tester le print-to-PDF (Ctrl+P)

**Capture**: Screenshot du rapport HTML dans le navigateur

---

## 📊 Critères de Qualité - Scorecard

| Critère | Score attendu | Vérification |
|---------|---------------|--------------|
| **Scraper - Précision données** | > 90% | Comparer avec site officiel |
| **Scraper - Citations** | 100% URLs valides | Cliquer sur chaque source |
| **PESTEL - Impact chiffré** | 6/6 facteurs | Vérifier présence chiffres concrets |
| **Porter - Analyse détaillée** | 5/5 forces | Lire chaque force (>150 mots) |
| **SWOT - Synthèse cohérente** | > 85 confidence | Vérifier connexions entre agents |
| **SEO - Quick-wins ROI** | > 3 actions | Actionnable + chiffré |
| **Content - Calendar détaillé** | 12 semaines | Format + keywords + effort |
| **Senior Writer - Narrative fluide** | > 9.0/10 | Lire 3 pages random, pas de bullet points |
| **Senior Writer - Insights originaux** | > 5 insights | Connexions non-évidentes |
| **HTML - Rendu professionnel** | 100% | Test print-to-PDF |

## 🐛 Debugging - Que faire si...

### Agent échoue avec erreur "Budget exceeded"

```
⚠️ Budget alert: $15.40 / $15.00
❌ Stopping orchestration to prevent overspend
```

**Solution**:
1. Augmenter `llm_budget_per_audit` dans `plan_profiles`
2. Ou passer à un plan supérieur (Agency/Enterprise)

### Agent retourne données incohérentes

**Exemple**: Scraper dit "Apple = automobile", PESTEL parle de "banking"

**Solution**:
1. Vérifier les prompts des agents (trop vagues?)
2. Augmenter `temperature` si trop rigide, diminuer si trop créatif
3. Vérifier que `company_guess` est correct dans `pre_audits`

### Senior Writer génère rapport court (< 30 pages)

**Causes possibles**:
- `quality_level = 'essential'` → 30-40 pages
- Agents ont retourné peu de données
- `max_completion_tokens` trop bas

**Solution**:
1. Passer à `quality_level = 'standard'` ou 'premium'
2. Augmenter `report_pages` dans `plan_profile`

### HTML mal formaté (Markdown non converti)

**Solution**:
1. Vérifier `markdownToHtml()` function
2. Tester avec des exemples simples: `**bold**`, `# Header`, etc.
3. Regarder les logs navigateur (F12)

## 📸 Captures Attendues

Pour une démonstration complète, prendre:
1. ✅ Screenshot formulaire pre-audit
2. ✅ Screenshot orchestration en cours (logs)
3. ✅ Screenshot Supabase DB avec données scraper
4. ✅ Screenshot JSON PESTEL dans DB
5. ✅ Screenshot rapport HTML complet
6. ✅ Screenshot PDF exporté
7. ✅ Screenshot UserMenu avec plan visible
8. ✅ Screenshot page Pricing

## 🎯 Scénarios de Test Additionnels

### Test 1: Starter Plan (fonctionnalités limitées)

- URL: `https://www.spotify.com`
- Agents activés: Scraper only (PESTEL/Porter désactivés)
- Rapport: 30-40 pages
- Budget: < 5€

### Test 2: Agency Plan (full features + white-label)

- URL: `https://www.shopify.com`
- Agents activés: Tous (9 agents)
- White-label: Logo personnalisé + couleurs
- Rapport: 50-70 pages
- Budget: < 12€

### Test 3: Enterprise Plan (exhaustif)

- URL: `https://www.salesforce.com`
- Agents activés: Tous + pricing intelligence
- Rapport: 80-120 pages
- Scénarios: 7
- Budget: < 20€

## 🚀 Checklist Pré-Test

- [ ] Environnement configuré (Supabase + Edge Functions)
- [ ] Variables d'environnement (OPENAI_API_KEY, etc.)
- [ ] Compte utilisateur test avec plan Agency ou Enterprise
- [ ] Budget LLM suffisant (>15€ pour test complet)
- [ ] URLs de test préparées
- [ ] Outil de capture d'écran prêt
- [ ] Navigateur avec console DevTools ouverte

## ✅ Post-Test - Checklist Qualité

- [ ] Tous les agents ont réussi (9/9)
- [ ] Budget LLM respecté (< limit)
- [ ] Rapport généré (50-100+ pages)
- [ ] HTML rendu correctement
- [ ] PDF exportable (print-to-PDF fonctionne)
- [ ] Narrative fluide (pas de JSON brut dans le rapport)
- [ ] Sources citées (URLs cliquables)
- [ ] Recommandations actionnables avec ROI
- [ ] Quality score > 9.0/10
- [ ] Temps génération < 15 minutes

---

**Bon test! 🚀**

Si vous rencontrez des problèmes, consultez les logs Supabase Functions et le `orchestrate-v2/index.ts` pour debugging détaillé.
