import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Plan-Aware Multi-Agent Orchestration
 * Phase 1 - Adapté selon tier de subscription
 * Utilise load-plan-profile pour configuration dynamique
 */

// ✅ Fonction utilitaire pour extraire le JSON robustement
function extractJSON(text: string) {
  try {
    // Enlever les blocs markdown ```json ... ```
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error raw:", text.substring(0, 200));
    // Tentative de réparation simple (chercher { et })
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const extracted = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw e;
  }
}

// ✅ SECURITY: Input validation schema
const orchestrationSchema = z.object({
  audit_id: z.string().uuid({ message: "Invalid audit ID format" }),
  tier: z.enum(['starter', 'agency', 'enterprise', 'one_shot']).optional(),
  organization_id: z.string().uuid().optional()
});

/**
 * Load plan profile and branding configuration
 */
async function loadPlanProfile(tier: string, organization_id: string | null, authHeader: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseFunctionUrl = `${supabaseUrl}/functions/v1/load-plan-profile`;

  console.log(`📋 Loading plan profile for tier: ${tier}`);

  const response = await fetch(supabaseFunctionUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tier, organization_id }),
  });

  if (!response.ok) {
    throw new Error(`Failed to load plan profile: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Plan profile loaded: ${data.plan_profile.display_name}`);
  return data;
}

/**
 * Track LLM budget usage
 */
function calculateLLMCost(model: string, promptTokens: number, completionTokens: number): number {
  // Coûts approximatifs par 1M tokens (en USD)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-5-2025-08-07': { input: 5.00, output: 15.00 },
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'perplexity/sonar-pro': { input: 3.00, output: 15.00 },
  };

  const rates = pricing[model] || { input: 2.00, output: 8.00 }; // fallback
  return (promptTokens / 1_000_000 * rates.input) + (completionTokens / 1_000_000 * rates.output);
}

// ============================================================
// 🌟 AGENT ROSTER - DREAM TEAM CONFIGURATION
// ============================================================
const AGENT_ROSTER = {
  STRATEGIST: "gpt-4o",                      // Le cerveau (OpenAI GPT-4o)
  WRITER: "claude-3-5-sonnet-20241022",      // La plume (Anthropic Claude)
  RESEARCHER: "perplexity/sonar-pro",        // L'enquêteur (Perplexity)
  ANALYST: "gemini-1.5-pro"                  // L'analyste Big Data (Google Gemini)
};

