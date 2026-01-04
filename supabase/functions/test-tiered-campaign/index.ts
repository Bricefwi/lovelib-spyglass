import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ======================================================
// 🎯 CONFIGURATION DES 4 NIVEAUX DE TEST
// ======================================================
const TEST_SCENARIOS = [
  {
    id: 'freemium',
    name: 'Freemium - Discovery',
    tier: 'discovery',
    model: 'google/gemini-2.5-flash-lite',
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'Analyse rapide avec sections cadenassées',
    expectedScore: 65,
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
    model: 'google/gemini-2.5-flash',
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'Audit complet + brief conversationnel Alex',
    expectedScore: 78,
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
    model: 'openai/gpt-5',
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'Dream Team IA + benchmarks sectoriels BTP',
    expectedScore: 88,
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
    model: 'openai/gpt-5',
    url: 'https://travaux-renovation-compiegne.fr/',
    description: 'McKinsey-level + roadmap transformation + ROI',
    expectedScore: 95,
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

      try {
        // 1. Scraping avec Tavily
        const siteContent = await scrapeSite(scenario.url, scenario.features.deepScraping);
        
        // 2. Analyse IA selon le niveau (avec brief enrichi si disponible)
        console.log(`📋 Brief inclus: ${scenario.features.includeBrief ? 'OUI' : 'NON'}`);
        const report = await generateTieredReport(scenario, siteContent, enriched_brief);
        
        // 3. Génération HTML avec branding
        const html = generateTieredHTML(scenario, report, enriched_brief);
        
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
          model_used: scenario.model
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
// 🕵️ SCRAPING TAVILY (avec fallback réaliste)
// ======================================================
async function scrapeSite(url: string, deep: boolean): Promise<string> {
  const tavilyKey = Deno.env.get("TAVILY_API_KEY");
  
  // Données de démonstration réalistes pour les tests
  const getDemoContent = (url: string): string => {
    if (url.includes('boulangerie') || url.includes('delalune')) {
      return `Boulangerie de la Lune - Artisan Boulanger depuis 1985.
      Notre boulangerie familiale propose des pains traditionnels, viennoiseries artisanales et pâtisseries maison.
      Spécialités: Pain au levain naturel, Croissants pur beurre, Tartes aux fruits de saison.
      Horaires: 6h30-19h30 du mardi au dimanche. Fermé le lundi.
      Adresse: 12 rue du Commerce, 35000 Rennes.
      Équipe de 5 artisans passionnés. Labels: Artisan de France, Agriculture Locale.
      Services: Click & Collect, Commandes personnalisées pour événements.
      Problèmes identifiés: Site web non responsive, pas de réservation en ligne, SEO faible.`;
    } else if (url.includes('qonto')) {
      return `Qonto - La néobanque des entreprises et indépendants.
      Solution bancaire 100% en ligne pour PME, startups et freelances.
      Produits: Compte pro, Cartes bancaires, Facturation, Comptabilité automatisée.
      +400 000 clients en Europe. Présence: France, Allemagne, Italie, Espagne.
      Levée de fonds: 622M€ (Série E, 2022). Valorisation: 5 milliards €.
      Équipe: 1200+ employés. Siège: Paris.
      Intégrations: Stripe, Pennylane, Sellsy, Zapier.
      Concurrents: Shine, Blank, Revolut Business.
      Forces: UX excellente, API robuste, support client réactif.
      Faiblesses: Pas de crédit bancaire, dépôts d'espèces limités.`;
    } else if (url.includes('saint-gobain')) {
      return `Saint-Gobain - Leader mondial de la construction durable.
      Fondé en 1665. CAC 40. CA: 47,9 milliards € (2023).
      Activités: Vitrage, Matériaux de construction, Solutions haute performance.
      Présence: 75 pays, 160 000 collaborateurs.
      Marques: Placo, Isover, Weber, Glassolutions, PAM.
      Stratégie: "Grow & Impact" - croissance durable et décarbonation.
      Objectif: Neutralité carbone 2050.
      Innovations: Verre électrochrome, Isolation biosourcée, Construction modulaire.
      Concurrents: Holcim, Kingspan, Owens Corning.
      Transformation digitale: BIM, IoT bâtiments, Supply chain 4.0.
      Marchés: Résidentiel 40%, Tertiaire 35%, Industrie 25%.`;
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
        query: `${url} entreprise activité produits services équipe`,
        include_domains: [hostname],
        search_depth: deep ? "advanced" : "basic",
        include_raw_content: deep,
        max_results: deep ? 5 : 2
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ Tavily API error ${response.status} - Mode démo activé`);
      return getDemoContent(url);
    }

    const data = await response.json();
    const content = data.results?.map((r: any) => `${r.title}: ${r.content}`).join('\n\n');
    console.log(`✅ ${data.results?.length || 0} pages scrappées`);
    
    return content?.substring(0, deep ? 20000 : 5000) || getDemoContent(url);
  } catch (e) {
    console.error("⚠️ Erreur scraping:", e);
    return getDemoContent(url);
  }
}

// ======================================================
// 🧠 GÉNÉRATION RAPPORT SELON NIVEAU (avec brief enrichi)
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

OBJECTIFS STRATÉGIQUES:
${(enrichedBrief.strategic_objectives || []).map((o: string) => `- ${o}`).join('\n')}

DÉFIS ACTUELS:
${(enrichedBrief.current_challenges || []).map((c: string) => `- ${c}`).join('\n')}

FOCUS SPÉCIFIQUE (PRICING):
${(enrichedBrief.focus_areas || []).map((f: string) => `- ${f}`).join('\n')}

QUESTIONS CLÉS DU CLIENT:
${(enrichedBrief.key_questions || []).map((q: string) => `- ${q}`).join('\n')}

PAYSAGE CONCURRENTIEL:
- Niche: ${enrichedBrief.competitive_landscape?.niche || 'N/A'}
- Positionnement: ${enrichedBrief.competitive_landscape?.positioning || 'N/A'}
====================================
` : '';

  const tierPrompts: Record<string, string> = {
    discovery: `Tu es un assistant marketing. Fais une analyse RAPIDE et SUPERFICIELLE.
    LIMITE: 
    - Identifie 2-3 problèmes évidents seulement
    - Ne donne PAS de solutions détaillées 
    - Indique que l'analyse complète nécessite un abonnement Pro
    - Score moyen autour de 60-70/100`,
    
    pro: `Tu es un Consultant Senior en Stratégie Digitale.
    ${briefContext ? 'IMPORTANT: Tu as accès au brief conversationnel du client. UTILISE-LE pour personnaliser tes recommandations.' : ''}
    PROFONDEUR: Analyse complète avec recommandations actionnables.
    - Identifie 5-7 problèmes avec solutions
    - Analyse concurrentielle de base  
    - Réponds aux questions spécifiques du client (notamment sur le pricing)
    - Plan d'action sur 6 mois
    - Score réaliste 75-85/100`,
    
    agency: `Tu es un Directeur Associé chez McKinsey Digital, spécialiste transformation digitale.
    ${briefContext ? 'CRITIQUE: Le brief conversationnel Alex contient les vraies attentes du client. Personnalise TOUTE ton analyse.' : ''}
    PROFONDEUR MAXIMALE - MODE "DEEP THINK":
    - Analyse stratégique à 360° (marché, concurrence, technologie, organisation)
    - Données financières et tendances sectorielles
    - Analyse APPROFONDIE du modèle de pricing (Freemium vs alternatives)
    - 3 scénarios stratégiques détaillés avec ROI
    - Benchmarks sectoriels précis
    - Recommandations de transformation digitale
    - Score premium 85-92/100`,
    
    enterprise: `Tu es Partner Senior chez McKinsey & Company, expert en transformation digitale Fortune 500.
    ${briefContext ? 'MISSION CRITIQUE: Le brief Alex est ta boussole stratégique. Chaque recommandation doit y répondre directement.' : ''}
    PROFONDEUR EXECUTIVE - MODE "TRANSFORMATION GLOBALE":
    - Analyse stratégique internationale (benchmarks mondiaux)
    - Deep-dive modèle économique et pricing (analyse Freemium, LTV/CAC, cohorts)
    - 5 scénarios stratégiques avec modélisation financière 36 mois
    - Roadmap de transformation complète avec jalons
    - Analyse de risques et mitigation
    - ROI quantifié par initiative
    - Score excellence 92-98/100`
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
          
FORMAT JSON STRICT:
{
  "executive_summary": "...",
  "scores": { "market": 75, "tech": 68, "ux": 72, "seo": 55, "conversion": 48, "pricing": 70 },
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "pricing_analysis": { "current_model": "...", "recommendations": [], "benchmark": "..." },
  "strategic_scenarios": [{ "name": "...", "description": "...", "roi": "...", "risk": "...", "timeline": "..." }],
  "action_plan": [{ "step": "...", "action": "...", "budget": "...", "priority": "..." }],
  "roadmap": { "months_6": [], "months_12": [], "months_36": [] },
  "locked_premium": ${scenario.features.lockedSections ? '["Analyse concurrentielle complète", "Données financières sectorielles", "Plan de transformation 12 mois"]' : '[]'}
}` 
        },
        { 
          role: "user", 
          content: `AUDIT ${scenario.tier.toUpperCase()} pour: ${scenario.url}

${briefContext}

CONTENU SITE:
${siteContent}

Retourne UNIQUEMENT le JSON.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse JSON robuste
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
  } catch (e) {
    console.error("JSON parse error, using fallback");
    return {
      executive_summary: `Audit ${scenario.tier} de ${scenario.url}`,
      scores: { market: scenario.expectedScore, tech: scenario.expectedScore - 5, ux: scenario.expectedScore - 3, seo: scenario.expectedScore - 10, conversion: scenario.expectedScore - 12 },
      swot: { strengths: ["À analyser"], weaknesses: ["À optimiser"], opportunities: ["Potentiel"], threats: ["Concurrence"] },
      strategic_scenarios: [{ name: "Scénario 1", description: "Optimisation", roi: "+30%", risk: "Faible" }],
      action_plan: [{ step: "Mois 1", action: "Quick wins", budget: "5k€" }],
      locked_premium: scenario.features.lockedSections ? ["Analyse complète réservée aux abonnés Pro"] : []
    };
  }
}

// ======================================================
// 🎨 GÉNÉRATION HTML AVEC BRANDING
// ======================================================
function generateTieredHTML(scenario: typeof TEST_SCENARIOS[0], report: any, enrichedBrief?: any): string {
  const branding = BRANDING[scenario.tier] || BRANDING.discovery;
  const scores = report.scores || {};
  const swot = report.swot || {};
  const scenarios_strat = report.strategic_scenarios || [];
  const actionPlan = report.action_plan || [];
  const lockedPremium = report.locked_premium || [];
  const pricingAnalysis = report.pricing_analysis || {};
  const roadmap = report.roadmap || {};

  const tierBadge: Record<string, { label: string; color: string; icon: string }> = {
    discovery: { label: 'FREEMIUM', color: '#6b7280', icon: '🆓' },
    pro: { label: 'PRO', color: '#0ea5e9', icon: '⭐' },
    agency: { label: 'AGENCY', color: '#7c3aed', icon: '👑' },
    enterprise: { label: 'ENTERPRISE', color: '#0f172a', icon: '🏛️' }
  };
  const badge = tierBadge[scenario.tier] || tierBadge.discovery;

  // Section brief Alex pour les tiers payants
  const briefSection = enrichedBrief && scenario.features.includeBrief ? `
    <div class="card" style="border-left: 4px solid #f59e0b;">
      <h2>📋 Brief Conversationnel Alex</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <p style="font-weight: 600; margin-bottom: 8px;">👤 Client</p>
          <p style="color: #64748b;">${enrichedBrief.client_identity?.name || 'N/A'} - ${enrichedBrief.client_identity?.role || ''}</p>
        </div>
        <div>
          <p style="font-weight: 600; margin-bottom: 8px;">🎯 Objectifs</p>
          <ul style="color: #64748b; padding-left: 16px;">
            ${(enrichedBrief.strategic_objectives || []).slice(0, 3).map((o: string) => `<li>${o}</li>`).join('')}
          </ul>
        </div>
        <div>
          <p style="font-weight: 600; margin-bottom: 8px;">💰 Focus Pricing</p>
          <ul style="color: #64748b; padding-left: 16px;">
            ${(enrichedBrief.key_questions || []).slice(0, 2).map((q: string) => `<li>${q}</li>`).join('')}
          </ul>
        </div>
        <div>
          <p style="font-weight: 600; margin-bottom: 8px;">⚡ Défis</p>
          <ul style="color: #64748b; padding-left: 16px;">
            ${(enrichedBrief.current_challenges || []).map((c: string) => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  ` : '';

  // Section pricing pour les tiers avec brief
  const pricingSection = pricingAnalysis.current_model ? `
    <div class="card">
      <h2>💰 Analyse Pricing</h2>
      <p style="margin-bottom: 16px;"><strong>Modèle actuel:</strong> ${pricingAnalysis.current_model}</p>
      ${pricingAnalysis.benchmark ? `<p style="margin-bottom: 16px;"><strong>Benchmark:</strong> ${pricingAnalysis.benchmark}</p>` : ''}
      ${pricingAnalysis.recommendations?.length ? `
        <p style="font-weight: 600; margin-bottom: 8px;">Recommandations:</p>
        <ul style="padding-left: 16px;">
          ${pricingAnalysis.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport ${tierBadge.label} - ${branding.company_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    
    .header { 
      background: linear-gradient(135deg, ${branding.primary_color}, ${adjustColor(branding.primary_color, -30)});
      color: white; 
      padding: 40px 24px;
      text-align: center;
    }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header .subtitle { opacity: 0.9; font-size: 16px; }
    .tier-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-top: 16px;
    }
    
    .container { max-width: 900px; margin: 0 auto; padding: 24px; }
    
    .card { 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 24px;
      margin-bottom: 24px;
    }
    .card h2 { 
      color: ${branding.primary_color}; 
      font-size: 20px; 
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f1f5f9;
    }
    
    .scores-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .score-item { text-align: center; padding: 16px 8px; background: #f8fafc; border-radius: 8px; }
    .score-value { font-size: 28px; font-weight: 700; color: ${branding.primary_color}; }
    .score-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    
    .summary { font-size: 16px; color: #475569; }
    
    .swot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .swot-box { padding: 16px; border-radius: 8px; }
    .swot-box h3 { font-size: 14px; margin-bottom: 8px; font-weight: 600; }
    .swot-box ul { list-style: none; }
    .swot-box li { padding: 4px 0; font-size: 14px; }
    .swot-strengths { background: #ecfdf5; }
    .swot-strengths h3 { color: #059669; }
    .swot-weaknesses { background: #fef2f2; }
    .swot-weaknesses h3 { color: #dc2626; }
    .swot-opportunities { background: #eff6ff; }
    .swot-opportunities h3 { color: #2563eb; }
    .swot-threats { background: #fefce8; }
    .swot-threats h3 { color: #ca8a04; }
    
    .scenario-card { 
      border-left: 4px solid ${branding.primary_color}; 
      padding: 16px; 
      margin-bottom: 16px; 
      background: #f8fafc;
      border-radius: 0 8px 8px 0;
    }
    .scenario-card h3 { color: ${branding.primary_color}; margin-bottom: 8px; }
    .scenario-meta { display: flex; gap: 16px; margin-top: 12px; }
    .scenario-meta span { 
      font-size: 12px; 
      padding: 4px 10px; 
      background: white; 
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    
    .action-step { 
      display: flex; 
      gap: 16px; 
      padding: 16px 0; 
      border-bottom: 1px solid #f1f5f9;
    }
    .action-step:last-child { border-bottom: none; }
    .step-label { 
      font-weight: 600; 
      color: ${branding.primary_color}; 
      min-width: 100px;
    }
    
    .locked-section {
      background: linear-gradient(to right, #f8fafc, #e2e8f0);
      border: 2px dashed #cbd5e1;
      padding: 24px;
      text-align: center;
      border-radius: 8px;
      margin-top: 16px;
    }
    .locked-section h3 { color: #64748b; margin-bottom: 8px; }
    .locked-section p { color: #94a3b8; font-size: 14px; }
    .upgrade-btn {
      display: inline-block;
      background: ${branding.primary_color};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 16px;
      font-weight: 600;
    }
    
    .footer { 
      text-align: center; 
      padding: 32px; 
      color: #64748b; 
      font-size: 14px;
    }
    .footer strong { color: ${branding.primary_color}; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${badge.icon} ${branding.company_name}</h1>
    <p class="subtitle">Rapport d'Audit Stratégique - ${scenario.url}</p>
    <span class="tier-badge">${badge.label}</span>
  </div>
  
  <div class="container">
    ${briefSection}
    ${pricingSection}
    
    <div class="card">
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
    </div>
    
    <div class="card">
      <h2>📝 Synthèse Exécutive</h2>
      <p class="summary">${report.executive_summary || 'Analyse en cours...'}</p>
    </div>
    
    <div class="card">
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
    </div>
    
    <div class="card">
      <h2>🎲 Scénarios Stratégiques</h2>
      ${scenarios_strat.map((s: any) => `
        <div class="scenario-card">
          <h3>${s.name || 'Scénario'}</h3>
          <p>${s.description || ''}</p>
          <div class="scenario-meta">
            <span>📈 ROI: ${s.roi || 'N/A'}</span>
            <span>⚡ Risque: ${s.risk || 'N/A'}</span>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="card">
      <h2>📋 Plan d'Action</h2>
      ${actionPlan.map((a: any) => `
        <div class="action-step">
          <span class="step-label">${a.step || ''}</span>
          <div>
            <p>${a.action || ''}</p>
            <small style="color:#64748b">${a.budget ? `Budget: ${a.budget}` : ''}</small>
          </div>
        </div>
      `).join('')}
    </div>
    
    ${lockedPremium.length > 0 ? `
    <div class="card">
      <h2>🔒 Sections Premium</h2>
      <div class="locked-section">
        <h3>Contenu réservé aux abonnés Pro & Agency</h3>
        <p>Accédez à l'analyse complète :</p>
        <ul style="list-style:none; margin:16px 0;">
          ${lockedPremium.map((item: string) => `<li>🔐 ${item}</li>`).join('')}
        </ul>
        <a href="https://imotion.fr/pricing" class="upgrade-btn">Passer au niveau supérieur →</a>
      </div>
    </div>
    ` : ''}
  </div>
  
  <div class="footer">
    <p>Généré par <strong>${branding.company_name}</strong> | Modèle: ${scenario.model}</p>
    <p>Niveau: ${tierBadge.label} | ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
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
          subject: `[TEST ${scenario.tier.toUpperCase()}] Audit ${scenario.name}`
        }),
      }
    );
    
    return { success: response.ok };
  } catch (e) {
    console.error("Email error:", e);
    return { success: false };
  }
}
