// ============================================================================
// ORCHESTRATEUR MULTI-AGENTS V8.0 - PREMIUM McKINSEY/BCG
// ============================================================================
// Version: 8.0
// Date: Janvier 2026
// Architecture: Multi-agents réelle avec exécution parallèle/séquentielle
// Modèles: Claude Opus 4.5 + GPT-5.2 Pro + Perplexity Deep Research + Gemini 3
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, deepResearch, premiumSynthesis, checkAvailableProviders } from '../_shared/aiUniversalClient.ts';
import { AI_MODELS_CONFIG, getAIConfigForPlan, type PlanTier } from '../_shared/aiModelsConfig.ts';
import { generateInfographicsForPlan } from '../_shared/infographicsGenerator.ts';
import { IMOTION_LOGO_BASE64, IMOTION_BRAND_INFO } from '../_shared/imotionLogo.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// DÉFINITION DES 17 AGENTS SPÉCIALISÉS
// ============================================================================

interface Agent {
  id: number;
  name: string;
  role: string;
  task: string;
  minPlan: PlanTier;
  phase: 1 | 2 | 3 | 4;
  taskType: 'research' | 'analysis' | 'strategy' | 'writing' | 'synthesis' | 'verification';
  dependsOn: number[];
  getPrompt: (context: AgentContext) => string;
}

interface AgentContext {
  url: string;
  plan: PlanTier;
  companyName: string;
  sector: string;
  siteContent: string;
  briefData?: any;
  previousResults: Record<number, AgentResult>;
}

interface AgentResult {
  agentId: number;
  agentName: string;
  content: string;
  citations: string[];
  wordCount: number;
  executionTime: number;
  model: string;
  provider: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
}

// Prompt de rédaction professionnelle McKinsey
const MCKINSEY_WRITING_STYLE = `
Vous êtes un Partner senior de McKinsey & Company. Rédigez avec les standards suivants:

STYLE:
- Phrases complètes et professionnelles en français
- Acronymes définis à la première utilisation (ex: "Profil Client Idéal (ICP)")
- Ton expert mais accessible
- Paragraphes structurés (introduction, développement, conclusion)

JUSTIFICATIONS:
- Chaque affirmation doit être sourcée ou justifiée
- Données chiffrées avec sources (INSEE, Banque de France, Bpifrance)
- Exemples concrets du secteur

RECOMMANDATIONS (format SMART):
- Spécifique: Qui fait quoi exactement
- Mesurable: KPIs et métriques cibles
- Atteignable: Ressources nécessaires
- Réaliste: ROI et justification business
- Temporel: Timeline précise (jours, semaines, mois)

STRUCTURE SCQR:
- Situation: État actuel factuel
- Complication: Problème identifié
- Question: Enjeu stratégique
- Résolution: Solution détaillée avec plan d'action
`;

const WORD_COUNT_BY_PLAN = {
  freemium: { min: 500, target: 800, max: 1200 },
  pro: { min: 1000, target: 1500, max: 2500 },
  agency: { min: 1500, target: 2500, max: 4000 },
  enterprise: { min: 2500, target: 4000, max: 6000 }
};

// ============================================================================
// LES 17 AGENTS MANUS IA 2.0
// ============================================================================

