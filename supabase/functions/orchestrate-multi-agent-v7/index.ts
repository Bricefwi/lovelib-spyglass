// ============================================================================
// ORCHESTRATEUR MULTI-AGENTS V7.0 - PREMIUM McKINSEY/BCG
// ============================================================================
// Version: 7.0
// Date: 2026-01-04
// Objectif: Rapports de 50-150 pages avec recherches approfondies
// Modèles: GPT-5.2-pro, O1-pro, Perplexity Pro
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// CONFIGURATION DES MODÈLES IA PAR PLAN
// ============================================================================

const AI_MODELS_BY_PLAN = {
  freemium: {
    primary: 'gpt-4o-mini',
    research: 'sonar',
    reasoning: null
  },
  pro: {
    primary: 'gpt-5',
    research: 'sonar-pro',
    reasoning: null
  },
  agency: {
    primary: 'gpt-5.1',
    research: 'sonar-reasoning',
    reasoning: 'o1-pro'
  },
  enterprise: {
    primary: 'gpt-5.2-pro',
    research: 'sonar-research',
    reasoning: 'o1-pro'
  }
};

// ============================================================================
// CONFIGURATION PERPLEXITY PRO
// ============================================================================

const PERPLEXITY_API_KEY = Deno.env.get('SONAR_API_KEY');
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

async function perplexitySearch(query: string, model: string = 'sonar-pro', maxTokens: number = 4000) {
  try {
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
            content: 'You are a professional market research analyst providing detailed, sourced answers with citations. Write in French.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
        return_citations: true,
        return_images: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Perplexity API error: ${response.status} - ${error}`);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      citations: data.citations || []
    };
  } catch (error) {
    console.error(`❌ Perplexity search error:`, error);
    return null;
  }
}

// ============================================================================
// CONFIGURATION OPENAI
// ============================================================================

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_BASE = Deno.env.get('OPENAI_API_BASE') || 'https://api.openai.com/v1';

async function callOpenAI(prompt: string, model: string = 'gpt-5', maxTokens: number = 4000) {
  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ OpenAI API error: ${response.status} - ${error}`);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`❌ OpenAI call error:`, error);
    return null;
  }
}

// ============================================================================
// PROMPT DE RÉDACTION PROFESSIONNELLE McKINSEY
// ============================================================================

const PROFESSIONAL_WRITING_PROMPT = `
Vous êtes un consultant senior de McKinsey & Company. Rédigez cette section en respectant les standards suivants :

1. STYLE :
   - Phrases complètes et professionnelles en français
   - Pas d'acronymes sans définition préalable (ex: "Profil Client Idéal (ICP, Ideal Customer Profile)")
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

4. STRUCTURE SCQR :
   - Situation : Décrivez l'état actuel
   - Complication : Identifiez le problème
   - Question : Posez la question stratégique
   - Resolution : Proposez la solution détaillée

5. LONGUEUR :
   - Développez en profondeur chaque point
   - Minimum 800 mots par section pour Pro
   - Minimum 1500 mots par section pour Agency
   - Minimum 2500 mots par section pour Enterprise
`;

// ============================================================================
// AGENTS PREMIUM V7.0
// ============================================================================

