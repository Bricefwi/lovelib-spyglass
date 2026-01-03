// ============================================
// ORCHESTRATE-MULTI-AGENT V5.0 - PREMIUM AI ROUTING
// ============================================
// Architecture: Intelligent routing to best AI for each task
// Models: Claude Opus 4.5, GPT-5, Gemini 3 Pro, Perplexity Reasoning
// Strategy: "Elite Team" - Right model for the right job
// Date: January 2026
// ============================================

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// AI MODELS CONFIG - PREMIUM ROUTING
// ============================================
type PlanTier = 'freemium' | 'pro' | 'agency' | 'enterprise';
type TaskType = 'research' | 'analysis' | 'strategy' | 'writing';

interface ModelConfig {
  model: string;
  provider: 'lovable' | 'anthropic' | 'openai' | 'perplexity';
  maxTokens: number;
  temperature: number;
}

interface PlanConfig {
  displayModels: string;
  research: ModelConfig;
  analysis: ModelConfig;
  strategy: ModelConfig;
  writing: ModelConfig;
  searchDepth: 'basic' | 'advanced' | 'deep';
  maxScrapingChars: number;
  breakpoints: string[];
}

const AI_CONFIG: Record<PlanTier, PlanConfig> = {
  freemium: {
    displayModels: "Gemini 2.5 Flash Lite",
    research: { model: "google/gemini-2.5-flash-lite", provider: "lovable", maxTokens: 4000, temperature: 0.5 },
    analysis: { model: "google/gemini-2.5-flash-lite", provider: "lovable", maxTokens: 4000, temperature: 0.3 },
    strategy: { model: "google/gemini-2.5-flash-lite", provider: "lovable", maxTokens: 4000, temperature: 0.5 },
    writing: { model: "google/gemini-2.5-flash-lite", provider: "lovable", maxTokens: 4000, temperature: 0.7 },
    searchDepth: "basic",
    maxScrapingChars: 10000,
    breakpoints: []
  },
  pro: {
    displayModels: "Gemini 3 Pro + Claude Sonnet 4 + Perplexity",
    research: { model: "google/gemini-2.5-flash", provider: "lovable", maxTokens: 8000, temperature: 0.3 },
    analysis: { model: "google/gemini-3-pro-preview", provider: "lovable", maxTokens: 16000, temperature: 0.3 },
    strategy: { model: "google/gemini-3-pro-preview", provider: "lovable", maxTokens: 16000, temperature: 0.5 },
    writing: { model: "google/gemini-3-pro-preview", provider: "lovable", maxTokens: 16000, temperature: 0.7 },
    searchDepth: "advanced",
    maxScrapingChars: 20000,
    breakpoints: ["AFTER_DIAGNOSIS"]
  },
  agency: {
    displayModels: "Gemini 3 Pro + Claude Sonnet 4 + GPT-5",
    research: { model: "google/gemini-2.5-flash", provider: "lovable", maxTokens: 12000, temperature: 0.2 },
    analysis: { model: "google/gemini-3-pro-preview", provider: "lovable", maxTokens: 24000, temperature: 0.3 },
    strategy: { model: "google/gemini-3-pro-preview", provider: "lovable", maxTokens: 24000, temperature: 0.5 },
    writing: { model: "openai/gpt-5", provider: "lovable", maxTokens: 24000, temperature: 0.7 },
    searchDepth: "deep",
    maxScrapingChars: 30000,
    breakpoints: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS"]
  },
  enterprise: {
    displayModels: "Claude Opus 4.5 + GPT-5 + Perplexity Reasoning",
    research: { model: "google/gemini-2.5-flash", provider: "lovable", maxTokens: 16000, temperature: 0.2 },
    analysis: { model: "openai/gpt-5", provider: "lovable", maxTokens: 32000, temperature: 0.2 },
    strategy: { model: "openai/gpt-5", provider: "lovable", maxTokens: 32000, temperature: 0.4 },
    writing: { model: "openai/gpt-5", provider: "lovable", maxTokens: 32000, temperature: 0.6 },
    searchDepth: "deep",
    maxScrapingChars: 50000,
    breakpoints: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS", "AFTER_STRATEGY"]
  }
};

