# 🏗️ Architecture Orchestrateur v7.0 - Premium McKinsey/BCG

## 🎯 Objectif

Créer des rapports de **niveau McKinsey/BCG** de 50-150 pages avec recherches approfondies, analyses de marché, études concurrentielles et rédaction professionnelle.

---

## 🤖 Configuration des Modèles IA par Plan

### Freemium (Discovery)
- **Modèle principal** : `gpt-4o-mini`
- **Recherche** : Perplexity Sonar (basic)
- **Agents** : 7 agents basiques
- **Longueur** : 15-20 pages

### Pro (PME)
- **Modèle principal** : `gpt-5`
- **Recherche** : Perplexity Pro (`sonar-pro`)
- **Agents** : 12 agents dont 2 de recherche
- **Longueur** : 35-50 pages

### Agency (Conseil Premium)
- **Modèles** : `gpt-5.1` + `o1-pro` (raisonnement)
- **Recherche** : Perplexity Labs (rapports)
- **Agents** : 15 agents dont 4 de recherche
- **Longueur** : 60-80 pages

### Enterprise (Transformation)
- **Modèles** : `gpt-5.2-pro` + `o1-pro` + `claude-3-5-sonnet-20241022`
- **Recherche** : Perplexity Labs + Deep Research
- **Agents** : 17 agents dont 6 de recherche
- **Longueur** : 100-150 pages

---

## 📊 Nouveaux Agents de Recherche Premium

### 1. Market Research Agent
**Rôle** : Étude de marché approfondie

**Recherches** :
- Taille du marché (TAM, SAM, SOM)
- Taux de croissance annuel
- Tendances macro-économiques
- Segments de marché
- Barrières à l'entrée
- Opportunités de croissance

**Sources** :
- Perplexity Pro pour les données de marché
- Recherche web pour Statista, IBISWorld, Gartner
- Rapports sectoriels publics

**Output** : Section "Analyse de Marché" (5-15 pages selon le plan)

---

### 2. Competitive Intelligence Agent
**Rôle** : Analyse concurrentielle approfondie

**Recherches** :
- Identification des 5-10 principaux concurrents
- Analyse de leur positionnement
- Pricing et offres
- Forces et faiblesses
- Parts de marché estimées
- Avantages concurrentiels

**Sources** :
- Perplexity Pro pour identifier les concurrents
- Scraping des sites concurrents (via browser)
- Analyse des avis clients (Trustpilot, G2, Capterra)

**Output** : Section "Paysage Concurrentiel" (8-20 pages selon le plan)

---

### 3. Economic Analyst Agent
**Rôle** : Analyse économique et financière du secteur

**Analyses** :
- Forces de Porter (5 forces)
- Chaîne de valeur du secteur
- Modèles économiques dominants
- Marges moyennes du secteur
- Multiples de valorisation
- KPIs sectoriels

**Sources** :
- Perplexity Pro pour les données financières
- Rapports d'analystes financiers
- Données boursières pour les concurrents cotés

**Output** : Section "Économie du Secteur" (5-12 pages selon le plan)

---

### 4. Industry Expert Agent
**Rôle** : Expertise sectorielle et tendances

**Analyses** :
- Tendances technologiques
- Évolutions réglementaires
- Innovations sectorielles
- Meilleures pratiques
- Cas d'usage innovants

**Sources** :
- Perplexity Labs pour les rapports sectoriels
- Articles de presse spécialisée
- Blogs d'experts

**Output** : Section "Insights Sectoriels" (3-8 pages selon le plan)

---

### 5. Data Analyst Agent
**Rôle** : Analyse de données et KPIs

**Analyses** :
- Analyse des métriques du site client
- Benchmarking avec les concurrents
- Calcul des KPIs clés
- Projections financières
- Modélisation ROI

**Sources** :
- Données du site client (via scraping)
- Données de marché (Perplexity)
- Outils d'analyse (SimilarWeb, Ahrefs via API si disponible)

**Output** : Section "Analyse de Performance" (5-10 pages selon le plan)

---

### 6. Strategic Consultant Agent
**Rôle** : Recommandations stratégiques McKinsey-style

**Analyses** :
- Synthèse de toutes les analyses
- Identification des opportunités
- Priorisation des actions
- Roadmap détaillée
- Calcul du ROI par recommandation