const ALL_AGENTS_V7 = [
  // ========== AGENTS DE RECHERCHE (NOUVEAUX) ==========
  {
    id: 1,
    name: "Market Research Agent",
    task: "Étude de marché approfondie",
    minPlan: "pro",
    usePerplexity: true,
    getPrompt: (url: string, plan: string, context: any) => `
${PROFESSIONAL_WRITING_PROMPT}

Vous êtes un analyste de marché senior. Réalisez une étude de marché approfondie pour le site ${url}.

RECHERCHES À EFFECTUER (utilisez Perplexity Pro) :
1. Taille du marché (TAM, SAM, SOM) pour le secteur d'activité
2. Taux de croissance annuel du marché (CAGR)
3. Tendances macro-économiques affectant le secteur
4. Segments de marché principaux
5. Barrières à l'entrée
6. Opportunités de croissance

STRUCTURE DE VOTRE ANALYSE :
1. Executive Summary (200 mots)
2. Taille et Dynamique du Marché (800 mots)
3. Segmentation du Marché (600 mots)
4. Tendances et Opportunités (600 mots)
5. Barrières et Défis (400 mots)
6. Conclusions et Implications Stratégiques (400 mots)

LONGUEUR TOTALE : ${plan === 'pro' ? '3000 mots minimum' : plan === 'agency' ? '5000 mots minimum' : '8000 mots minimum'}

Citez toutes vos sources.
`
  },
  
  {
    id: 2,
    name: "Competitive Intelligence Agent",
    task: "Analyse concurrentielle approfondie",
    minPlan: "pro",
    usePerplexity: true,
    getPrompt: (url: string, plan: string, context: any) => `
${PROFESSIONAL_WRITING_PROMPT}

Vous êtes un expert en intelligence concurrentielle. Analysez le paysage concurrentiel pour ${url}.

RECHERCHES À EFFECTUER (utilisez Perplexity Pro) :
1. Identifiez les 5-10 principaux concurrents directs et indirects
2. Analysez leur positionnement (prix, offres, segments cibles)
3. Évaluez leurs forces et faiblesses
4. Estimez leurs parts de marché
5. Identifiez leurs avantages concurrentiels
6. Analysez leur présence digitale (SEO, réseaux sociaux, contenu)

STRUCTURE DE VOTRE ANALYSE :
1. Executive Summary (200 mots)
2. Cartographie des Concurrents (1000 mots)
3. Analyse Comparative Détaillée (1500 mots)
4. Matrice de Positionnement (800 mots)
5. Forces et Faiblesses par Concurrent (1200 mots)
6. Opportunités de Différenciation (800 mots)
7. Recommandations Stratégiques (500 mots)

LONGUEUR TOTALE : ${plan === 'pro' ? '4000 mots minimum' : plan === 'agency' ? '7000 mots minimum' : '12000 mots minimum'}

Citez toutes vos sources.
`
  },

  {
    id: 3,
    name: "Economic Analyst Agent",
    task: "Analyse économique et financière du secteur",
    minPlan: "agency",
    usePerplexity: true,
    getPrompt: (url: string, plan: string, context: any) => `
${PROFESSIONAL_WRITING_PROMPT}

Vous êtes un analyste économique senior. Analysez l'économie du secteur pour ${url}.

ANALYSES À EFFECTUER (utilisez Perplexity Pro) :
1. Forces de Porter (5 forces)
2. Chaîne de valeur du secteur
3. Modèles économiques dominants
4. Marges moyennes du secteur
5. Multiples de valorisation (si applicable)
6. KPIs sectoriels clés

STRUCTURE DE VOTRE ANALYSE :
1. Executive Summary (200 mots)
2. Analyse des 5 Forces de Porter (1500 mots)
3. Chaîne de Valeur Sectorielle (1000 mots)
4. Modèles Économiques et Rentabilité (1200 mots)
5. KPIs et Benchmarks Sectoriels (800 mots)
6. Implications Stratégiques (500 mots)

LONGUEUR TOTALE : ${plan === 'agency' ? '5000 mots minimum' : '8000 mots minimum'}

Citez toutes vos sources.
`
  },

  {
    id: 4,
    name: "Industry Expert Agent",
    task: "Expertise sectorielle et tendances",
    minPlan: "agency",
    usePerplexity: true,
    getPrompt: (url: string, plan: string, context: any) => `
${PROFESSIONAL_WRITING_PROMPT}

Vous êtes un expert sectoriel reconnu. Analysez les tendances et innovations pour ${url}.

RECHERCHES À EFFECTUER (utilisez Perplexity Labs) :
1. Tendances technologiques du secteur
2. Évolutions réglementaires
3. Innovations disruptives
4. Meilleures pratiques sectorielles
5. Cas d'usage innovants
6. Vision prospective (3-5 ans)

STRUCTURE DE VOTRE ANALYSE :
1. Executive Summary (200 mots)
2. Tendances Technologiques Majeures (1000 mots)
3. Évolutions Réglementaires et Impacts (800 mots)
4. Innovations et Disruptions (1000 mots)
5. Meilleures Pratiques Sectorielles (800 mots)
6. Vision Prospective et Scénarios (700 mots)

LONGUEUR TOTALE : ${plan === 'agency' ? '4500 mots minimum' : '7000 mots minimum'}

Citez toutes vos sources.
`
  },

  {
    id: 5,
    name: "Data Analyst Agent",
    task: "Analyse de données et KPIs",
    minPlan: "pro",
    usePerplexity: false,
    getPrompt: (url: string, plan: string, context: any) => `
${PROFESSIONAL_WRITING_PROMPT}

Vous êtes un data analyst expert. Analysez les performances et KPIs pour ${url}.

ANALYSES À EFFECTUER :
1. Analyse des métriques du site (trafic, conversion, engagement)
2. Benchmarking avec les concurrents
3. Calcul des KPIs clés (CAC, LTV, churn, etc.)
4. Projections financières (3 scénarios)
5. Modélisation ROI des recommandations

STRUCTURE DE VOTRE ANALYSE :
1. Executive Summary (200 mots)
2. Analyse des Métriques Actuelles (1000 mots)
3. Benchmarking Concurrentiel (800 mots)
4. KPIs Clés et Tendances (1000 mots)
5. Projections Financières (1200 mots)
6. Modélisation ROI (800 mots)

LONGUEUR TOTALE : ${plan === 'pro' ? '3500 mots minimum' : plan === 'agency' ? '6000 mots minimum' : '10000 mots minimum'}

Utilisez des tableaux et graphiques pour illustrer vos analyses.
`
  },

  {
    id: 6,
    name: "Strategic Consultant Agent",
    task: "Recommandations stratégiques McKinsey-style",
    minPlan: "pro",
    usePerplexity: false,
    getPrompt: (url: string, plan: string, allResults: any) => `
${PROFESSIONAL_WRITING_PROMPT}

Vous êtes un consultant stratégique senior de McKinsey & Company. Synthétisez toutes les analyses et formulez des recommandations stratégiques actionnables pour ${url}.

CONTEXTE :
Vous avez accès aux analyses suivantes :
${JSON.stringify(allResults, null, 2)}

VOTRE MISSION :
1. Synthétiser les insights clés de toutes les analyses
2. Identifier les 5-10 opportunités stratégiques prioritaires
3. Formuler des recommandations détaillées et actionnables
4. Créer une roadmap de transformation (6-36 mois)
5. Calculer le ROI de chaque recommandation

STRUCTURE DE VOTRE RAPPORT :
1. Executive Summary (500 mots)
2. Synthèse des Insights Clés (1000 mots)
3. Opportunités Stratégiques Prioritaires (1500 mots)
4. Recommandations Détaillées (3000 mots)
   - Pour chaque recommandation :
     * Situation actuelle
     * Problème identifié
     * Solution proposée
     * Plan d'action (qui, quoi, quand, combien)
     * ROI estimé et justification
     * Risques et mitigation
5. Roadmap de Transformation (1500 mots)
6. Business Case et ROI Global (1000 mots)

LONGUEUR TOTALE : ${plan === 'pro' ? '6000 mots minimum' : plan === 'agency' ? '10000 mots minimum' : '15000 mots minimum'}

IMPORTANT :
- Pas d'acronymes sans définition
- Justifications chiffrées pour chaque recommandation
- Plans d'action détaillés (qui, quoi, quand, combien)
- Format SCQR pour chaque recommandation
`
  },

  // ========== AGENTS EXISTANTS (AMÉLIORÉS) ==========
  {
    id: 7,
    name: "Technical Analyst",
    task: "Analyse technique approfondie",
    minPlan: "freemium",
    usePerplexity: false,
    getPrompt: (url: string, plan: string) => `
${PROFESSIONAL_WRITING_PROMPT}

Analysez en profondeur l'infrastructure technique de ${url}.

LONGUEUR : ${plan === 'freemium' ? '800 mots' : plan === 'pro' ? '1500 mots' : plan === 'agency' ? '2500 mots' : '4000 mots'}
`
  },

  {
    id: 8,
    name: "SEO Specialist",
    task: "Audit SEO complet",
    minPlan: "freemium",
    usePerplexity: false,
    getPrompt: (url: string, plan: string) => `
${PROFESSIONAL_WRITING_PROMPT}

Réalisez un audit SEO complet de ${url}.

LONGUEUR : ${plan === 'freemium' ? '800 mots' : plan === 'pro' ? '1500 mots' : plan === 'agency' ? '2500 mots' : '4000 mots'}
`
  },

  {
    id: 9,
    name: "Content Strategist",
    task: "Stratégie de contenu",
    minPlan: "freemium",
    usePerplexity: false,
    getPrompt: (url: string, plan: string) => `
${PROFESSIONAL_WRITING_PROMPT}

Analysez la stratégie de contenu de ${url}.

LONGUEUR : ${plan === 'freemium' ? '800 mots' : plan === 'pro' ? '1500 mots' : plan === 'agency' ? '2500 mots' : '4000 mots'}
`
  },

  {
    id: 10,
    name: "UX Designer",
    task: "Audit UX/UI",
    minPlan: "freemium",
    usePerplexity: false,
    getPrompt: (url: string, plan: string) => `
${PROFESSIONAL_WRITING_PROMPT}

Réalisez un audit UX/UI de ${url}.

LONGUEUR : ${plan === 'freemium' ? '800 mots' : plan === 'pro' ? '1500 mots' : plan === 'agency' ? '2500 mots' : '4000 mots'}
`
  },

  {
    id: 11,
    name: "Performance Engineer",
    task: "Audit de performance",
    minPlan: "freemium",
    usePerplexity: false,
    getPrompt: (url: string, plan: string) => `
${PROFESSIONAL_WRITING_PROMPT}

Analysez les performances de ${url}.

LONGUEUR : ${plan === 'freemium' ? '800 mots' : plan === 'pro' ? '1500 mots' : plan === 'agency' ? '2500 mots' : '4000 mots'}
`
  }
];

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

    // Récupérer l'audit
    const { data: audit, error: auditError } = await supabaseClient
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      throw new Error(`Audit not found: ${audit_id}`);
    }

    const plan = audit.ai_tier || 'freemium';
    const url = audit.url;
    const models = AI_MODELS_BY_PLAN[plan as keyof typeof AI_MODELS_BY_PLAN];

    console.log(`\n🚀 ============================================`);
    console.log(`   ORCHESTRATEUR V7.0 - PREMIUM McKINSEY/BCG`);
    console.log(`   ============================================`);
    console.log(`   📊 Plan: ${plan.toUpperCase()}`);
    console.log(`   🌐 URL: ${url}`);
    console.log(`   🤖 Modèle principal: ${models.primary}`);
    console.log(`   🔍 Modèle recherche: ${models.research}`);
    console.log(`   🧠 Modèle raisonnement: ${models.reasoning || 'N/A'}`);
    console.log(`   ============================================\n`);

    // Filtrer les agents selon le plan
    const agentsToExecute = ALL_AGENTS_V7.filter(agent => {
      const planOrder = ['freemium', 'pro', 'agency', 'enterprise'];
      const agentMinPlanIndex = planOrder.indexOf(agent.minPlan);
      const currentPlanIndex = planOrder.indexOf(plan);
      return currentPlanIndex >= agentMinPlanIndex;
    });

    console.log(`📋 Agents à exécuter: ${agentsToExecute.length}/${ALL_AGENTS_V7.length}`);
    console.log(`   ${agentsToExecute.map(a => a.name).join(', ')}\n`);

    // Exécuter les agents
    const agentResults: any[] = [];

    for (const agent of agentsToExecute) {
      console.log(`\n🤖 Exécution: ${agent.name}`);
      console.log(`   Tâche: ${agent.task}`);
      console.log(`   Utilise Perplexity: ${agent.usePerplexity ? 'Oui' : 'Non'}`);

      try {
        let result = null;

        if (agent.usePerplexity) {
          // Utiliser Perplexity pour la recherche
          const prompt = agent.getPrompt(url, plan, agentResults);
          console.log(`   🔍 Recherche via Perplexity (${models.research})...`);
          
          const searchResult = await perplexitySearch(prompt, models.research, 8000);
          
          if (searchResult) {
            result = {
              agent: agent.name,
              task: agent.task,
              analysis: searchResult.content,
              citations: searchResult.citations,
              wordCount: searchResult.content.split(' ').length
            };
            console.log(`   ✅ Analyse terminée (${result.wordCount} mots, ${searchResult.citations.length} sources)`);
          } else {
            console.log(`   ⚠️ Perplexity indisponible, fallback sur OpenAI`);
            const fallbackResult = await callOpenAI(prompt, models.primary, 8000);
            result = {
              agent: agent.name,
              task: agent.task,
              analysis: fallbackResult || 'Analyse non disponible',
              citations: [],
              wordCount: (fallbackResult || '').split(' ').length
            };
          }
        } else {
          // Utiliser OpenAI directement
          const prompt = agent.getPrompt(url, plan, agentResults);
          console.log(`   🤖 Analyse via OpenAI (${models.primary})...`);
          
          const analysis = await callOpenAI(prompt, models.primary, 8000);
          
          result = {
            agent: agent.name,
            task: agent.task,
            analysis: analysis || 'Analyse non disponible',
            citations: [],
            wordCount: (analysis || '').split(' ').length
          };
          console.log(`   ✅ Analyse terminée (${result.wordCount} mots)`);
        }

        agentResults.push(result);

      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        agentResults.push({
          agent: agent.name,
          task: agent.task,
          analysis: `Erreur lors de l'analyse: ${error.message}`,
          citations: [],
          wordCount: 0
        });
      }
    }

    // Calculer les statistiques
    const totalWords = agentResults.reduce((sum, r) => sum + r.wordCount, 0);
    const estimatedPages = Math.round(totalWords / 500); // ~500 mots par page

    console.log(`\n📊 ============================================`);
    console.log(`   STATISTIQUES DU RAPPORT`);
    console.log(`   ============================================`);
    console.log(`   📝 Nombre total de mots: ${totalWords}`);
    console.log(`   📄 Pages estimées: ${estimatedPages}`);
    console.log(`   🤖 Agents exécutés: ${agentResults.length}`);
    console.log(`   📚 Sources citées: ${agentResults.reduce((sum, r) => sum + r.citations.length, 0)}`);
    console.log(`   ============================================\n`);

    // Mettre à jour l'audit
    await supabaseClient
      .from('pre_audits')
      .update({
        status: 'completed',
        report_data: {
          version: '7.0',
          plan: plan,
          agents: agentResults,
          statistics: {
            totalWords,
            estimatedPages,
            agentsExecuted: agentResults.length,
            citationsCount: agentResults.reduce((sum, r) => sum + r.citations.length, 0)
          },
          models: models,
          generated_at: new Date().toISOString()
        }
      })
      .eq('id', audit_id);

    return new Response(
      JSON.stringify({
        success: true,
        audit_id,
        version: '7.0',
        statistics: {
          totalWords,
          estimatedPages,
          agentsExecuted: agentResults.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