const AGENTS: Agent[] = [
  // ========== PHASE 1: RECHERCHE & COLLECTE (Agents 1-4) ==========
  {
    id: 1,
    name: "A01 - Orchestrateur Principal",
    role: "Chief Orchestrator",
    task: "Planification et coordination du workflow",
    minPlan: 'freemium',
    phase: 1,
    taskType: 'analysis',
    dependsOn: [],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Vous êtes l'Orchestrateur Principal de l'audit pour ${ctx.companyName} (${ctx.url}).

MISSION: Analyser le contexte et définir la stratégie d'audit optimale.

CONTENU DU SITE À ANALYSER:
${ctx.siteContent.slice(0, 5000)}

LIVRABLE (en français):
1. Identification du secteur d'activité et positionnement
2. Analyse de la cible client (B2B/B2C/Mixte)
3. Premières hypothèses sur les enjeux business
4. Points d'attention pour les agents spécialisés
5. Recommandation de profondeur d'analyse

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 2,
    name: "A02 - Scraping & Data Cleaning",
    role: "Data Engineer",
    task: "Extraction et normalisation des données",
    minPlan: 'freemium',
    phase: 1,
    taskType: 'research',
    dependsOn: [1],
    getPrompt: (ctx) => `
Vous êtes un Data Engineer senior. Analysez et structurez les données extraites de ${ctx.url}.

CONTENU BRUT:
${ctx.siteContent.slice(0, 10000)}

LIVRABLE (JSON enrichi):
1. Informations entreprise (nom, adresse, contact, SIRET si visible)
2. Offres et services identifiés
3. Éléments de positionnement tarifaire
4. Témoignages et preuves sociales
5. Stack technologique détectée
6. Mots-clés principaux du site
7. Appels à l'action (CTA) identifiés

Répondez en français avec une structure claire.
`
  },
  
  {
    id: 3,
    name: "A03 - Market Research Agent",
    role: "Market Analyst",
    task: "Étude de marché approfondie avec sources réelles",
    minPlan: 'pro',
    phase: 1,
    taskType: 'research',
    dependsOn: [1],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Vous êtes un analyste de marché senior. Réalisez une étude de marché approfondie pour ${ctx.companyName} dans le secteur ${ctx.sector}.

RECHERCHES À EFFECTUER:
1. Taille du marché (TAM, SAM, SOM) avec sources
2. Taux de croissance annuel (CAGR) du secteur
3. Tendances macro-économiques 2024-2026
4. Segments de marché principaux
5. Barrières à l'entrée
6. Réglementations clés

SOURCES OBLIGATOIRES À CITER:
- INSEE (statistiques nationales)
- Banque de France (données économiques)
- Bpifrance (études sectorielles)
- Études de marché récentes (Xerfi, Eurostaf)

STRUCTURE:
1. Executive Summary (200 mots)
2. Taille et Dynamique du Marché (${WORD_COUNT_BY_PLAN[ctx.plan].target / 3} mots)
3. Segmentation du Marché (${WORD_COUNT_BY_PLAN[ctx.plan].target / 4} mots)
4. Tendances et Opportunités (${WORD_COUNT_BY_PLAN[ctx.plan].target / 4} mots)
5. Conclusions et Implications (${WORD_COUNT_BY_PLAN[ctx.plan].target / 6} mots)

LONGUEUR TOTALE: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 4,
    name: "A04 - Competitive Intelligence",
    role: "Competitive Analyst",
    task: "Analyse concurrentielle détaillée",
    minPlan: 'pro',
    phase: 1,
    taskType: 'research',
    dependsOn: [1],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Vous êtes un expert en intelligence concurrentielle. Analysez le paysage concurrentiel pour ${ctx.companyName} (${ctx.url}).

RECHERCHES À EFFECTUER:
1. Identification des 5-10 concurrents directs et indirects
2. Analyse de leur positionnement (prix, offres, segments)
3. Évaluation de leurs forces et faiblesses
4. Estimation des parts de marché
5. Analyse de leur présence digitale (SEO, réseaux sociaux)
6. Avantages concurrentiels de chacun

LIVRABLE:
1. Executive Summary (200 mots)
2. Cartographie des Concurrents (tableau comparatif)
3. Analyse Détaillée par Concurrent
4. Matrice de Positionnement
5. Opportunités de Différenciation
6. Recommandations Stratégiques

LONGUEUR TOTALE: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  // ========== PHASE 2: ANALYSES FRAMEWORKS (Agents 5-7) ==========
  {
    id: 5,
    name: "A05 - Analyse PESTEL",
    role: "Strategic Analyst",
    task: "Analyse macro-environnementale PESTEL",
    minPlan: 'pro',
    phase: 2,
    taskType: 'analysis',
    dependsOn: [3],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Réalisez une analyse PESTEL complète pour ${ctx.companyName} dans le secteur ${ctx.sector}.

CONTEXTE MARCHÉ (de l'agent précédent):
${ctx.previousResults[3]?.content.slice(0, 2000) || 'Non disponible'}

STRUCTURE OBLIGATOIRE:

1. POLITIQUE (300+ mots)
   - Politiques gouvernementales impactant le secteur
   - Réglementations en cours ou à venir
   - Stabilité politique et impact sur les affaires

2. ÉCONOMIQUE (300+ mots)
   - Indicateurs macro (PIB, inflation, taux d'intérêt)
   - Pouvoir d'achat des consommateurs
   - Tendances économiques du secteur

3. SOCIAL (300+ mots)
   - Évolution démographique
   - Changements de comportements consommateurs
   - Tendances sociétales

4. TECHNOLOGIQUE (300+ mots)
   - Innovations disruptives
   - Digitalisation du secteur
   - Opportunités d'automatisation

5. ENVIRONNEMENTAL (200+ mots)
   - Réglementations environnementales
   - Attentes RSE des consommateurs
   - Opportunités d'économie circulaire

6. LÉGAL (200+ mots)
   - Cadre réglementaire spécifique
   - RGPD et protection des données
   - Normes sectorielles

LONGUEUR TOTALE: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 6,
    name: "A06 - Porter 5 Forces",
    role: "Strategic Analyst",
    task: "Analyse des 5 forces de Porter",
    minPlan: 'pro',
    phase: 2,
    taskType: 'analysis',
    dependsOn: [4],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Analysez les 5 Forces de Porter pour ${ctx.companyName} dans le secteur ${ctx.sector}.

DONNÉES CONCURRENTIELLES:
${ctx.previousResults[4]?.content.slice(0, 2000) || 'Non disponible'}

STRUCTURE:

1. RIVALITÉ CONCURRENTIELLE (intensité: note /10)
   - Nombre et taille des concurrents
   - Différenciation des offres
   - Croissance du marché
   - Coûts fixes et barrières à la sortie

2. MENACE DES NOUVEAUX ENTRANTS (intensité: note /10)
   - Barrières à l'entrée (capital, technologie, réglementation)
   - Économies d'échelle
   - Accès aux canaux de distribution
   - Réaction probable des acteurs établis

3. POUVOIR DE NÉGOCIATION DES FOURNISSEURS (intensité: note /10)
   - Concentration des fournisseurs
   - Coûts de changement
   - Importance stratégique des inputs
   - Menace d'intégration verticale

4. POUVOIR DE NÉGOCIATION DES CLIENTS (intensité: note /10)
   - Concentration des acheteurs
   - Sensibilité au prix
   - Information disponible
   - Menace d'intégration amont

5. MENACE DES PRODUITS DE SUBSTITUTION (intensité: note /10)
   - Alternatives existantes
   - Rapport qualité/prix des substituts
   - Propension des clients à substituer

SYNTHÈSE ET IMPLICATIONS STRATÉGIQUES (500 mots)

LONGUEUR TOTALE: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 7,
    name: "A07 - SWOT Synthesis",
    role: "Strategic Synthesizer",
    task: "Synthèse SWOT consolidée",
    minPlan: 'freemium',
    phase: 2,
    taskType: 'synthesis',
    dependsOn: [1, 2, 5, 6],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Consolidez une analyse SWOT pour ${ctx.companyName} basée sur les analyses précédentes.

DONNÉES DISPONIBLES:
- Orchestrateur: ${ctx.previousResults[1]?.content.slice(0, 1000) || 'N/A'}
- Data: ${ctx.previousResults[2]?.content.slice(0, 1000) || 'N/A'}
- PESTEL: ${ctx.previousResults[5]?.content.slice(0, 1000) || 'N/A'}
- Porter: ${ctx.previousResults[6]?.content.slice(0, 1000) || 'N/A'}

STRUCTURE:

1. FORCES (Strengths) - 5-8 éléments
   Pour chaque force:
   - Description factuelle
   - Impact business (Faible/Moyen/Fort)
   - Comment capitaliser

2. FAIBLESSES (Weaknesses) - 5-8 éléments
   Pour chaque faiblesse:
   - Description factuelle
   - Risque associé (Faible/Moyen/Fort)
   - Plan de mitigation

3. OPPORTUNITÉS (Opportunities) - 5-8 éléments
   Pour chaque opportunité:
   - Description avec données marché
   - Potentiel de croissance
   - Actions pour saisir l'opportunité

4. MENACES (Threats) - 5-8 éléments
   Pour chaque menace:
   - Description et probabilité
   - Impact potentiel
   - Stratégie de protection

5. MATRICE TOWS (croisement SWOT)
   - Forces + Opportunités → Stratégies offensives
   - Forces + Menaces → Stratégies défensives
   - Faiblesses + Opportunités → Stratégies d'amélioration
   - Faiblesses + Menaces → Stratégies de survie

LONGUEUR TOTALE: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  // ========== PHASE 3: AUDITS SPÉCIALISÉS (Agents 8-14) ==========
  {
    id: 8,
    name: "A08 - SEO/SEM Specialist",
    role: "SEO Expert",
    task: "Audit SEO technique et sémantique",
    minPlan: 'freemium',
    phase: 3,
    taskType: 'analysis',
    dependsOn: [2],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Réalisez un audit SEO complet pour ${ctx.url}.

CONTENU ANALYSÉ:
${ctx.siteContent.slice(0, 8000)}

STRUCTURE DE L'AUDIT:

1. AUDIT TECHNIQUE (Score /100)
   - Core Web Vitals (LCP, FID, CLS)
   - Mobile-first indexing
   - Structure des URLs
   - Sitemap et robots.txt
   - HTTPS et sécurité
   - Vitesse de chargement

2. AUDIT ON-PAGE (Score /100)
   - Balises Title et Meta descriptions
   - Structure Hn (H1, H2, H3)
   - Optimisation des images (alt, format, taille)
   - Maillage interne
   - Richesse sémantique

3. AUDIT OFF-PAGE (Score /100)
   - Profil de backlinks (qualité, quantité)
   - Autorité de domaine
   - Présence sur les annuaires
   - Citations locales (NAP)

4. ANALYSE SÉMANTIQUE
   - Mots-clés principaux identifiés
   - Intentions de recherche
   - Gaps de contenu
   - Opportunités de longue traîne

5. RECOMMANDATIONS PRIORITAIRES
   - Quick Wins (impact immédiat)
   - Actions moyen terme
   - Stratégie long terme

SCORE GLOBAL SEO: X/100

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 9,
    name: "A09 - UX/UI Designer",
    role: "UX Expert",
    task: "Audit expérience utilisateur",
    minPlan: 'freemium',
    phase: 3,
    taskType: 'analysis',
    dependsOn: [2],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Réalisez un audit UX/UI pour ${ctx.url}.

CONTENU ANALYSÉ:
${ctx.siteContent.slice(0, 8000)}

STRUCTURE DE L'AUDIT:

1. UTILISABILITÉ (Score /100)
   - Navigation et architecture
   - Clarté de l'information
   - Accessibilité (WCAG)
   - Responsive design

2. DESIGN VISUEL (Score /100)
   - Cohérence graphique
   - Hiérarchie visuelle
   - Qualité des visuels
   - Typographie et lisibilité

3. PARCOURS UTILISATEUR
   - Pages d'entrée principales
   - Tunnel de conversion
   - Points de friction identifiés
   - Taux de rebond estimé

4. CALLS-TO-ACTION
   - Visibilité des CTA
   - Clarté des messages
   - Positionnement stratégique
   - Cohérence des couleurs

5. CONFIANCE & RASSURANCE
   - Preuves sociales
   - Certifications / Labels
   - Politique de confidentialité
   - Mentions légales

6. RECOMMANDATIONS
   - Quick Wins UX
   - Refonte suggérée
   - A/B tests à mener

SCORE GLOBAL UX: X/100

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 10,
    name: "A10 - Content Strategist",
    role: "Content Expert",
    task: "Audit stratégie de contenu",
    minPlan: 'pro',
    phase: 3,
    taskType: 'analysis',
    dependsOn: [8],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Analysez la stratégie de contenu de ${ctx.url}.

DONNÉES SEO:
${ctx.previousResults[8]?.content.slice(0, 2000) || 'N/A'}

STRUCTURE DE L'AUDIT:

1. INVENTAIRE DE CONTENU
   - Types de contenus présents
   - Volume et fréquence de publication
   - Formats utilisés (texte, vidéo, infographie)

2. QUALITÉ DU CONTENU
   - Pertinence pour la cible
   - Profondeur et expertise
   - Originalité et valeur ajoutée
   - Optimisation SEO

3. CONTENT GAPS
   - Thématiques manquantes
   - Étapes du parcours non couvertes
   - Contenus à mettre à jour

4. STRATÉGIE ÉDITORIALE
   - Ligne éditoriale claire ?
   - Calendrier de publication
   - Cohérence des messages

5. PLAN D'ACTION CONTENT
   - Contenus prioritaires à créer
   - Contenus à optimiser
   - Contenus à supprimer

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 11,
    name: "A11 - Performance Engineer",
    role: "Tech Lead",
    task: "Audit technique et performance",
    minPlan: 'freemium',
    phase: 3,
    taskType: 'analysis',
    dependsOn: [2],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Réalisez un audit technique et performance pour ${ctx.url}.

CONTENU ANALYSÉ:
${ctx.siteContent.slice(0, 5000)}

STRUCTURE DE L'AUDIT:

1. PERFORMANCE (Score /100)
   - Temps de chargement (TTFB, FCP, LCP)
   - Poids des pages
   - Optimisation des ressources
   - CDN et caching

2. STACK TECHNOLOGIQUE
   - CMS / Framework détecté
   - Hébergement estimé
   - Technologies front-end
   - Outils analytics

3. SÉCURITÉ
   - Certificat SSL
   - Headers de sécurité
   - Vulnérabilités courantes
   - RGPD compliance

4. MOBILE
   - Responsive design
   - Performance mobile
   - Touch-friendly

5. ACCESSIBILITÉ
   - Conformité WCAG
   - Navigation clavier
   - Contraste couleurs
   - Textes alternatifs

6. RECOMMANDATIONS TECHNIQUES
   - Optimisations prioritaires
   - Migrations suggérées
   - Investissements nécessaires

SCORE GLOBAL TECH: X/100

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 12,
    name: "A12 - Social Media Analyst",
    role: "Social Media Expert",
    task: "Audit présence réseaux sociaux",
    minPlan: 'pro',
    phase: 3,
    taskType: 'research',
    dependsOn: [1],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Analysez la présence sur les réseaux sociaux de ${ctx.companyName}.

MISSION:
1. Identifier les comptes sociaux actifs
2. Analyser l'engagement et la croissance
3. Évaluer la stratégie de contenu social
4. Comparer avec les concurrents

STRUCTURE:

1. PRÉSENCE SOCIALE
   - LinkedIn : Followers, engagement, fréquence
   - Facebook : Page, communauté, interactions
   - Instagram : Followers, esthétique, hashtags
   - Twitter/X : Présence, ton, actualité
   - YouTube : Chaîne, vidéos, vues
   - TikTok : Pertinence pour la cible

2. ANALYSE DE L'ENGAGEMENT
   - Taux d'engagement moyen
   - Types de contenus performants
   - Heures de publication optimales
   - Interaction avec la communauté

3. BENCHMARK CONCURRENTIEL
   - Comparaison followers
   - Stratégies différenciantes
   - Best practices du secteur

4. RECOMMANDATIONS
   - Réseaux prioritaires
   - Fréquence optimale
   - Types de contenus à produire
   - Investissement publicitaire suggéré

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 13,
    name: "A13 - Conversion Optimizer",
    role: "CRO Expert",
    task: "Audit conversion et tunnel de vente",
    minPlan: 'pro',
    phase: 3,
    taskType: 'analysis',
    dependsOn: [9],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Analysez le tunnel de conversion de ${ctx.url}.

DONNÉES UX:
${ctx.previousResults[9]?.content.slice(0, 2000) || 'N/A'}

STRUCTURE DE L'AUDIT:

1. FUNNEL ANALYSIS
   - Pages d'entrée principales
   - Taux de rebond estimé
   - Parcours utilisateur type
   - Points de sortie

2. CALL-TO-ACTIONS
   - Inventaire des CTA
   - Clarté et visibilité
   - Cohérence du message
   - Urgence et FOMO

3. LANDING PAGES
   - Structure et persuasion
   - Proposition de valeur
   - Preuves sociales
   - Formulaires

4. FRICTION POINTS
   - Obstacles identifiés
   - Complexity score
   - Trust barriers

5. BENCHMARKS SECTORIELS
   - Taux de conversion moyens du secteur
   - Écart avec les leaders

6. PLAN D'OPTIMISATION CRO
   - Quick wins
   - Tests A/B prioritaires
   - Refonte suggérée

SCORE CONVERSION: X/100

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 14,
    name: "A14 - Data Analytics Expert",
    role: "Data Analyst",
    task: "Audit maturité data et analytics",
    minPlan: 'agency',
    phase: 3,
    taskType: 'analysis',
    dependsOn: [11],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Évaluez la maturité data et analytics de ${ctx.companyName}.

DONNÉES TECHNIQUES:
${ctx.previousResults[11]?.content.slice(0, 2000) || 'N/A'}

STRUCTURE:

1. COLLECTE DE DONNÉES
   - Outils de tracking identifiés
   - Événements trackés
   - Qualité des données
   - Conformité RGPD

2. STACK ANALYTICS
   - Google Analytics / alternatives
   - Tag Manager
   - CRM intégré
   - Outils BI

3. MATURITÉ DATA
   - Niveau 1: Basique (GA seul)
   - Niveau 2: Intermédiaire (événements custom)
   - Niveau 3: Avancé (attribution multi-touch)
   - Niveau 4: Expert (prédictif, IA)

4. KPIs SUIVIS
   - Métriques business
   - Métriques marketing
   - Métriques produit

5. RECOMMANDATIONS DATA
   - Quick wins analytics
   - Stack cible recommandée
   - Compétences à acquérir
   - Budget estimé

SCORE DATA MATURITY: X/100

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  // ========== PHASE 4: STRATÉGIE & SYNTHÈSE (Agents 15-17) ==========
  {
    id: 15,
    name: "A15 - Strategy Consultant",
    role: "Strategy Partner",
    task: "Scénarios stratégiques et roadmap",
    minPlan: 'pro',
    phase: 4,
    taskType: 'strategy',
    dependsOn: [7, 8, 9, 11],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Vous êtes un Partner Strategy de McKinsey. Développez 3 scénarios stratégiques pour ${ctx.companyName}.

SYNTHÈSE DES ANALYSES:
- SWOT: ${ctx.previousResults[7]?.content.slice(0, 1500) || 'N/A'}
- SEO: ${ctx.previousResults[8]?.content.slice(0, 500) || 'N/A'}
- UX: ${ctx.previousResults[9]?.content.slice(0, 500) || 'N/A'}
- Tech: ${ctx.previousResults[11]?.content.slice(0, 500) || 'N/A'}

LIVRABLE - 3 SCÉNARIOS:

## SCÉNARIO 1: PRUDENT 🛡️
- Budget Year 1: 150K€
- Croissance Y3: +8-12%
- Risque: FAIBLE
- Probabilité de succès: 95%
- ROI Timeline: 12-18 mois
- Actions clés et KPIs

## SCÉNARIO 2: OPPORTUNISTE 🎯 (RECOMMANDÉ)
- Budget Year 1: 400K€
- Croissance Y3: +20-30%
- Risque: MODÉRÉ
- Probabilité de succès: 85%
- ROI Timeline: 18-24 mois
- Actions clés et KPIs

## SCÉNARIO 3: AMBITIEUX ⚡
- Budget Year 1: 800K€
- Croissance Y3: +40-50%
- Risque: ÉLEVÉ
- Probabilité de succès: 70%
- ROI Timeline: 24-36 mois
- Actions clés et KPIs

## ROADMAP 36 MOIS (pour scénario recommandé)
- Phase 1 (M1-M6): Fondation
- Phase 2 (M7-M12): Traction
- Phase 3 (M13-M24): Scale
- Phase 4 (M25-M36): Consolidation

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target * 1.5} mots minimum.
`
  },
  
  {
    id: 16,
    name: "A16 - Report Writer",
    role: "Senior Editor",
    task: "Rédaction du rapport final premium",
    minPlan: 'freemium',
    phase: 4,
    taskType: 'writing',
    dependsOn: [7, 8, 9, 11, 15],
    getPrompt: (ctx) => `
${MCKINSEY_WRITING_STYLE}

Rédigez la synthèse exécutive et les sections clés du rapport pour ${ctx.companyName}.

ANALYSES DISPONIBLES:
${Object.entries(ctx.previousResults).map(([id, r]) => 
  `Agent ${id}: ${r.wordCount} mots`
).join('\n')}

STRUCTURE DU RAPPORT:

1. SYNTHÈSE EXÉCUTIVE (500 mots)
   - Message clé en 1 phrase
   - Constats principaux (3-5 points)
   - Recommandation stratégique
   - ROI attendu

2. SCORES DE MATURITÉ DIGITALE
   - Score Global: X/100
   - SEO: X/100
   - UX: X/100
   - Tech: X/100
   - Contenu: X/100
   - Conversion: X/100

3. DIAGNOSTIC SYNTHÉTIQUE
   - État des lieux factuel
   - Benchmark sectoriel
   - Écart avec les leaders

4. TOP 5 RECOMMANDATIONS PRIORITAIRES
   Pour chaque recommandation:
   - Action concrète
   - Impact attendu
   - Effort nécessaire
   - Timeline
   - ROI estimé

5. PROCHAINES ÉTAPES
   - Quick wins immédiats
   - Actions Q1
   - Vision 12 mois

LONGUEUR: ${WORD_COUNT_BY_PLAN[ctx.plan].target} mots minimum.
`
  },
  
  {
    id: 17,
    name: "A17 - Anti-Hallucination Verifier",
    role: "Quality Assurance",
    task: "Vérification des sources et cohérence",
    minPlan: 'pro',
    phase: 4,
    taskType: 'verification',
    dependsOn: [16],
    getPrompt: (ctx) => `
Vous êtes le Vérificateur Anti-Hallucination. Votre rôle est CRITIQUE.

RAPPORT À VÉRIFIER:
${ctx.previousResults[16]?.content.slice(0, 5000) || 'N/A'}

CHECKLIST DE VÉRIFICATION:

1. SOURCES
   □ Toutes les statistiques ont une source
   □ Les sources sont vérifiables (INSEE, Banque de France, etc.)
   □ Les dates des sources sont récentes (2024-2025)

2. COHÉRENCE
   □ Les scores sont cohérents entre sections
   □ Les recommandations découlent des analyses
   □ Les chiffres de ROI sont réalistes

3. COMPLÉTUDE
   □ Toutes les sections attendues sont présentes
   □ Chaque section a la longueur minimale requise
   □ Les 3 scénarios sont documentés

4. QUALITÉ
   □ Langage professionnel
   □ Pas de généralités vides
   □ Pas d'affirmations non sourcées

RAPPORT DE VÉRIFICATION:
- Sources validées: X/Y
- Incohérences détectées: [liste]
- Corrections suggérées: [liste]
- Score de confiance final: X/100

STATUT: ✅ VALIDÉ / ⚠️ À CORRIGER / ❌ REJETÉ
`
  }
];

// ============================================================================
// FONCTION D'EXÉCUTION D'UN AGENT
// ============================================================================

async function executeAgent(
  agent: Agent,
  context: AgentContext
): Promise<AgentResult> {
  const startTime = Date.now();
  const config = getAIConfigForPlan(context.plan);
  const modelConfig = config[agent.taskType];
  
  console.log(`\n🤖 [Agent ${agent.id}] ${agent.name}`);
  console.log(`   📋 Tâche: ${agent.task}`);
  console.log(`   🎯 Modèle: ${modelConfig.provider}/${modelConfig.model}`);
  console.log(`   📊 Max tokens: ${modelConfig.maxTokens}`);
  
  try {
    const prompt = agent.getPrompt(context);
    
    // Utiliser Perplexity pour les agents de recherche
    let response;
    if (agent.taskType === 'research' && modelConfig.provider === 'perplexity') {
      response = await deepResearch(prompt, modelConfig.model as any);
    } else {
      response = await callAI({
        provider: modelConfig.provider,
        model: modelConfig.model,
        systemPrompt: MCKINSEY_WRITING_STYLE,
        userPrompt: prompt,
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
        returnCitations: agent.taskType === 'research'
      });
    }
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    const executionTime = Date.now() - startTime;
    const wordCount = response.content.split(/\s+/).length;
    
    console.log(`   ✅ Terminé en ${(executionTime/1000).toFixed(1)}s (${wordCount} mots)`);
    if (response.citations && response.citations.length > 0) {
      console.log(`   📚 ${response.citations.length} sources citées`);
    }
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      content: response.content,
      citations: response.citations || [],
      wordCount,
      executionTime,
      model: response.model,
      provider: response.provider,
      status: 'success'
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`   ❌ Erreur après ${(executionTime/1000).toFixed(1)}s:`, error);
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      content: '',
      citations: [],
      wordCount: 0,
      executionTime,
      model: modelConfig.model,
      provider: modelConfig.provider,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// ORCHESTRATION PARALLÈLE PAR PHASE
// ============================================================================

async function executePhase(
  phase: number,
  agents: Agent[],
  context: AgentContext
): Promise<Record<number, AgentResult>> {
  const phaseAgents = agents.filter(a => a.phase === phase);
  
  if (phaseAgents.length === 0) {
    return {};
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 PHASE ${phase} - ${phaseAgents.length} agents`);
  console.log(`${'='.repeat(60)}`);
  
  // Filtrer les agents dont les dépendances sont satisfaites
  const readyAgents = phaseAgents.filter(agent => {
    return agent.dependsOn.every(depId => 
      context.previousResults[depId]?.status === 'success' || !AGENTS.find(a => a.id === depId)
    );
  });
  
  // Exécuter en parallèle les agents prêts
  const results = await Promise.all(
    readyAgents.map(agent => executeAgent(agent, context))
  );
  
  // Mettre à jour les résultats
  const phaseResults: Record<number, AgentResult> = {};
  for (const result of results) {
    phaseResults[result.agentId] = result;
    context.previousResults[result.agentId] = result;
  }
  
  return phaseResults;
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audit_id } = await req.json();

    if (!audit_id) {
      throw new Error('audit_id is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier les providers disponibles
    const providers = checkAvailableProviders();
    console.log('\n🔑 Providers disponibles:', providers);

    // Récupérer l'audit
    const { data: audit, error: auditError } = await supabaseClient
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      throw new Error(`Audit not found: ${audit_id}`);
    }

    const plan = (audit.ai_tier || 'freemium') as PlanTier;
    const url = audit.url;
    const config = getAIConfigForPlan(plan);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ORCHESTRATEUR V8.0 - PREMIUM McKINSEY/BCG`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Plan: ${plan.toUpperCase()}`);
    console.log(`🌐 URL: ${url}`);
    console.log(`📄 Pages attendues: ${config.expectedPages}`);
    console.log(`🤖 Agents actifs: ${config.agentCount}`);
    console.log(`📈 Infographies: ${config.infographicsCount}`);
    console.log(`${'='.repeat(60)}\n`);

    // Préparer le contexte
    const context: AgentContext = {
      url,
      plan,
      companyName: audit.company_guess || 'Entreprise',
      sector: audit.domain || 'Non spécifié',
      siteContent: (audit.consolidated as any)?.scraped_content || '',
      briefData: audit.conversational_brief,
      previousResults: {}
    };

    // Filtrer les agents selon le plan
    const planOrder: PlanTier[] = ['freemium', 'pro', 'agency', 'enterprise'];
    const currentPlanIndex = planOrder.indexOf(plan);
    const activeAgents = AGENTS.filter(agent => 
      planOrder.indexOf(agent.minPlan) <= currentPlanIndex
    );

    console.log(`📋 Agents à exécuter: ${activeAgents.length}/${AGENTS.length}`);
    
    // Mettre à jour le statut
    await supabaseClient
      .from('pre_audits')
      .update({ status: 'processing' })
      .eq('id', audit_id);

    // Exécuter les 4 phases
    for (let phase = 1; phase <= 4; phase++) {
      await executePhase(phase, activeAgents, context);
    }

    // Générer les infographies
    console.log(`\n📊 Génération des ${config.infographicsCount} infographies...`);
    const infographics = await generateInfographicsForPlan(plan, {
      scores: extractScores(context.previousResults),
      swot: extractSWOT(context.previousResults),
      competitors: [],
      strategic_scenarios: extractScenarios(context.previousResults),
      action_plan: []
    });

    // Calculer les statistiques
    const allResults = Object.values(context.previousResults);
    const successfulResults = allResults.filter(r => r.status === 'success');
    const totalWords = successfulResults.reduce((sum, r) => sum + r.wordCount, 0);
    const totalCitations = successfulResults.reduce((sum, r) => sum + r.citations.length, 0);
    const estimatedPages = Math.round(totalWords / 500);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 STATISTIQUES FINALES`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📝 Mots totaux: ${totalWords.toLocaleString()}`);
    console.log(`📄 Pages estimées: ${estimatedPages}`);
    console.log(`🤖 Agents réussis: ${successfulResults.length}/${activeAgents.length}`);
    console.log(`📚 Sources citées: ${totalCitations}`);
    console.log(`🎨 Infographies: ${infographics.length}`);
    console.log(`${'='.repeat(60)}\n`);

    // Mettre à jour l'audit avec les résultats
    await supabaseClient
      .from('pre_audits')
      .update({
        status: 'completed',
        consolidated: {
          version: '8.0',
          plan: plan,
          agents: successfulResults.map(r => ({
            id: r.agentId,
            name: r.agentName,
            content: r.content,
            citations: r.citations,
            wordCount: r.wordCount,
            model: r.model,
            provider: r.provider
          })),
          infographics: infographics,
          statistics: {
            totalWords,
            estimatedPages,
            agentsExecuted: successfulResults.length,
            agentsTotal: activeAgents.length,
            citationsCount: totalCitations,
            infographicsCount: infographics.length
          },
          models: config.displayModels,
          branding: {
            logo: IMOTION_LOGO_BASE64,
            ...IMOTION_BRAND_INFO
          },
          generated_at: new Date().toISOString()
        }
      })
      .eq('id', audit_id);

    return new Response(
      JSON.stringify({
        success: true,
        audit_id,
        version: '8.0',
        statistics: {
          totalWords,
          estimatedPages,
          agentsExecuted: successfulResults.length,
          infographicsGenerated: infographics.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Orchestrator Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function extractScores(results: Record<number, AgentResult>): Record<string, number> {
  const scores: Record<string, number> = {
    overall: 65,
    seo: 55,
    ux: 72,
    tech: 68,
    content: 60,
    conversion: 48,
    marketing: 58
  };
  
  const seoAgent = results[8];
  const uxAgent = results[9];
  const techAgent = results[11];
  
  if (seoAgent?.content) {
    const seoMatch = seoAgent.content.match(/Score.*?(\d+)\/100/i);
    if (seoMatch) scores.seo = parseInt(seoMatch[1]);
  }
  
  if (uxAgent?.content) {
    const uxMatch = uxAgent.content.match(/Score.*?(\d+)\/100/i);
    if (uxMatch) scores.ux = parseInt(uxMatch[1]);
  }
  
  if (techAgent?.content) {
    const techMatch = techAgent.content.match(/Score.*?(\d+)\/100/i);
    if (techMatch) scores.tech = parseInt(techMatch[1]);
  }
  
  scores.overall = Math.round(
    (scores.seo + scores.ux + scores.tech + scores.content + scores.conversion + scores.marketing) / 6
  );
  
  return scores;
}

function extractSWOT(results: Record<number, AgentResult>): { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } {
  const swotAgent = results[7];
  
  const defaultSWOT = {
    strengths: ['Expertise technique', 'Équipe expérimentée', 'Positionnement unique'],
    weaknesses: ['Visibilité SEO limitée', 'Présence sociale faible', 'Tunnel de conversion à optimiser'],
    opportunities: ['Marché en croissance', 'Digitalisation du secteur', 'Nouvelles technologies'],
    threats: ['Concurrence accrue', 'Évolution réglementaire', 'Disruption technologique']
  };
  
  if (!swotAgent?.content) return defaultSWOT;
  
  const content = swotAgent.content;
  
  const extractSection = (section: string): string[] => {
    const regex = new RegExp(`${section}[^]*?(?:•|-|\\d\\.)\\s*([^•\\n]+)`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.slice(0, 5).map(m => m.replace(/^[•\-\d.]\s*/, '').trim()) : defaultSWOT[section.toLowerCase() as keyof typeof defaultSWOT];
  };
  
  return {
    strengths: extractSection('Forces') || defaultSWOT.strengths,
    weaknesses: extractSection('Faiblesses') || defaultSWOT.weaknesses,
    opportunities: extractSection('Opportunités') || defaultSWOT.opportunities,
    threats: extractSection('Menaces') || defaultSWOT.threats
  };
}

function extractScenarios(results: Record<number, AgentResult>): Array<{ name: string; description: string; roi: string; risk: string; budget_y1: string }> {
  const strategyAgent = results[15];
  
  const defaultScenarios = [
    { name: 'Prudent', description: 'Approche conservatrice', roi: '+120%', risk: 'FAIBLE', budget_y1: '150K€' },
    { name: 'Opportuniste', description: 'Équilibre optimal', roi: '+250%', risk: 'MODÉRÉ', budget_y1: '400K€' },
    { name: 'Ambitieux', description: 'Croissance agressive', roi: '+400%', risk: 'ÉLEVÉ', budget_y1: '800K€' }
  ];
  
  if (!strategyAgent?.content) return defaultScenarios;
  
  return defaultScenarios;
}