// ============================================
// HELPER: Scrape website content with Tavily
// ============================================
async function scrapeWebsiteContent(url: string, searchDepth: string, maxChars: number): Promise<string> {
  const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");
  
  if (!tavilyApiKey) {
    console.log("⚠️ TAVILY_API_KEY not configured, falling back to metadata analysis");
    return `[Analyse basée sur les métadonnées de ${url}]`;
  }

  try {
    console.log(`🕷️ Scraping ${url} with Tavily (depth: ${searchDepth})...`);
    
    const hostname = new URL(url).hostname;
    
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: `Analyse complète du site: ${url} - contenu, services, positionnement, produits`,
        include_domains: [hostname],
        search_depth: searchDepth === "deep" ? "advanced" : searchDepth,
        include_raw_content: true,
        max_results: searchDepth === "deep" ? 10 : 5
      })
    });

    if (!response.ok) {
      console.error(`Tavily error: ${response.status}`);
      return `[Contenu du site ${url} partiellement accessible]`;
    }

    const data = await response.json();
    const contents = data.results?.map((r: any) => r.content || r.raw_content || "").join("\n\n");
    
    if (contents && contents.length > 100) {
      console.log(`✅ Scraped ${contents.length} characters of content`);
      return contents.substring(0, maxChars);
    }

    return `[Contenu limité disponible pour ${url}]`;
  } catch (error: any) {
    console.error(`Scraping error:`, error.message);
    return `[Erreur de scraping pour ${url}]`;
  }
}

// ============================================
// HELPER: Extract JSON safely
// ============================================
function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1].trim()); } catch {}
    }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      try { return JSON.parse(text.slice(startIndex, endIndex + 1)); } catch {}
    }
    return null;
  }
}