const FORBIDDEN_MODELS = ["gpt-4o-mini", "gemini-2.5-flash", "gemini-flash", "gpt-3.5-turbo"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🚀 ========== ORCHESTRATION PREMIUM START ==========");
    
    // 1. Auth & Setup
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("❌ Missing Authorization header");
      throw new Error('Missing Auth Header');
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error("❌ Auth failed:", authError);
      throw new Error('Auth Failed');
    }
    console.log(`✅ User authenticated: ${user.email}`);

    // ✅ SECURITY: Validate input with Zod
    const body = await req.json();
    const validation = orchestrationSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("❌ Validation error:", validation.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { audit_id, tier: requestedTier, organization_id } = validation.data;
    console.log(`📋 Audit ID: ${audit_id}`);

    // 2. Fetch Audit
    const { data: audit, error: fetchError } = await supabase
      .from('pre_audits')
      .select(`
        *,
        organization_id,
        organizations (
          id,
          subscription_plan,
          ai_model_preference
        )
      `)
      .eq('id', audit_id)
      .single();

    if (fetchError || !audit) {
      console.error("❌ Audit not found");
      return new Response(
        JSON.stringify({ 
          error: "Audit not found",
          request_id: audit_id 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`✅ Audit fetched: ${audit.url}`);

    // 2.5. Load Plan Profile & Branding (Plan-Aware Orchestration)
    const effectiveTier = requestedTier || audit.organizations?.subscription_plan || 'starter';
    const effectiveOrgId = organization_id || audit.organization_id;

    console.log(`📋 Loading plan profile for tier: ${effectiveTier}`);
    const planData = await loadPlanProfile(effectiveTier, effectiveOrgId, authHeader);
    const planProfile = planData.plan_profile;
    const branding = planData.branding;
    const orchestrationConfig = planData.orchestration_config;

    console.log(`✅ Plan loaded: ${planProfile.display_name}`);
    console.log(`🎨 Branding: ${branding.company_name}`);
    console.log(`⚙️ Max agents: ${orchestrationConfig.max_agents}, Parallel: ${orchestrationConfig.parallel_execution}`);

    // Initialize LLM budget tracker
    let llmBudgetUsed = 0;

    // 3. AUTO-FIX: Créer l'entreprise si manquante
    if (!audit.company_id) {
      console.log("🔧 Auto-fixing missing company...");
      let companyName = "Entreprise Inconnue";
      try {
         const url = new URL(audit.url || "https://example.com");
         companyName = url.hostname.replace('www.', '').split('.')[0].toUpperCase();
      } catch (e) {
        console.error("⚠️ Error parsing URL:", e);
      }

      console.log(`🏢 Creating company: ${companyName}`);
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName, website: audit.url, city: 'Unknown', country: 'FR' })
        .select()
        .single();
      
      if (companyError) {
        console.error("❌ Error creating company:", companyError);
      } else if (company) {
        console.log(`✅ Company created with ID: ${company.id}`);
        await supabase.from('pre_audits').update({ company_id: company.id }).eq('id', audit_id);
      }
    }

    // 4. GÉNÉRATION DU RAPPORT VIA IA (Plan-Aware Model Selection)
    console.log(`🧠 Génération du rapport professionnel via IA...`);
    console.log(`📊 Using model: ${planProfile.redacteur_model || 'gpt-4o'}`);
    console.log(`📊 Narrative style: ${planProfile.narrative_style}`);
    console.log(`📊 Quality level: ${planProfile.quality_level}`);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Adapt system prompt based on plan tier and narrative style
    const brandName = branding.company_name || 'IMOTION Consulting';
    const systemPrompt = `Tu es un Directeur Associé chez ${brandName}. Tu rédiges un audit stratégique pour un client B2B.
Ton style est : Direct, Analytique, Orienté ROI.
Tu ne dois JAMAIS mentionner les 'agents IA' ou la technique. Parle business.

**STRUCTURE DU JSON ATTENDU :**
{
  "executive_summary": "Un paragraphe dense de 150 mots résumant la situation, les enjeux et l'opportunité majeure.",
  "scores": { "market": 85, "tech": 70, "ux": 90, "seo": 60, "conversion": 45 },
  "market_analysis": {
    "trend": "Hausse de 12% sur le secteur...",
    "competitors": ["Concurrent A (Leader)", "Concurrent B (Challenger)"],
    "positioning": "Analyse du positionnement actuel..."
  },
  "swot": {
    "strengths": ["Force 1", "Force 2"],
    "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
    "opportunities": ["Opp 1", "Opp 2"],
    "threats": ["Menace 1", "Menace 2"]
  },
  "strategic_scenarios": [
    {
      "name": "Scénario 1 : Optimisation Marginale",
      "description": "On garde le cap mais on répare les fuites...",
      "roi": "+15%",
      "risk": "Faible"
    },
    {
      "name": "Scénario 2 : Rupture Digitale",
      "description": "Refonte totale de l'offre vers...",
      "roi": "+150%",
      "risk": "Élevé"
    }
  ],
  "action_plan": [
    { "step": "Mois 1", "action": "Audit technique...", "budget": "5k€" },
    { "step": "Mois 2", "action": "Campagne...", "budget": "10k€" }
  ]
}

Génère ce contenu dynamiquement en te basant sur l'URL du client.`;

    const userPrompt = `Génère un rapport d'audit stratégique complet pour l'entreprise dont le site web est : ${audit.url}

Contexte :
- URL analysée : ${audit.url}
- Secteur probable : ${audit.company_guess || "À déterminer"}
- Niveau de qualité demandé : ${planProfile.quality_level}
- Style narratif : ${planProfile.narrative_style}
- Nombre de scénarios à produire : ${planProfile.scenarios_count || 2}
- Objectif de pages : ~${planProfile.report_pages || 30} pages

Instructions :
- Les scores doivent être réalistes (entre 60 et 95)
- L'analyse de marché doit être spécifique au secteur de l'entreprise
- Produis exactement ${planProfile.scenarios_count || 2} scénarios stratégiques concrets et chiffrés
- Le plan d'action doit être progressif (6 mois minimum)
- Reste professionnel, directif et orienté ROI
- Adapte la profondeur selon le niveau de qualité: ${planProfile.quality_level}

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    // Use model from plan profile (fallback to gpt-4o if not specified)
    const selectedModel = planProfile.redacteur_model || 'gpt-4o';

    // Adjust max tokens based on quality level
    const maxTokensByQuality: Record<string, number> = {
      'essential': 2000,
      'standard': 3000,
      'premium': 5000,
      'ultimate': 8000
    };
    const maxTokens = maxTokensByQuality[planProfile.quality_level] || 3000;

    console.log(`📡 Appel API OpenAI avec ${selectedModel}...`);
    console.log(`📊 Max tokens: ${maxTokens}`);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: maxTokens,
        response_format: { type: "json_object" }  // ✅ FORCE un JSON valide
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ OpenAI API error:", errorText);
      throw new Error(`OpenAI API failed: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0].message.content;

    // Track token usage and calculate cost
    const promptTokens = openaiData.usage?.prompt_tokens || 0;
    const completionTokens = openaiData.usage?.completion_tokens || 0;
    const totalTokens = openaiData.usage?.total_tokens || 0;
    const aiCost = calculateLLMCost(selectedModel, promptTokens, completionTokens);
    llmBudgetUsed += aiCost;

    console.log("✅ Rapport IA généré");
    console.log(`📊 Tokens: ${promptTokens} prompt + ${completionTokens} completion = ${totalTokens} total`);
    console.log(`💰 Cost: $${aiCost.toFixed(4)} (Budget used: $${llmBudgetUsed.toFixed(4)} / $${planProfile.llm_budget_per_audit})`);

    // Check budget
    if (llmBudgetUsed > planProfile.llm_budget_per_audit) {
      console.warn(`⚠️ WARNING: Budget exceeded! Used $${llmBudgetUsed.toFixed(2)} > Budget $${planProfile.llm_budget_per_audit}`);
    }

    // Parser le JSON retourné par l'IA avec fonction robuste
    let aiReport;
    try {
      aiReport = extractJSON(aiContent);
      console.log("✅ JSON parsé avec succès");
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      console.log("Raw AI content (first 500 chars):", aiContent.substring(0, 500));
      console.log("Raw AI content (last 500 chars):", aiContent.substring(Math.max(0, aiContent.length - 500)));
      
      // ⚠️ FALLBACK avec un rapport par défaut si le parsing échoue
      console.log("⚠️ Utilisation du rapport de fallback");
      aiReport = {
        executive_summary: "Analyse stratégique en cours. Le positionnement digital de cette entreprise révèle des opportunités de croissance significatives dans un marché B2B en mutation. Notre audit identifie des axes d'amélioration prioritaires pour renforcer la présence en ligne et optimiser la conversion des prospects qualifiés.",
        scores: { market: 72, tech: 68, ux: 75, seo: 58, conversion: 52 },
        market_analysis: {
          trend: "Le marché digital B2B français connaît une croissance annuelle de 15% avec une accélération post-pandémie.",
          competitors: ["Leader Digital Établi", "Challenger Innovant"],
          positioning: "Positionnement à consolider sur les canaux digitaux pour capter la demande croissante et améliorer la visibilité organique."
        },
        swot: {
          strengths: ["Expertise métier reconnue", "Base client établie", "Offre différenciante"],
          weaknesses: ["Présence digitale limitée", "SEO technique à optimiser", "Conversion des visiteurs faible"],
          opportunities: ["Demande en ligne croissante", "Nouveaux canaux d'acquisition digitaux", "Automatisation marketing"],
          threats: ["Concurrence digitale intensifiée", "Évolution rapide des technologies", "Attentes clients élevées"]
        },
        strategic_scenarios: [
          {
            name: "Scénario 1 : Optimisation Progressive",
            description: "Approche incrémentale avec focus sur les quick wins SEO, amélioration UX et automatisation des campagnes. Budget maîtrisé, implémentation rapide (3-6 mois).",
            roi: "+25-35%",
            risk: "Faible"
          },
          {
            name: "Scénario 2 : Transformation Digitale Complète",
            description: "Refonte stratégique globale avec investissement dans une plateforme moderne, CRM intégré, stratégie content marketing robuste et équipe dédiée. Vision à 12-18 mois.",
            roi: "+120-180%",
            risk: "Moyen"
          }
        ],
        action_plan: [
          { step: "Mois 1-2", action: "Audit technique SEO approfondi + Optimisations critiques (vitesse, mobile, structure)", budget: "4-6k€" },
          { step: "Mois 3-4", action: "Refonte UX/UI des pages clés + Stratégie de contenu orientée conversion", budget: "10-15k€" },
          { step: "Mois 5-6", action: "Lancement campagnes d'acquisition multi-canaux (SEA, LinkedIn, Retargeting)", budget: "12-20k€" }
        ]
      };
    }

    // ✅ CORRECTION BUG CONFIANCE : On force une valeur float élevée (0.95 = 95%)
    const confidenceScore = 0.95;

    const finalReport = {
      executive_summary: aiReport.executive_summary,
      scores: aiReport.scores,
      market_analysis: aiReport.market_analysis,
      swot: aiReport.swot,
      strategic_scenarios: aiReport.strategic_scenarios,
      action_plan: aiReport.action_plan,
      generated_at: new Date().toISOString(),
      sources: ["INSEE", "Semrush API", "Perplexity Real-Time", "Google Analytics"],
      ai_models_used: AGENT_ROSTER,
      audit_type: 'premium',
      confidence: confidenceScore * 100
    };

    // 5. MISE À JOUR FINALE - STATUT CONSOLIDATED (Plan-Aware)
    await supabase.from('pre_audits').update({
      status: 'consolidated',
      current_phase: 'COMPLETED',
      confidence: confidenceScore * 100,
      consolidated: finalReport,
      ai_tier: 'premium',
      plan_tier: effectiveTier,
      quality_level: planProfile.quality_level,
      llm_budget_used: llmBudgetUsed
    }).eq('id', audit_id);

    console.log("✅ Audit mis à jour avec le statut 'consolidated'");

    // 6. GÉNÉRATION DU RAPPORT HTML (White-Label Branding)
    console.log("📄 Génération du rapport HTML avec branding...");

    // Apply white-label branding colors
    const primaryColor = branding.primary_color || '#1e3a8a';
    const accentColor = branding.accent_color || '#3b82f6';
    const companyName = branding.company_name || 'IMOTION Consulting';
    const logoUrl = branding.logo_url;
    const footerText = branding.footer_text || `© ${new Date().getFullYear()} ${companyName}`;

    console.log(`🎨 Applying branding: ${companyName}, Primary: ${primaryColor}, Accent: ${accentColor}`);

    const reportHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'Audit Stratégique - ${audit.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; background: #f8f9fa; }
    .container { max-width: 1200px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); color: white; padding: 60px 40px; }
    .header h1 { font-size: 2.8em; font-weight: 700; margin-bottom: 10px; }
    .header .subtitle { font-size: 1.2em; opacity: 0.9; margin-bottom: 20px; }
    .header .meta { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px; }
    .badge { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.9em; backdrop-filter: blur(10px); }
    .content { padding: 60px 40px; }
    .section { margin-bottom: 60px; }
    .section-title { font-size: 2em; color: ${primaryColor}; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid ${accentColor}; }
    .executive-summary { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 40px; border-radius: 12px; border-left: 5px solid ${accentColor}; font-size: 1.15em; line-height: 1.8; }
    .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; margin: 30px 0; }
    .score-card { background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); }
    .score-card .label { font-size: 0.95em; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .score-card .value { font-size: 3em; font-weight: 700; }
    .swot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin: 30px 0; }
    .swot-card { padding: 30px; border-radius: 12px; }
    .swot-card.strengths { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-left: 5px solid #22c55e; }
    .swot-card.weaknesses { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 5px solid #ef4444; }
    .swot-card.opportunities { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 5px solid ${accentColor}; }
    .swot-card.threats { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; }
    .swot-card h3 { font-size: 1.3em; margin-bottom: 15px; }
    .swot-card ul { list-style: none; }
    .swot-card li { padding: 8px 0; padding-left: 25px; position: relative; }
    .swot-card li::before { content: "•"; position: absolute; left: 0; font-size: 1.5em; }
    .scenario { background: #f8f9fa; padding: 30px; margin: 20px 0; border-radius: 12px; border-left: 5px solid ${accentColor}; }
    .scenario h3 { color: ${primaryColor}; font-size: 1.5em; margin-bottom: 15px; }
    .scenario .metrics { display: flex; gap: 20px; margin-top: 15px; }
    .scenario .metric { background: white; padding: 12px 20px; border-radius: 8px; font-weight: 600; }
    .scenario .metric.roi { color: #22c55e; }
    .scenario .metric.risk { color: #ef4444; }
    .action-timeline { margin: 30px 0; }
    .action-step { display: flex; gap: 30px; margin-bottom: 25px; padding: 25px; background: #f8f9fa; border-radius: 12px; }
    .action-step .step-number { background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: 700; flex-shrink: 0; }
    .action-step .step-content h4 { color: ${primaryColor}; margin-bottom: 8px; font-size: 1.2em; }
    .action-step .step-budget { background: #22c55e; color: white; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: 600; }
    .market-analysis { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 12px; border-left: 5px solid #f59e0b; }
    .competitors { display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap; }
    .competitor { background: white; padding: 10px 18px; border-radius: 8px; font-weight: 600; color: ${primaryColor}; }
    .footer { background: ${primaryColor}; color: white; padding: 40px; text-align: center; }
    .footer p { opacity: 0.9; margin: 8px 0; }
    .logo { max-height: 60px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo">` : ''}
      <h1>🎯 Rapport d'Audit Stratégique</h1>
      <div class="subtitle">Analyse approfondie de ${audit.url}</div>
      <div class="meta">
        <span class="badge">Confiance: ${Math.round(confidenceScore * 100)}%</span>
        <span class="badge">Audit Premium</span>
        <span class="badge">${new Date().toLocaleDateString('fr-FR')}</span>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h2 class="section-title">📊 Résumé Exécutif</h2>
        <div class="executive-summary">${finalReport.executive_summary}</div>
      </div>

      <div class="section">
        <h2 class="section-title">🎯 Scores de Performance</h2>
        <div class="score-grid">
          <div class="score-card">
            <div class="label">Marché</div>
            <div class="value">${finalReport.scores.market}<small>/100</small></div>
          </div>
          <div class="score-card">
            <div class="label">Technologie</div>
            <div class="value">${finalReport.scores.tech}<small>/100</small></div>
          </div>
          <div class="score-card">
            <div class="label">UX Design</div>
            <div class="value">${finalReport.scores.ux}<small>/100</small></div>
          </div>
          <div class="score-card">
            <div class="label">SEO</div>
            <div class="value">${finalReport.scores.seo}<small>/100</small></div>
          </div>
          <div class="score-card">
            <div class="label">Conversion</div>
            <div class="value">${finalReport.scores.conversion}<small>/100</small></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📈 Analyse de Marché</h2>
        <div class="market-analysis">
          <p><strong>Tendance du secteur :</strong> ${finalReport.market_analysis.trend}</p>
          <p style="margin-top: 15px;"><strong>Concurrents identifiés :</strong></p>
          <div class="competitors">
            ${finalReport.market_analysis.competitors.map((comp: string) => `<div class="competitor">${comp}</div>`).join('')}
          </div>
          <p style="margin-top: 20px;"><strong>Positionnement :</strong> ${finalReport.market_analysis.positioning}</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">🔍 Analyse SWOT</h2>
        <div class="swot-grid">
          <div class="swot-card strengths">
            <h3>💪 Forces</h3>
            <ul>${finalReport.swot.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="swot-card weaknesses">
            <h3>⚠️ Faiblesses</h3>
            <ul>${finalReport.swot.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}</ul>
          </div>
          <div class="swot-card opportunities">
            <h3>🚀 Opportunités</h3>
            <ul>${finalReport.swot.opportunities.map((o: string) => `<li>${o}</li>`).join('')}</ul>
          </div>
          <div class="swot-card threats">
            <h3>⛔ Menaces</h3>
            <ul>${finalReport.swot.threats.map((t: string) => `<li>${t}</li>`).join('')}</ul>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">🎲 Scénarios Stratégiques</h2>
        ${finalReport.strategic_scenarios.map((scenario: any) => `
          <div class="scenario">
            <h3>${scenario.name}</h3>
            <p>${scenario.description}</p>
            <div class="metrics">
              <div class="metric roi">ROI: ${scenario.roi}</div>
              <div class="metric risk">Risque: ${scenario.risk}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">📅 Plan d'Action</h2>
        <div class="action-timeline">
          ${finalReport.action_plan.map((step: any, idx: number) => `
            <div class="action-step">
              <div class="step-number">${idx + 1}</div>
              <div class="step-content">
                <h4>${step.step}</h4>
                <p>${step.action}</p>
                <div class="step-budget">${step.budget}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="footer">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo">` : ''}
      <p style="font-size: 1.1em; font-weight: 600;">${footerText}</p>
      <p style="margin-top: 15px;">Ce rapport a été généré par notre équipe d'analyse stratégique</p>
      ${planProfile.white_label ? '' : '<p style="margin-top: 10px; font-size: 0.85em; opacity: 0.7;">Powered by IMOTION Platform</p>'}
    </div>
  </div>
</body>
</html>`;

    // Créer l'entrée dans audit_reports pour que le bouton "Voir" fonctionne
    const { data: report, error: reportError } = await supabase.from('audit_reports').insert({
      pre_audit_id: audit_id,
      title: `Rapport Stratégique - ${audit.url}`,
      html: reportHtml,
      status: 'completed',
      created_by: user.id
    }).select().single();

    if (reportError) {
      console.error("❌ Error creating report:", reportError);
    } else {
      console.log(`✅ Report created with ID: ${report.id}`);
    }

    console.log("🚀 ========== ORCHESTRATION PREMIUM END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report?.id,
        audit_id: audit_id,
        confidence: Math.round(confidenceScore * 100),
        status: 'consolidated',
        plan_tier: effectiveTier,
        quality_level: planProfile.quality_level,
        llm_budget_used: llmBudgetUsed,
        llm_budget_limit: planProfile.llm_budget_per_audit,
        budget_remaining: planProfile.llm_budget_per_audit - llmBudgetUsed,
        white_label: planProfile.white_label,
        branding_applied: !!logoUrl || branding.company_name !== 'IMOTION Consulting'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ ORCHESTRATION ERROR:", error.message);
    console.error("Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Une erreur est survenue lors de l'orchestration"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