**Style** :
- Rédaction professionnelle (pas d'acronymes)
- Justifications chiffrées
- Plans d'action détaillés (qui, quoi, quand, combien)
- Format McKinsey (Executive Summary, Situation, Complication, Resolution)

**Output** : Section "Recommandations Stratégiques" (10-30 pages selon le plan)

---

## 🔍 Intégration Perplexity Pro

### Configuration API
```typescript
const PERPLEXITY_API_KEY = Deno.env.get('SONAR_API_KEY');
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Modèles disponibles
const PERPLEXITY_MODELS = {
  basic: 'sonar',                    // Freemium
  pro: 'sonar-pro',                  // Pro
  reasoning: 'sonar-reasoning',      // Agency
  research: 'sonar-research'         // Enterprise
};
```

### Fonction de Recherche
```typescript
async function perplexitySearch(query: string, model: string = 'sonar-pro') {
  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional market research analyst. Provide detailed, sourced answers with citations.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
      return_citations: true,
      return_images: false
    })
  });

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    citations: data.citations || []
  };
}
```

---

## 📝 Système de Rédaction Professionnelle

### Règles de Rédaction McKinsey

1. **Pas d'acronymes sans définition**
   - ❌ "Mettre en place un ICP"
   - ✅ "Définir un Profil Client Idéal (ICP, Ideal Customer Profile)"

2. **Phrases complètes et structurées**
   - ❌ "Setup 3-8k€"
   - ✅ "Le coût de mise en place initial est estimé entre 3 000 € et 8 000 €, selon le niveau de complexité et les fonctionnalités requises."

3. **Justifications chiffrées**
   - ❌ "Augmenter le budget marketing"
   - ✅ "Augmenter le budget marketing de 15% (soit 5 000 € supplémentaires par mois) permettrait de générer 20-30 leads qualifiés supplémentaires, avec un ROI estimé à 3x sur 6 mois."

4. **Plans d'action détaillés**
   - Qui : Responsable de l'action
   - Quoi : Action précise
   - Quand : Timeline
   - Combien : Budget estimé
   - Pourquoi : Justification et impact attendu

5. **Format SCQR (Situation, Complication, Question, Resolution)**
   - Situation : État actuel
   - Complication : Problème identifié
   - Question : Question stratégique
   - Resolution : Recommandation détaillée

### Prompt de Rédaction
```typescript
const PROFESSIONAL_WRITING_PROMPT = `
Vous êtes un consultant senior de McKinsey & Company. Rédigez cette section en respectant les standards suivants :

1. STYLE :
   - Phrases complètes et professionnelles
   - Pas d'acronymes sans définition préalable
   - Ton expert mais accessible
   - Paragraphes structurés (introduction, développement, conclusion)

2. JUSTIFICATIONS :
   - Chaque affirmation doit être sourcée ou justifiée
   - Données chiffrées avec sources
   - Exemples concrets

3. RECOMMANDATIONS :
   - Format : Qui fait quoi, quand, comment, combien
   - Justification de l'impact (ROI, gain de temps, réduction de coûts)
   - Risques et mitigation

4. LONGUEUR :
   - Freemium : 500-800 mots par section
   - Pro : 1000-1500 mots par section
   - Agency : 1500-2000 mots par section
   - Enterprise : 2000-3000 mots par section

5. STRUCTURE SCQR :
   - Situation : Décrivez l'état actuel
   - Complication : Identifiez le problème
   - Question : Posez la question stratégique
   - Resolution : Proposez la solution détaillée
`;
```

---

## 🛡️ Quality Guardian v7.0 - Strict

### Critères de Validation (Score sur 100)

#### 1. Longueur du Rapport (20 points)
- Freemium : 15-25 pages → 20 points si respecté, -5 points par tranche de 5 pages manquantes
- Pro : 35-60 pages → 20 points si respecté
- Agency : 60-100 pages → 20 points si respecté
- Enterprise : 100-200 pages → 20 points si respecté

#### 2. Présence d'Études de Marché (15 points)
- TAM/SAM/SOM présents → 5 points
- Taux de croissance présent → 5 points
- Tendances sectorielles présentes → 5 points

#### 3. Analyse Concurrentielle (15 points)
- 5+ concurrents identifiés → 5 points
- Analyse comparative présente → 5 points
- Matrice de positionnement présente → 5 points

#### 4. Analyse Économique (10 points)
- Forces de Porter présentes → 5 points
- Chaîne de valeur présente → 5 points

#### 5. Qualité de Rédaction (20 points)
- Pas d'acronymes non définis → 5 points
- Phrases complètes → 5 points
- Justifications chiffrées → 5 points
- Plans d'action détaillés → 5 points

#### 6. Sources et Citations (10 points)
- 10+ sources citées → 5 points
- Sources fiables (Statista, IBISWorld, etc.) → 5 points

#### 7. Recommandations Actionnables (10 points)
- Format SCQR respecté → 5 points
- ROI calculé pour chaque recommandation → 5 points

### Seuil de Validation
- **Minimum requis** : 90/100 (au lieu de 70/100)
- **Si score < 90** : Rapport rejeté et régénéré automatiquement

---

## 🔄 Workflow de Génération

### Étape 1 : Initialisation
1. Récupération du brief conversationnel (si disponible)
2. Sélection des agents selon le plan
3. Configuration des modèles IA

### Étape 2 : Phase de Recherche (Nouveaux Agents)
1. **Market Research Agent** : Recherche de marché (Perplexity Pro)
2. **Competitive Intelligence Agent** : Analyse concurrentielle (Perplexity + Scraping)
3. **Economic Analyst Agent** : Analyse économique (Perplexity Pro)
4. **Industry Expert Agent** : Insights sectoriels (Perplexity Labs)
5. **Data Analyst Agent** : Analyse de données (Scraping + Perplexity)

### Étape 3 : Phase d'Analyse (Agents Existants)
1. Technical Analyst
2. SEO Specialist
3. Content Strategist
4. UX Designer
5. Performance Engineer

### Étape 4 : Phase de Synthèse
1. **Strategic Consultant Agent** : Synthèse et recommandations (GPT-5.2-pro + o1-pro)
2. Rédaction professionnelle McKinsey-style
3. Génération des infographies

### Étape 5 : Validation Qualité
1. Quality Guardian v7.0 (score minimum 90/100)
2. Si échec : Régénération automatique avec feedback

### Étape 6 : Finalisation
1. Génération du rapport HTML
2. Génération du PDF
3. Envoi au client

---

## 📊 Estimation de Longueur par Section

### Freemium (15-20 pages)
- Executive Summary : 1 page
- Scores de Performance : 1 page
- Analyse de Surface : 3 pages
- SWOT Basique : 2 pages
- Scénarios Stratégiques : 3 pages
- Plan d'Action : 3 pages
- Sections Premium Verrouillées : 5 pages

### Pro (35-50 pages)
- Executive Summary : 2 pages
- Scores de Performance : 2 pages
- Analyse de Marché : 5 pages
- Analyse Concurrentielle : 8 pages
- Analyse Technique : 5 pages
- Analyse SEO : 5 pages
- Analyse UX : 5 pages
- Recommandations : 10 pages
- Plan d'Action : 5 pages
- Annexes : 3 pages

### Agency (60-80 pages)
- Executive Summary : 3 pages
- Scores de Performance : 2 pages
- Analyse de Marché : 10 pages
- Analyse Concurrentielle : 15 pages
- Analyse Économique : 8 pages
- Insights Sectoriels : 5 pages
- Analyse Technique : 8 pages
- Analyse SEO : 8 pages
- Analyse UX : 8 pages
- Analyse de Performance : 5 pages
- Recommandations Stratégiques : 15 pages
- Roadmap 12-36 mois : 8 pages
- ROI et Business Case : 5 pages
- Annexes : 5 pages

### Enterprise (100-150 pages)
- Executive Summary : 5 pages
- Scores de Performance : 3 pages
- Analyse de Marché Complète : 20 pages
- Analyse Concurrentielle Approfondie : 25 pages
- Analyse Économique et Financière : 15 pages
- Insights Sectoriels et Tendances : 10 pages
- Analyse Technique Complète : 12 pages
- Analyse SEO Avancée : 12 pages
- Analyse UX et Conversion : 12 pages
- Analyse de Performance et KPIs : 10 pages
- Recommandations Stratégiques : 25 pages
- Roadmap de Transformation 12-36 mois : 15 pages
- ROI et Business Case Détaillé : 10 pages
- Benchmark International : 8 pages
- Annexes et Méthodologie : 8 pages

---

## 🚀 Prochaines Étapes

1. Créer les 6 nouveaux agents de recherche
2. Intégrer Perplexity Pro dans chaque agent
3. Implémenter le système de rédaction professionnelle
4. Créer le Quality Guardian v7.0
5. Tester sur les 4 plans
6. Déployer sur GitHub

---

**Version** : 7.0 - Premium McKinsey/BCG  
**Date** : 2026-01-04  
**Statut** : 🚀 En Développement  
**Auteur** : MANUS IA Team
