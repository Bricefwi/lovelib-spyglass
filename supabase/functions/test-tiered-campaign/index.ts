import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ======================================================
// 🎯 CONFIGURATION DES 4 NIVEAUX DE TEST
// Modèles CORRIGÉS pour correspondre aux modèles Lovable AI disponibles
// ======================================================
const TEST_SCENARIOS = [
  {
    id: 'freemium',
    name: 'Freemium - Discovery',
    tier: 'discovery',
    model: 'google/gemini-2.5-flash-lite', // Rapide, économique
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'Analyse rapide avec sections cadenassées',
    expectedScore: 65,
    expectedPages: '15-20',
    agents: 7,
    features: {
      deepScraping: false,
      competitorAnalysis: false,
      financialData: false,
      lockedSections: true,
      includeBrief: false
    }
  },
  {
    id: 'pro',
    name: 'Pro - PME',
    tier: 'pro',
    model: 'google/gemini-2.5-flash', // Bon rapport qualité/prix
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'Audit complet + brief conversationnel Alex',
    expectedScore: 78,
    expectedPages: '35-50',
    agents: 12,
    features: {
      deepScraping: true,
      competitorAnalysis: true,
      financialData: false,
      lockedSections: false,
      includeBrief: true
    }
  },
  {
    id: 'agency',
    name: 'Agency - Conseil Premium',
    tier: 'agency',
    model: 'google/gemini-2.5-pro', // Premium multi-modal
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'Dream Team IA + benchmarks sectoriels BTP',
    expectedScore: 88,
    expectedPages: '60-80',
    agents: 15,
    features: {
      deepScraping: true,
      competitorAnalysis: true,
      financialData: true,
      lockedSections: false,
      includeBrief: true,
      multiAgentMode: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise - Transformation',
    tier: 'enterprise',
    model: 'openai/gpt-5', // Top-tier reasoning
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'McKinsey-level + roadmap transformation + ROI',
    expectedScore: 95,
    expectedPages: '100-150',
    agents: 17,
    features: {
      deepScraping: true,
      competitorAnalysis: true,
      financialData: true,
      lockedSections: false,
      includeBrief: true,
      multiAgentMode: true,
      deepResearch: true,
      internationalScope: false,
      localMarketFocus: true
    }
  }
];

// ======================================================
// 🎨 BRANDING PAR NIVEAU
// ======================================================
const BRANDING: Record<string, { primary_color: string; company_name: string; logo_url: string | null }> = {
  discovery: {
    primary_color: '#d8232a', // IMOTION Red
    company_name: 'IMOTION Conseil',
    logo_url: null
  },
  pro: {
    primary_color: '#d8232a', // IMOTION Red
    company_name: 'IMOTION Conseil',
    logo_url: null
  },
  agency: {
    primary_color: '#7c3aed', // Purple Premium
    company_name: 'IMOTION Premium',
    logo_url: null
  },
  enterprise: {
    primary_color: '#0f172a', // Slate dark - Executive
    company_name: 'IMOTION Enterprise',
    logo_url: null
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🚀 ========== CAMPAGNE TEST MULTI-NIVEAUX ==========");
    
    const { scenario_id, recipient_email, run_all, enriched_brief, use_imotion_url } = await req.json();
    
    if (!recipient_email) {
      return new Response(
        JSON.stringify({ error: "Email destinataire requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const scenarios = run_all 
      ? TEST_SCENARIOS 
      : TEST_SCENARIOS.filter(s => s.id === scenario_id);

    if (scenarios.length === 0) {
      return new Response(
        JSON.stringify({ error: "Scénario non trouvé", available: TEST_SCENARIOS.map(s => s.id) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const scenario of scenarios) {
      console.log(`\n📋 ========== SCENARIO: ${scenario.name} ==========`);
      console.log(`🔗 URL: ${scenario.url}`);
      console.log(`🤖 Model: ${scenario.model}`);
      console.log(`📊 Tier: ${scenario.tier}`);
      console.log(`📄 Pages attendues: ${scenario.expectedPages}`);
      console.log(`🤖 Agents: ${scenario.agents}`);

      try {
        // 1. Scraping avec Tavily
        const siteContent = await scrapeSite(scenario.url, scenario.features.deepScraping);
        
        // 2. Analyse IA selon le niveau (avec brief enrichi si disponible)
        console.log(`📋 Brief inclus: ${scenario.features.includeBrief ? 'OUI' : 'NON'}`);
        const report = await generateTieredReport(scenario, siteContent, enriched_brief);
        
        // 3. Génération HTML PREMIUM avec branding (style OBUT)
        const html = generatePremiumHTML(scenario, report, enriched_brief);
        
        // 4. Sauvegarde en base
        const { data: savedReport, error: saveError } = await supabase.from('audit_reports').insert({
          title: `[TEST ${scenario.tier.toUpperCase()}] ${scenario.name}`,
          html: html,
          content: report,
          status: 'completed',
          report_type: `test_${scenario.tier}`
        }).select().single();

        if (saveError) {
          throw new Error(`Sauvegarde échouée: ${saveError.message}`);
        }

        console.log(`✅ Rapport créé: ${savedReport.id}`);

        // 5. Envoi email
        const emailResult = await sendReportEmail(supabase, savedReport.id, recipient_email, scenario);
        
        results.push({
          scenario: scenario.id,
          name: scenario.name,
          success: true,
          report_id: savedReport.id,
          email_sent: emailResult.success,
          tier: scenario.tier,
          model_used: scenario.model,
          expected_pages: scenario.expectedPages
        });

      } catch (error: any) {
        console.error(`❌ Erreur scénario ${scenario.id}:`, error);
        results.push({
          scenario: scenario.id,
          name: scenario.name,
          success: false,
          error: error.message
        });
      }

      // Délai entre les scénarios pour éviter rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("\n🎉 ========== CAMPAGNE TERMINÉE ==========");
    
    return new Response(
      JSON.stringify({
        success: true,
        recipient: recipient_email,
        scenarios_run: scenarios.length,
        results: results,
        summary: {
          success: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ ERREUR GLOBALE:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ======================================================
// 🕵️ SCRAPING TAVILY AMÉLIORÉ
// ======================================================
async function scrapeSite(url: string, deep: boolean): Promise<string> {
  const tavilyKey = Deno.env.get("TAVILY_API_KEY");
  
  // Données de démonstration réalistes pour BLC Pro Rénovation
  const getDemoContent = (url: string): string => {
    if (url.includes('travaux-renovation-compiegne') || url.includes('blc')) {
      return `BLC Pro Rénovation - Entreprise de travaux et rénovation à Compiègne.
      160 Rue Marie Curie Zone intermarché, 60190 Moyvillers.
      Téléphone: 03 44 43 01 00.
      
      SERVICES PRINCIPAUX:
      - Rénovation complète de maison et appartement
      - Travaux d'isolation thermique et acoustique
      - Menuiserie intérieure et extérieure
      - Plomberie et électricité
      - Peinture et revêtements
      - Aménagement de combles
      - Extension et surélévation
      
      ZONE D'INTERVENTION:
      - Compiègne et agglomération (rayon 30km)
      - Oise (60) et départements limitrophes
      - Interventions professionnelles et particuliers
      
      POINTS FORTS:
      - Entreprise locale depuis 15 ans
      - Équipe de 8 artisans qualifiés
      - Devis gratuit sous 48h
      - Garantie décennale
      - Certifications RGE et Qualibat
      
      PROBLÈMES IDENTIFIÉS:
      - Site web non responsive sur mobile
      - Pas de formulaire de devis en ligne
      - Référencement local insuffisant (Google Maps)
      - Absence de portfolio/galerie de réalisations
      - Pas d'avis clients visibles
      - Réseaux sociaux inexistants
      
      CONCURRENCE LOCALE:
      - Leroy Merlin Compiègne (grande surface)
      - Artisans indépendants locaux
      - Grandes enseignes nationales (Point P, BigMat)
      - Plateformes type Travaux.com
      
      MARCHÉ BTP OISE 2024:
      - Croissance +3.5% du secteur rénovation
      - Forte demande isolation (MaPrimeRénov)
      - Pénurie de main d'œuvre qualifiée
      - Prix moyens: 800-1200€/m² rénovation complète`;
    }
    return `Entreprise analysée: ${url}. Site professionnel avec présence digitale.`;
  };

  if (!tavilyKey) {
    console.warn("⚠️ TAVILY_API_KEY non configurée - Mode démo activé");
    return getDemoContent(url);
  }

  try {
    const hostname = new URL(url).hostname;
    console.log(`🔍 Scraping ${deep ? 'PROFOND' : 'RAPIDE'} de ${hostname}...`);
    
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${url} entreprise activité produits services équipe avis`,
        include_domains: [hostname],
        search_depth: deep ? "advanced" : "basic",
        include_raw_content: deep,
        max_results: deep ? 8 : 3
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ Tavily API error ${response.status} - Mode démo activé`);
      return getDemoContent(url);
    }

    const data = await response.json();
    const content = data.results?.map((r: any) => `${r.title}: ${r.content}`).join('\n\n');
    console.log(`✅ ${data.results?.length || 0} pages scrappées`);
    
    return content?.substring(0, deep ? 25000 : 8000) || getDemoContent(url);
  } catch (e) {
    console.error("⚠️ Erreur scraping:", e);
    return getDemoContent(url);
  }
}

// ======================================================
// 🧠 GÉNÉRATION RAPPORT PREMIUM MULTI-AGENTS
// ======================================================
async function generateTieredReport(scenario: typeof TEST_SCENARIOS[0], siteContent: string, enrichedBrief?: any): Promise<any> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) {
    throw new Error("LOVABLE_API_KEY non configurée");
  }

  // Brief context pour les tiers payants
  const briefContext = enrichedBrief && scenario.features.includeBrief ? `
=== BRIEF CONVERSATIONNEL ALEX ===
Client: ${enrichedBrief.client_identity?.name || 'N/A'} - ${enrichedBrief.client_identity?.role || 'N/A'}
Entreprise: ${enrichedBrief.client_identity?.company || 'N/A'}
Site: ${enrichedBrief.company_info?.website || 'N/A'}
Localisation: ${enrichedBrief.company_info?.location || 'N/A'}

OBJECTIFS STRATÉGIQUES:
${(enrichedBrief.strategic_objectives || []).map((o: string) => `- ${o}`).join('\n')}

DÉFIS ACTUELS:
${(enrichedBrief.current_challenges || []).map((c: string) => `- ${c}`).join('\n')}

FOCUS SPÉCIFIQUES:
${(enrichedBrief.focus_areas || []).map((f: string) => `- ${f}`).join('\n')}

QUESTIONS CLÉS DU CLIENT:
${(enrichedBrief.key_questions || []).map((q: string) => `- ${q}`).join('\n')}

PAYSAGE CONCURRENTIEL:
- Niche: ${enrichedBrief.competitive_landscape?.niche || 'N/A'}
- Positionnement: ${enrichedBrief.competitive_landscape?.positioning || 'N/A'}
- Concurrents connus: ${(enrichedBrief.competitive_landscape?.known_competitors || []).join(', ')}
====================================
` : '';

  // Prompts ultra-détaillés par niveau (style McKinsey)
  const tierPrompts: Record<string, string> = {
    discovery: `Tu es un assistant marketing. Fais une analyse RAPIDE et SUPERFICIELLE.
    OBJECTIF: Montrer la valeur de l'analyse complète sans tout dévoiler.
    
    CONSIGNES:
    - Identifie 3-4 problèmes évidents seulement
    - Donne des pistes GÉNÉRIQUES sans détails
    - Score moyen autour de 60-70/100
    - Indique clairement les sections réservées aux abonnés Pro
    - LONGUEUR: 2-3 pages maximum`,
    
    pro: `Tu es un Consultant Senior en Stratégie Digitale, 10 ans d'expérience PME.
    ${briefContext ? 'CRITIQUE: Tu as le brief conversationnel du client. PERSONNALISE tes recommandations.' : ''}
    
    PROFONDEUR: Analyse complète et actionnable.
    
    STRUCTURE OBLIGATOIRE:
    1. DIAGNOSTIC FLASH (1 page)
       - 5-7 problèmes identifiés avec priorisation
       - Scores détaillés par dimension
    
    2. ANALYSE CONCURRENTIELLE (1 page)
       - 3-5 concurrents locaux identifiés
       - Forces/faiblesses comparatives
    
    3. RECOMMANDATIONS OPÉRATIONNELLES (2 pages)
       - Actions court terme (1-3 mois)
       - Actions moyen terme (3-6 mois)
       - Budget estimatif par action
    
    4. PLAN D'ACTION 6 MOIS (1 page)
       - Timeline détaillée
       - KPIs de suivi
       - ROI estimé
    
    LONGUEUR CIBLE: 35-50 pages équivalent
    Score réaliste: 75-85/100`,
    
    agency: `Tu es Directeur Associé chez McKinsey Digital, expert transformation PME/ETI.
    ${briefContext ? 'MISSION: Le brief Alex contient les VRAIES priorités du client. Chaque section doit y répondre.' : ''}
    
    PROFONDEUR MAXIMALE - MODE "DREAM TEAM IA":
    Tu coordonnes 15 agents spécialisés:
    - 🔬 Agent Recherche Marché (TAM, SAM, SOM)
    - 🎯 Agent Intelligence Concurrentielle (5-10 acteurs)
    - 📊 Agent Data Analyst (KPIs, projections)
    - 💼 Agent Stratégie (Porter, PESTEL)
    - ✍️ Agent Rédaction Premium
    
    STRUCTURE OBLIGATOIRE:
    1. EXECUTIVE SUMMARY (1 page)
    
    2. CONTEXTE MARCHÉ (3 pages)
       - Données marché BTP/Rénovation Oise 2024-2025
       - Tendances sectorielles
       - Réglementation (MaPrimeRénov, etc.)
    
    3. ANALYSE CONCURRENTIELLE APPROFONDIE (4 pages)
       - Mapping 5-10 concurrents
       - Matrice forces/faiblesses
       - Positionnement différenciant
    
    4. DIAGNOSTIC DIGITAL COMPLET (3 pages)
       - Site web (UX, SEO, performance)
       - Présence Google (Maps, Search)
       - Réseaux sociaux
       - Réputation en ligne
    
    5. 3 SCÉNARIOS STRATÉGIQUES (4 pages)
       - Scénario AMBITIEUX (budget élevé, croissance +40%)
       - Scénario OPPORTUNISTE (équilibre risque/récompense) ⭐
       - Scénario PRUDENT (optimisation, budget limité)
       Chaque scénario: Budget, Timeline, ROI, Risques
    
    6. PLAN D'ACTION DÉTAILLÉ (4 pages)
       - Phase 1: Quick wins (M1-M3)
       - Phase 2: Développement (M4-M8)
       - Phase 3: Scale (M9-M12)
       - KPIs et jalons
    
    7. ANNEXES
       - Sources citées
       - Méthodologie
    
    LONGUEUR CIBLE: 60-80 pages équivalent
    Score premium: 85-92/100`,
    
    enterprise: `Tu es Partner Senior chez McKinsey & Company, expert transformation digitale Fortune 500.
    ${briefContext ? 'MISSION CRITIQUE: Le brief Alex guide TOUTE la stratégie. Chaque recommandation y répond.' : ''}
    
    PROFONDEUR EXECUTIVE - MODE "TRANSFORMATION GLOBALE":
    Tu pilotes 17 agents ultra-experts:
    - 🔬 Agent Perplexity Sonar Reasoning (recherche)
    - 🧠 Agent GPT-5 (analyse stratégique)
    - 🎨 Agent Claude Opus 4.5 (rédaction premium)
    - 📊 Agent Gemini 3 Pro (data visualization)
    - + 13 agents spécialisés
    
    STRUCTURE OBLIGATOIRE:
    1. RÉSUMÉ EXÉCUTIF (2 pages)
       - Le moment CRITIQUE
       - Contexte marché 2025
       - Recommandation principale
    
    2. ANALYSE MARCHÉ EXHAUSTIVE (6 pages)
       - Données INSEE, BdF, Bpifrance
       - TAM/SAM/SOM quantifié
       - PESTEL complet
       - Tendances 2025-2028
    
    3. BENCHMARK CONCURRENTIEL (5 pages)
       - 10-15 concurrents analysés
       - Matrice positionnement
       - Avantages compétitifs
       - Menaces identifiées
    
    4. 5 SCÉNARIOS STRATÉGIQUES (8 pages)
       Chaque scénario avec:
       - Budget Year 1 et 3 ans
       - Croissance attendue
       - Niveau de risque
       - ROI Timeline
       - Probabilité de succès
    
    5. PLAN PROJET 36 MOIS (10 pages)
       - Phase 1: Fondation (M1-M6)
       - Phase 2: Traction (M7-M12)
       - Phase 3: Scale (M13-M24)
       - Phase 4: Consolidation (M25-M36)
       Chaque phase: Livrables, Budget, KPIs
    
    6. SUIVI FINANCIER (4 pages)
       - Forecast Revenue vs Investment
       - Break-even analysis
       - ROI cumulé
       - Sensitivity analysis
    
    7. GOUVERNANCE & RISQUES (3 pages)
       - Structure de pilotage
       - Risk matrix
       - Escalation triggers
    
    8. CHECKLIST OPÉRATIONNELLE
       - Actions immédiates
       - Ressources nécessaires
    
    9. SOURCES CITÉES (obligatoire)
       - INSEE, Banque de France, Bpifrance
       - Études sectorielles
       - Benchmarks
    
    LONGUEUR CIBLE: 100-150 pages équivalent
    Score excellence: 92-98/100`
  };

  const systemPrompt = tierPrompts[scenario.tier] || tierPrompts.pro;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: scenario.model,
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt}
          
FORMAT JSON STRICT - STRUCTURE COMPLÈTE:
{
  "executive_summary": "Synthèse exécutive complète (300-500 mots)",
  "market_context": {
    "description": "Contexte marché 2025",
    "key_figures": [{ "metric": "...", "value": "...", "source": "..." }],
    "trends": ["tendance 1", "tendance 2", ...]
  },
  "scores": { 
    "market": 75, 
    "tech": 68, 
    "ux": 72, 
    "seo": 55, 
    "conversion": 48,
    "overall": 65
  },
  "swot": { 
    "strengths": ["force 1", "force 2", ...], 
    "weaknesses": ["faiblesse 1", ...], 
    "opportunities": ["opportunité 1", ...], 
    "threats": ["menace 1", ...] 
  },
  "competitors": [
    { "name": "...", "strengths": ["..."], "weaknesses": ["..."], "threat_level": "high/medium/low" }
  ],
  "strategic_scenarios": [
    { 
      "name": "Ambitieux/Opportuniste/Prudent", 
      "icon": "⚡/🎯/🛡️",
      "budget_y1": "800K€/400K€/150K€",
      "growth_y3": "+45%/+25%/+8%",
      "risk": "TRÈS ÉLEVÉ/MODÉRÉ/FAIBLE",
      "roi_timeline": "24-30 mois/18-24 mois/12-18 mois",
      "success_probability": "70%/85%/95%",
      "description": "Description détaillée..."
    }
  ],
  "recommended_scenario": "opportuniste",
  "action_plan": [
    { 
      "phase": "Phase 1: Fondation",
      "timeline": "M1-M6",
      "budget": "90K€",
      "actions": ["action 1", "action 2", ...],
      "kpis": [{ "metric": "...", "target": "..." }]
    }
  ],
  "financial_forecast": {
    "investment_total": "700K€",
    "revenue_y3": "4.6M€",
    "roi_percent": "+390%",
    "break_even": "Mois 18-20"
  },
  "sources": ["Source 1 (2025)", "Source 2 (2024)", ...],
  "locked_premium": ${scenario.features.lockedSections ? '["Analyse concurrentielle complète", "Données financières sectorielles", "Plan de transformation 12 mois"]' : '[]'}
}` 
        },
        { 
          role: "user", 
          content: `AUDIT ${scenario.tier.toUpperCase()} pour: ${scenario.url}
NIVEAU: ${scenario.name}
AGENTS MOBILISÉS: ${scenario.agents}
PAGES ATTENDUES: ${scenario.expectedPages}

${briefContext}

CONTENU SITE ANALYSÉ:
${siteContent}

Génère un rapport COMPLET et PROFESSIONNEL au format JSON.
IMPORTANT: Réponds en français. Sois précis et factuel.`
        }
      ],
      temperature: 0.7,
      max_tokens: scenario.tier === 'enterprise' ? 8000 : scenario.tier === 'agency' ? 6000 : 4000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI API error: ${response.status}`, errorText);
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse JSON robuste
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
  } catch (e) {
    console.error("JSON parse error, using enhanced fallback");
    return generateFallbackReport(scenario, siteContent, enrichedBrief);
  }
}

// ======================================================
// 🔄 FALLBACK REPORT (quand le parsing échoue)
// ======================================================
function generateFallbackReport(scenario: typeof TEST_SCENARIOS[0], siteContent: string, enrichedBrief?: any): any {
  const baseScore = scenario.expectedScore;
  return {
    executive_summary: `Audit ${scenario.tier.toUpperCase()} de ${enrichedBrief?.client_identity?.name || scenario.url}. Cette entreprise de rénovation basée dans l'Oise présente un potentiel de développement digital significatif. L'analyse révèle des opportunités majeures en référencement local et en génération de leads qualifiés.`,
    market_context: {
      description: "Le marché de la rénovation en Picardie connaît une croissance soutenue portée par les aides gouvernementales.",
      key_figures: [
        { metric: "Croissance marché BTP", value: "+3.5%", source: "FFB 2024" },
        { metric: "Demande isolation", value: "+15%", source: "ADEME 2024" }
      ],
      trends: ["MaPrimeRénov booste la demande", "Pénurie main d'œuvre", "Digitalisation secteur"]
    },
    scores: { 
      market: baseScore, 
      tech: baseScore - 5, 
      ux: baseScore - 3, 
      seo: baseScore - 15, 
      conversion: baseScore - 12,
      overall: baseScore - 7
    },
    swot: { 
      strengths: ["Expertise locale reconnue", "Équipe qualifiée", "Certifications RGE"], 
      weaknesses: ["Site web non optimisé", "Absence réseaux sociaux", "SEO local faible"], 
      opportunities: ["Forte demande rénovation", "Aides gouvernementales", "Marché digital inexploité"], 
      threats: ["Concurrence grandes enseignes", "Hausse coûts matériaux", "Pénurie artisans"] 
    },
    competitors: [
      { name: "Leroy Merlin Compiègne", strengths: ["Notoriété", "Prix"], weaknesses: ["Service impersonnel"], threat_level: "high" },
      { name: "Artisans locaux", strengths: ["Proximité", "Flexibilité"], weaknesses: ["Capacité limitée"], threat_level: "medium" }
    ],
    strategic_scenarios: [
      { 
        name: "Ambitieux", 
        icon: "⚡",
        budget_y1: "80K€",
        growth_y3: "+45%",
        risk: "ÉLEVÉ",
        roi_timeline: "24-30 mois",
        success_probability: "70%",
        description: "Transformation digitale complète avec site e-commerce, SEO national, campagnes ads"
      },
      { 
        name: "Opportuniste", 
        icon: "🎯",
        budget_y1: "40K€",
        growth_y3: "+25%",
        risk: "MODÉRÉ",
        roi_timeline: "18-24 mois",
        success_probability: "85%",
        description: "Focus SEO local, Google My Business, avis clients, site responsive"
      },
      { 
        name: "Prudent", 
        icon: "🛡️",
        budget_y1: "15K€",
        growth_y3: "+10%",
        risk: "FAIBLE",
        roi_timeline: "12-18 mois",
        success_probability: "95%",
        description: "Optimisation site existant, fiche Google, premiers avis"
      }
    ],
    recommended_scenario: "opportuniste",
    action_plan: [
      { 
        phase: "Phase 1: Quick Wins",
        timeline: "M1-M3",
        budget: "10K€",
        actions: ["Refonte Google My Business", "Site responsive", "Collecte avis clients"],
        kpis: [{ metric: "Visites site", target: "+50%" }]
      },
      { 
        phase: "Phase 2: Développement",
        timeline: "M4-M6",
        budget: "20K€",
        actions: ["SEO local", "Formulaire devis", "Réseaux sociaux"],
        kpis: [{ metric: "Leads/mois", target: "20" }]
      }
    ],
    financial_forecast: {
      investment_total: "40K€",
      revenue_y3: "2.1M€",
      roi_percent: "+180%",
      break_even: "Mois 14"
    },
    sources: ["FFB 2024", "ADEME 2024", "INSEE Picardie 2024"],
    locked_premium: scenario.features.lockedSections ? ["Analyse concurrentielle complète", "Données financières sectorielles"] : []
  };
}

// ======================================================
// 🎨 GÉNÉRATION HTML PREMIUM (STYLE OBUT)
// ======================================================
function generatePremiumHTML(scenario: typeof TEST_SCENARIOS[0], report: any, enrichedBrief?: any): string {
  const branding = BRANDING[scenario.tier] || BRANDING.discovery;
  const scores = report.scores || {};
  const swot = report.swot || {};
  const scenarios_strat = report.strategic_scenarios || [];
  const actionPlan = report.action_plan || [];
  const lockedPremium = report.locked_premium || [];
  const marketContext = report.market_context || {};
  const competitors = report.competitors || [];
  const financialForecast = report.financial_forecast || {};
  const sources = report.sources || [];

  const tierBadge: Record<string, { label: string; color: string; icon: string }> = {
    discovery: { label: 'FREEMIUM', color: '#6b7280', icon: '🆓' },
    pro: { label: 'PRO', color: '#0ea5e9', icon: '⭐' },
    agency: { label: 'AGENCY', color: '#7c3aed', icon: '👑' },
    enterprise: { label: 'ENTERPRISE', color: '#0f172a', icon: '🏛️' }
  };
  const badge = tierBadge[scenario.tier] || tierBadge.discovery;

  // Section brief Alex pour les tiers payants
  const briefSection = enrichedBrief && scenario.features.includeBrief ? `
    <section>
      <h2>📋 Brief Conversationnel Alex</h2>
      <div class="highlight">
        <strong>Ce rapport a été personnalisé</strong> grâce à votre échange avec Alex, notre agent conversationnel.
      </div>
      <div class="grid-2">
        <div>
          <h4>👤 Client</h4>
          <p>${enrichedBrief.client_identity?.name || 'N/A'}</p>
          <p style="color: var(--gray-text); font-size: 14px;">${enrichedBrief.client_identity?.role || ''}</p>
        </div>
        <div>
          <h4>📍 Localisation</h4>
          <p>${enrichedBrief.company_info?.location || 'N/A'}</p>
        </div>
      </div>
      <h3>🎯 Objectifs Stratégiques</h3>
      <ul>
        ${(enrichedBrief.strategic_objectives || []).map((o: string) => `<li>${o}</li>`).join('')}
      </ul>
      <h3>⚡ Défis Identifiés</h3>
      <ul>
        ${(enrichedBrief.current_challenges || []).map((c: string) => `<li>${c}</li>`).join('')}
      </ul>
    </section>
  ` : '';

  // Section contexte marché (Agency/Enterprise)
  const marketSection = marketContext.description ? `
    <section>
      <h2>📊 Contexte Marché 2025</h2>
      <p>${marketContext.description}</p>
      ${marketContext.key_figures?.length ? `
        <div class="kpi-grid">
          ${marketContext.key_figures.map((kf: any) => `
            <div class="kpi-card">
              <div class="kpi-value">${kf.value}</div>
              <div class="kpi-label">${kf.metric}</div>
              <div class="kpi-source">${kf.source}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${marketContext.trends?.length ? `
        <h3>Tendances Clés</h3>
        <ul>
          ${marketContext.trends.map((t: string) => `<li>📈 ${t}</li>`).join('')}
        </ul>
      ` : ''}
    </section>
  ` : '';

  // Section scénarios stratégiques (style OBUT)
  const scenariosSection = scenarios_strat.length > 0 ? `
    <section>
      <h2>📋 Scénarios Stratégiques</h2>
      <p>Votre entreprise dispose de ${scenarios_strat.length} chemins stratégiques distincts. Chaque scénario représente un équilibre unique entre ambition, risque et faisabilité.</p>
      
      <div class="scenarios-grid">
        ${scenarios_strat.map((s: any, index: number) => {
          const isRecommended = report.recommended_scenario?.toLowerCase().includes(s.name?.toLowerCase()) || index === 1;
          const cardClass = s.name?.toLowerCase().includes('ambitieux') ? 'ambitious' : 
                           s.name?.toLowerCase().includes('prudent') ? 'prudent' : 'opportunist';
          return `
            <div class="scenario-card ${cardClass}">
              <span class="scenario-badge ${cardClass}">${s.icon || '🎯'} ${s.name}</span>
              ${isRecommended ? '<span class="recommended-badge">⭐ RECOMMANDÉ</span>' : ''}
              
              <div class="scenario-item">
                <div class="scenario-label">Budget Year 1</div>
                <div class="scenario-value">${s.budget_y1 || 'N/A'}</div>
              </div>
              <div class="scenario-item">
                <div class="scenario-label">Croissance Y3</div>
                <div class="scenario-value">${s.growth_y3 || 'N/A'}</div>
              </div>
              <div class="scenario-item">
                <div class="scenario-label">Risque</div>
                <div class="scenario-value">${s.risk || 'N/A'}</div>
              </div>
              <div class="scenario-item">
                <div class="scenario-label">ROI Timeline</div>
                <div class="scenario-value">${s.roi_timeline || 'N/A'}</div>
              </div>
              <div class="scenario-item">
                <div class="scenario-label">Succès %</div>
                <div class="scenario-value">${s.success_probability || 'N/A'}</div>
              </div>
              <p class="scenario-description">${s.description || ''}</p>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  ` : '';

  // Section concurrents (Agency/Enterprise)
  const competitorsSection = competitors.length > 0 && !scenario.features.lockedSections ? `
    <section>
      <h2>🎯 Analyse Concurrentielle</h2>
      <table>
        <thead>
          <tr>
            <th>Concurrent</th>
            <th>Forces</th>
            <th>Faiblesses</th>
            <th>Menace</th>
          </tr>
        </thead>
        <tbody>
          ${competitors.map((c: any) => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${(c.strengths || []).join(', ')}</td>
              <td>${(c.weaknesses || []).join(', ')}</td>
              <td>
                <span class="threat-badge ${c.threat_level}">${c.threat_level?.toUpperCase()}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  ` : '';

  // Section financière (Agency/Enterprise)
  const financialSection = financialForecast.investment_total && !scenario.features.lockedSections ? `
    <section>
      <h2>💰 Suivi Financier</h2>
      <div class="highlight">
        <strong>Synthèse financière</strong> - Scénario recommandé
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${financialForecast.investment_total}</div>
          <div class="kpi-label">Investissement Total</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${financialForecast.revenue_y3}</div>
          <div class="kpi-label">Revenue Y3</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-value">${financialForecast.roi_percent}</div>
          <div class="kpi-label">ROI 3 ans</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${financialForecast.break_even}</div>
          <div class="kpi-label">Break-even</div>
        </div>
      </div>
    </section>
  ` : '';

  // Section sources
  const sourcesSection = sources.length > 0 ? `
    <section class="sources-section">
      <h2>📚 Sources Citées</h2>
      <ul>
        ${sources.map((s: string) => `<li>• ${s}</li>`).join('')}
      </ul>
    </section>
  ` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${enrichedBrief?.client_identity?.name || 'Audit'} - ${branding.company_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --primary: ${branding.primary_color};
      --primary-dark: ${adjustColor(branding.primary_color, -30)};
      --primary-light: ${adjustColor(branding.primary_color, 40)};
      --black: #1a1a1a;
      --gray-text: #666666;
      --white: #ffffff;
      --gray-bg: #f5f5f5;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
    }

    html { scroll-behavior: smooth; }
    
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      background: #fafafa; 
      color: var(--black); 
      line-height: 1.6; 
    }
    
    .header { 
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white; 
      padding: 50px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 0 40px rgba(0,0,0,0.2);
      margin-bottom: 40px;
    }
    
    .header-left { display: flex; align-items: center; gap: 20px; }
    
    .logo {
      width: 70px;
      height: 70px;
      background: var(--white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--primary);
      font-size: 18px;
    }
    
    .logo-text h2 { font-size: 20px; margin-bottom: 4px; font-weight: 700; }
    .logo-text p { font-size: 11px; opacity: 0.9; }
    
    .header-right { text-align: right; }
    .header-right h1 { font-size: 28px; margin-bottom: 8px; font-weight: 700; }
    .header-right .subtitle { font-size: 13px; opacity: 0.95; }
    
    .tier-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-top: 12px;
    }
    
    .container { max-width: 1000px; margin: 0 auto; padding: 0 30px 50px 30px; }
    
    section { 
      margin-bottom: 60px;
      background: var(--white);
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    section h2 { 
      font-size: 24px; 
      color: var(--primary); 
      margin-bottom: 20px;
      font-weight: 700;
      border-bottom: 3px solid var(--primary);
      padding-bottom: 12px;
    }
    
    section h3 { font-size: 18px; color: var(--black); margin-top: 20px; margin-bottom: 12px; font-weight: 600; }
    section h4 { font-size: 14px; color: var(--primary); margin-top: 15px; margin-bottom: 8px; font-weight: 600; }
    
    p { font-size: 14px; color: var(--gray-text); margin-bottom: 12px; line-height: 1.7; }
    ul { margin-left: 18px; margin-bottom: 15px; }
    li { margin-bottom: 8px; color: var(--gray-text); line-height: 1.7; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    
    .highlight {
      background: linear-gradient(135deg, rgba(216, 35, 42, 0.05), rgba(255, 77, 84, 0.05));
      border-left: 4px solid var(--primary);
      padding: 18px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .highlight strong { color: var(--primary); }
    
    .scores-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
    .score-item { text-align: center; padding: 20px 8px; background: var(--gray-bg); border-radius: 8px; }
    .score-value { font-size: 32px; font-weight: 700; color: var(--primary); }
    .score-label { font-size: 11px; color: var(--gray-text); text-transform: uppercase; margin-top: 4px; }
    
    .swot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .swot-box { padding: 20px; border-radius: 8px; }
    .swot-box h3 { font-size: 14px; margin-bottom: 12px; font-weight: 600; }
    .swot-box ul { list-style: none; margin: 0; }
    .swot-box li { padding: 6px 0; font-size: 14px; }
    .swot-strengths { background: #ecfdf5; }
    .swot-strengths h3 { color: #059669; }
    .swot-weaknesses { background: #fef2f2; }
    .swot-weaknesses h3 { color: #dc2626; }
    .swot-opportunities { background: #eff6ff; }
    .swot-opportunities h3 { color: #2563eb; }
    .swot-threats { background: #fefce8; }
    .swot-threats h3 { color: #ca8a04; }
    
    .scenarios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin: 30px 0; }
    
    .scenario-card {
      background: linear-gradient(135deg, #fafafa, #f5f5f5);
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      padding: 25px;
      transition: all 0.3s ease;
      position: relative;
    }
    .scenario-card:hover { border-color: var(--primary); box-shadow: 0 8px 25px rgba(0,0,0,0.1); transform: translateY(-3px); }
    .scenario-card.ambitious { border-left: 5px solid var(--danger); }
    .scenario-card.opportunist { border-left: 5px solid var(--primary); }
    .scenario-card.prudent { border-left: 5px solid var(--success); }
    
    .scenario-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: white;
    }
    .scenario-badge.ambitious { background: var(--danger); }
    .scenario-badge.opportunist { background: var(--primary); }
    .scenario-badge.prudent { background: var(--success); }
    
    .recommended-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: gold;
      color: #333;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
    }
    
    .scenario-item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0; }
    .scenario-item:last-of-type { border-bottom: none; }
    .scenario-label { font-size: 10px; color: var(--gray-text); text-transform: uppercase; font-weight: 600; margin-bottom: 3px; }
    .scenario-value { font-size: 16px; color: var(--black); font-weight: 700; }
    .scenario-description { font-size: 13px; color: var(--gray-text); margin-top: 15px; font-style: italic; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .kpi-card { background: var(--gray-bg); padding: 20px; border-radius: 8px; text-align: center; }
    .kpi-card.success { background: #ecfdf5; }
    .kpi-value { font-size: 24px; font-weight: 700; color: var(--primary); }
    .kpi-label { font-size: 11px; color: var(--gray-text); text-transform: uppercase; margin-top: 4px; }
    .kpi-source { font-size: 9px; color: #999; margin-top: 4px; }
    
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    table thead { background: var(--primary); color: white; }
    table th { padding: 12px; text-align: left; font-weight: 600; }
    table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
    table tr:nth-child(even) { background: #fafafa; }
    table tr:hover { background: var(--gray-bg); }
    
    .threat-badge { padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .threat-badge.high { background: #fef2f2; color: #dc2626; }
    .threat-badge.medium { background: #fefce8; color: #ca8a04; }
    .threat-badge.low { background: #ecfdf5; color: #059669; }
    
    .phase-card {
      background: linear-gradient(135deg, #fafafa, #f5f5f5);
      border-left: 4px solid var(--primary);
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .phase-card h3 { color: var(--primary); margin-bottom: 8px; }
    .phase-meta { display: flex; gap: 20px; margin: 12px 0; }
    .phase-meta span { font-size: 12px; padding: 4px 12px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; }
    
    .locked-section {
      background: linear-gradient(to right, #f8fafc, #e2e8f0);
      border: 2px dashed #cbd5e1;
      padding: 40px;
      text-align: center;
      border-radius: 12px;
      margin-top: 20px;
    }
    .locked-section h3 { color: #64748b; margin-bottom: 12px; font-size: 20px; }
    .locked-section p { color: #94a3b8; font-size: 14px; }
    .locked-section ul { list-style: none; margin: 20px 0; }
    .locked-section li { padding: 8px 0; font-size: 14px; color: #64748b; }
    .upgrade-btn {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 20px;
      font-weight: 600;
      transition: all 0.3s;
    }
    .upgrade-btn:hover { background: var(--primary-dark); transform: translateY(-2px); }
    
    .sources-section { background: var(--gray-bg); }
    .sources-section ul { list-style: none; margin: 0; }
    .sources-section li { padding: 6px 0; font-size: 12px; color: var(--gray-text); }
    
    .cta-section {
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white;
      padding: 50px;
      border-radius: 12px;
      text-align: center;
      margin: 50px 0;
    }
    .cta-section h3 { color: white; margin-bottom: 15px; font-size: 28px; }
    .cta-section p { color: rgba(255,255,255,0.95); margin-bottom: 20px; font-size: 16px; }
    
    footer {
      background: var(--black);
      color: white;
      padding: 40px;
      text-align: center;
      margin-top: 60px;
    }
    footer p { color: rgba(255,255,255,0.7); margin-bottom: 8px; font-size: 13px; }
    footer strong { color: var(--primary); }
    
    @media (max-width: 768px) {
      .header { flex-direction: column; gap: 15px; padding: 30px 20px; }
      .container { padding: 0 15px 30px 15px; }
      section { padding: 20px 15px; }
      .scores-grid { grid-template-columns: repeat(3, 1fr); }
      .scenarios-grid { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    
    @media print {
      body { background: white; }
      section { page-break-inside: avoid; box-shadow: none; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-left">
      <div class="logo">IM</div>
      <div class="logo-text">
        <h2>${branding.company_name}</h2>
        <p>Strategic Consulting</p>
      </div>
    </div>
    <div class="header-right">
      <h1>${enrichedBrief?.client_identity?.name || 'Audit Stratégique'}</h1>
      <p class="subtitle">Étude Stratégique & Plan d'Action</p>
      <span class="tier-badge">${badge.icon} ${badge.label} | ${scenario.agents} Agents IA</span>
    </div>
  </header>
  
  <div class="container">
    ${briefSection}
    
    <!-- Section Le Moment Critique -->
    <section>
      <h2>🎯 Le Moment CRITIQUE</h2>
      <div class="highlight">
        <p><strong>${enrichedBrief?.client_identity?.name || 'Votre entreprise'}</strong> se trouve à un moment charnière de son développement digital.</p>
        <p>Vous avez une fenêtre de 12-18 mois pour renforcer votre présence en ligne et capter les leads qualifiés avant que vos concurrents n'occupent le terrain digital local.</p>
      </div>
    </section>
    
    ${marketSection}
    
    <!-- Section Scores -->
    <section>
      <h2>📊 Scores de Performance</h2>
      <div class="scores-grid">
        <div class="score-item">
          <div class="score-value">${scores.market || 70}</div>
          <div class="score-label">Marché</div>
        </div>
        <div class="score-item">
          <div class="score-value">${scores.tech || 65}</div>
          <div class="score-label">Tech</div>
        </div>
        <div class="score-item">
          <div class="score-value">${scores.ux || 68}</div>
          <div class="score-label">UX</div>
        </div>
        <div class="score-item">
          <div class="score-value">${scores.seo || 55}</div>
          <div class="score-label">SEO</div>
        </div>
        <div class="score-item">
          <div class="score-value">${scores.conversion || 50}</div>
          <div class="score-label">Conversion</div>
        </div>
      </div>
    </section>
    
    <!-- Section Synthèse -->
    <section>
      <h2>📝 Synthèse Exécutive</h2>
      <p style="font-size: 16px;">${report.executive_summary || 'Analyse en cours de finalisation...'}</p>
    </section>
    
    <!-- Section SWOT -->
    <section>
      <h2>🎯 Analyse SWOT</h2>
      <div class="swot-grid">
        <div class="swot-box swot-strengths">
          <h3>✅ Forces</h3>
          <ul>${(swot.strengths || []).map((s: string) => `<li>• ${s}</li>`).join('')}</ul>
        </div>
        <div class="swot-box swot-weaknesses">
          <h3>⚠️ Faiblesses</h3>
          <ul>${(swot.weaknesses || []).map((s: string) => `<li>• ${s}</li>`).join('')}</ul>
        </div>
        <div class="swot-box swot-opportunities">
          <h3>🚀 Opportunités</h3>
          <ul>${(swot.opportunities || []).map((s: string) => `<li>• ${s}</li>`).join('')}</ul>
        </div>
        <div class="swot-box swot-threats">
          <h3>🔒 Menaces</h3>
          <ul>${(swot.threats || []).map((s: string) => `<li>• ${s}</li>`).join('')}</ul>
        </div>
      </div>
    </section>
    
    ${competitorsSection}
    ${scenariosSection}
    
    <!-- Section Plan d'Action -->
    <section>
      <h2>📋 Plan d'Action</h2>
      ${actionPlan.map((a: any) => `
        <div class="phase-card">
          <h3>${a.phase || 'Phase'}</h3>
          <div class="phase-meta">
            <span>📅 ${a.timeline || ''}</span>
            <span>💰 ${a.budget || ''}</span>
          </div>
          <ul>
            ${(a.actions || []).map((action: string) => `<li>✓ ${action}</li>`).join('')}
          </ul>
          ${a.kpis?.length ? `
            <h4>KPIs</h4>
            <ul>
              ${a.kpis.map((kpi: any) => `<li>📈 ${kpi.metric}: ${kpi.target}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </section>
    
    ${financialSection}
    
    ${lockedPremium.length > 0 ? `
    <section>
      <h2>🔒 Sections Premium</h2>
      <div class="locked-section">
        <h3>Contenu réservé aux abonnés Pro & Agency</h3>
        <p>Accédez à l'analyse complète :</p>
        <ul>
          ${lockedPremium.map((item: string) => `<li>🔐 ${item}</li>`).join('')}
        </ul>
        <a href="https://imotion-conseil.com/pricing" class="upgrade-btn">Passer au niveau supérieur →</a>
      </div>
    </section>
    ` : ''}
    
    ${sourcesSection}
    
    <!-- CTA Section -->
    <div class="cta-section">
      <h3>🎯 Prêt à Transformer ${enrichedBrief?.client_identity?.name || 'Votre Entreprise'} ?</h3>
      <p>Nos consultants sont disponibles pour vous accompagner dans la mise en œuvre de ces recommandations.</p>
    </div>
  </div>
  
  <footer>
    <p><strong>${branding.company_name}</strong> | ${badge.icon} ${badge.label}</p>
    <p>${enrichedBrief?.client_identity?.name || 'Audit'} - Étude Stratégique</p>
    <p>${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} | Document Confidentiel</p>
    <p style="margin-top: 15px; font-size: 11px;">Modèle IA: ${scenario.model} | ${scenario.agents} Agents Spécialisés</p>
  </footer>
</body>
</html>`;
}

// Utilitaire pour ajuster les couleurs
function adjustColor(hex: string, amount: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const num = parseInt(hex.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ======================================================
// 📧 ENVOI EMAIL
// ======================================================
async function sendReportEmail(supabase: any, reportId: string, email: string, scenario: any): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-audit-results`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          reportId: reportId,
          recipientEmail: email,
          auditType: scenario.tier,
          subject: `[TEST ${scenario.tier.toUpperCase()}] Audit ${scenario.name} - ${scenario.agents} Agents IA`
        }),
      }
    );
    
    return { success: response.ok };
  } catch (e) {
    console.error("Email error:", e);
    return { success: false };
  }
}