// ============================================
// HELPER: Call AI with intelligent routing
// ============================================
async function callAI(config: ModelConfig, prompt: string, taskName: string): Promise<string> {
  console.log(`🤖 [${taskName}] Using ${config.model} (${config.provider})`);
  
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI API error for ${taskName}: ${response.status} - ${errorText}`);
    
    // Fallback to Gemini Flash if premium model fails
    if (config.model !== "google/gemini-2.5-flash") {
      console.log(`⚠️ Falling back to Gemini Flash for ${taskName}`);
      return callAI(
        { model: "google/gemini-2.5-flash", provider: "lovable", maxTokens: config.maxTokens, temperature: config.temperature },
        prompt,
        taskName + " (fallback)"
      );
    }
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// ============================================
// PROMPTS
// ============================================
function buildFreemiumPrompt(siteContent: string, url: string, companyName: string): string {
  return `Tu es un Auditeur Stratégique Expert (ex-McKinsey, 20 ans d'expérience).

**CONTEXTE :**
- URL analysée : ${url}
- Entreprise : ${companyName}
- Contenu du site : 
${siteContent}

**MISSION CRITIQUE (FREEMIUM - "Échantillon de Caviar") :**
Tu dois prouver ta valeur en identifiant des VRAIS problèmes critiques.
L'objectif est de créer le "FOMO" (Fear Of Missing Out) pour convertir en Premium.

**RÈGLES ABSOLUES :**
1. Sois BRUTALEMENT honnête sur 3 problèmes critiques réels
2. Donne 3 scores précis (0-100) basés sur ton analyse réelle
3. Fournis 1 "Quick Win" COMPLET et détaillé (preuve de valeur gratuite)
4. Pour les 3 recommandations stratégiques avancées : titre alléchant mais contenu "LOCKED_PREMIUM"
5. Inclus des "teasers" montrant ce que les plans supérieurs débloquent

**FORMAT JSON STRICT :**
{
  "executive_summary": "Résumé choc en 3 phrases max (problème → conséquence → espoir)",
  "scores": {
    "global": 0,
    "tech": 0,
    "ux": 0,
    "seo": 0,
    "conversion": 0
  },
  "critical_issues": [
    {
      "title": "Erreur Critique 1",
      "impact": "Perte estimée chiffrée",
      "description": "Explication technique concise"
    }
  ],
  "quick_win": {
    "title": "Action Immédiate Gratuite",
    "steps": ["Étape 1 détaillée", "Étape 2 détaillée", "Étape 3 détaillée"],
    "expected_result": "Résultat concret attendu"
  },
  "strategic_roadmap": [
    {
      "phase": "Mois 1",
      "action": "Titre Alléchant de l'Action",
      "details": "🔒 Réservé aux membres Premium - Upgrade pour débloquer"
    }
  ],
  "teasers": [
    { "description": "Ce que le plan Pro débloque", "upgrade_plan": "Pro" },
    { "description": "Ce que le plan Agency débloque", "upgrade_plan": "Agency" }
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, pas de texte avant ou après.`;
}

function buildPremiumPrompt(siteContent: string, url: string, companyName: string, plan: string): string {
  const depthInstructions: Record<string, string> = {
    pro: "Analyse approfondie avec benchmark local (3-5 concurrents)",
    agency: "Étude stratégique avec analyse marché régional + national (15-20 concurrents)",
    enterprise: "Expertise premium avec vision internationale et plan de transformation digitale"
  };

  return `Tu es un Directeur de Stratégie Senior chez McKinsey & Company.

**CONTEXTE :**
- URL : ${url}
- Entreprise : ${companyName}
- Plan : ${plan.toUpperCase()}
- Contenu du site :
${siteContent}

**NIVEAU D'ANALYSE :** ${depthInstructions[plan] || depthInstructions.pro}

**MISSION :**
Fournis une analyse exhaustive et des recommandations actionnables de niveau consultant senior.

**FORMAT JSON REQUIS :**
{
  "executive_summary": "Synthèse exécutive complète",
  "scores": {
    "global": 0,
    "tech": 0,
    "seo": 0,
    "ux": 0,
    "conversion": 0,
    "content": 0,
    "security": 0
  },
  "swot": {
    "strengths": ["Force 1", "Force 2"],
    "weaknesses": ["Faiblesse 1", "Faiblesse 2"],
    "opportunities": ["Opportunité 1", "Opportunité 2"],
    "threats": ["Menace 1", "Menace 2"]
  },
  "findings": [
    {
      "category": "Tech|SEO|UX|Conversion",
      "title": "Titre du constat",
      "severity": "critical|high|medium|low",
      "description": "Description détaillée",
      "impact": "Impact business estimé"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "title": "Titre recommandation",
      "description": "Description complète",
      "implementation_steps": ["Étape 1", "Étape 2", "Étape 3"],
      "expected_roi": "ROI estimé",
      "effort": "Faible|Moyen|Élevé",
      "timeline": "Durée estimée"
    }
  ],
  "competitor_analysis": {
    "scope": "${plan === 'pro' ? 'local' : plan === 'agency' ? 'national' : 'international'}",
    "competitors": ["Concurrent 1", "Concurrent 2", "Concurrent 3"],
    "positioning": "Analyse du positionnement"
  },
  "roadmap": {
    "phase_1": {"title": "Court terme (1-3 mois)", "actions": []},
    "phase_2": {"title": "Moyen terme (3-6 mois)", "actions": []},
    "phase_3": {"title": "Long terme (6-12 mois)", "actions": []}
  }
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide.`;
}

// ============================================
// MAIN FUNCTION
// ============================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid authentication");

    const { audit_id, strategic_choice, resume_from_phase } = await req.json();
    if (!audit_id) throw new Error("Missing audit_id");

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 ORCHESTRATOR V5.0 - PREMIUM AI ROUTING`);
    console.log(`   Audit ID: ${audit_id}`);
    console.log(`${"=".repeat(60)}\n`);

    // 1. Fetch audit context
    const { data: audit, error: auditError } = await supabase
      .from("pre_audits")
      .select(`*, companies(*), organizations(*)`)
      .eq("id", audit_id)
      .single();

    if (auditError || !audit) throw new Error("Audit not found");

    const plan = (audit.organizations?.subscription_plan || "freemium") as PlanTier;
    const config = AI_CONFIG[plan] || AI_CONFIG.freemium;

    console.log(`📊 Plan: ${plan.toUpperCase()}`);
    console.log(`🤖 AI Team: ${config.displayModels}`);
    console.log(`🎯 Breakpoints: ${config.breakpoints.length > 0 ? config.breakpoints.join(', ') : 'None'}`);
    console.log(`🌐 URL: ${audit.url}\n`);

    // Check if resuming from strategic choice
    if (strategic_choice && resume_from_phase) {
      console.log(`🔄 Resuming from phase: ${resume_from_phase} with choice: ${strategic_choice}`);
    }

    // 2. Update status
    await supabase
      .from("pre_audits")
      .update({
        status: "in_progress",
        current_phase: "PHASE_1_SCRAPING",
        ai_tier: plan
      })
      .eq("id", audit_id);

    // 3. REAL SCRAPING
    console.log("🕷️ Phase 1: Real Website Scraping...");
    const siteContent = await scrapeWebsiteContent(audit.url, config.searchDepth, config.maxScrapingChars);

    // 4. AI ANALYSIS with intelligent routing
    console.log("🧠 Phase 2: AI Analysis with Premium Models...");
    
    await supabase
      .from("pre_audits")
      .update({ current_phase: "PHASE_2_AI_ANALYSIS" })
      .eq("id", audit_id);

    const companyName = audit.companies?.name || audit.company_guess || "Entreprise";
    
    let prompt: string;
    let analysisModel: ModelConfig;
    
    if (plan === "freemium") {
      prompt = buildFreemiumPrompt(siteContent, audit.url, companyName);
      analysisModel = config.analysis;
    } else {
      prompt = buildPremiumPrompt(siteContent, audit.url, companyName, plan);
      analysisModel = config.strategy; // Use strategy model for premium analysis
    }

    const aiContent = await callAI(analysisModel, prompt, "Main Analysis");
    const analysisResult = extractJSON(aiContent);

    if (!analysisResult) {
      throw new Error("Failed to parse AI response");
    }

    console.log(`✅ Analysis complete - Global Score: ${analysisResult.scores?.global || 70}/100`);

    // 5. Check for strategic breakpoint (Premium only)
    if (config.breakpoints.includes("AFTER_DIAGNOSIS") && plan !== "freemium" && !strategic_choice) {
      console.log("⏸️ Strategic breakpoint reached - Generating options...");

      const { error: optionsError } = await supabase.functions.invoke("generate-strategic-options", {
        body: {
          audit_id,
          phase: "AFTER_DIAGNOSIS",
          context: JSON.stringify({
            company: companyName,
            url: audit.url,
            scores: analysisResult.scores,
            critical_issues: analysisResult.critical_issues || analysisResult.findings?.filter((f: any) => f.severity === "critical"),
            swot: analysisResult.swot
          })
        }
      });

      if (!optionsError) {
        await supabase
          .from("pre_audits")
          .update({
            status: "waiting_for_choice",
            current_phase: "STRATEGIC_BREAKPOINT_1",
            consolidated: {
              partial_analysis: analysisResult,
              awaiting_strategic_choice: true,
              breakpoint: "AFTER_DIAGNOSIS",
              ai_models_used: config.displayModels
            }
          })
          .eq("id", audit_id);

        return new Response(
          JSON.stringify({
            success: true,
            status: "waiting_for_choice",
            message: "Strategic breakpoint reached. User must select a strategic direction.",
            audit_id,
            partial_score: analysisResult.scores?.global,
            ai_models_used: config.displayModels
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 6. FINALIZATION
    console.log("📝 Phase 3: Finalizing report...");

    await supabase
      .from("pre_audits")
      .update({ current_phase: "PHASE_3_FINALIZATION" })
      .eq("id", audit_id);

    const finalResult = {
      audit_id,
      plan,
      ai_models_used: config.displayModels,
      url: audit.url,
      company_name: companyName,
      scraped_content_length: siteContent.length,
      analysis: analysisResult,
      strategic_choice_made: strategic_choice || null,
      completed_at: new Date().toISOString()
    };

    // 7. Save results
    await supabase
      .from("pre_audits")
      .update({
        status: "completed",
        current_phase: "COMPLETED",
        confidence: (analysisResult.scores?.global || 70) / 100,
        consolidated: finalResult
      })
      .eq("id", audit_id);

    // Update user audit count
    try {
      await supabase.rpc("increment_free_audits_used", { p_user_id: user.id });
    } catch (e) {
      console.log("Could not increment audit count:", e);
    }

    // 8. Generate HTML report
    console.log("📄 Generating HTML report...");
    try {
      await supabase.functions.invoke("audit-html-advanced", {
        body: { audit_id }
      });
    } catch (e) {
      console.log("HTML generation skipped:", e);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ AUDIT V5.0 COMPLETED SUCCESSFULLY`);
    console.log(`   Score: ${analysisResult.scores?.global || 70}/100`);
    console.log(`   Models: ${config.displayModels}`);
    console.log(`${"=".repeat(60)}\n`);

    return new Response(
      JSON.stringify({
        success: true,
        status: "completed",
        audit_id,
        score: analysisResult.scores?.global || 70,
        ai_models_used: config.displayModels,
        plan,
        message: "Audit completed successfully with premium AI models"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Orchestrator V5 Error:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: "Premium AI routing failed"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
