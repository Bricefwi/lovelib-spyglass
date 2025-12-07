// ============================================
// ORCHESTRATE-MULTI-AGENT V4.0 - PRODUCT-LED GROWTH
// ============================================
// Architecture: Real scraping + Strategic breakpoints + Teasing psychology
// Strategy: "Échantillon de caviar" - Quality even for freemium
// Date: December 2025
// ============================================

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// AI ROSTER - "Elite Team" Configuration
// ============================================
const AI_ROSTER = {
  freemium: {
    researcher: "google/gemini-2.5-flash-lite",
    strategist: "google/gemini-2.5-flash-lite",
    writer: "google/gemini-2.5-flash-lite",
    model_description: "Gemini Flash Lite - Diagnostic Express",
    max_tokens: 4000,
    search_depth: "basic"
  },
  pro: {
    researcher: "google/gemini-2.5-flash",
    strategist: "google/gemini-2.5-flash",
    writer: "google/gemini-2.5-flash",
    model_description: "Gemini Flash - Analyse Approfondie",
    max_tokens: 12000,
    search_depth: "advanced"
  },
  agency: {
    researcher: "google/gemini-2.5-pro",
    strategist: "google/gemini-2.5-pro",
    writer: "google/gemini-2.5-pro",
    model_description: "Gemini Pro - Étude Stratégique",
    max_tokens: 24000,
    search_depth: "advanced"
  },
  enterprise: {
    researcher: "google/gemini-2.5-pro",
    strategist: "google/gemini-2.5-pro",
    writer: "google/gemini-2.5-pro",
    model_description: "Gemini Pro - Expertise Premium",
    max_tokens: 32000,
    search_depth: "advanced"
  }
};

// ============================================
// STRATEGIC BREAKPOINTS - Where to pause for user choice
// ============================================
const STRATEGIC_BREAKPOINTS: Record<string, string[]> = {
  freemium: [], // No breakpoints for free tier
  pro: ["AFTER_DIAGNOSIS"], // One choice after diagnosis
  agency: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS"], // Two choices
  enterprise: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS", "AFTER_STRATEGY"] // Three choices
};

// ============================================
// HELPER: Scrape website content with Tavily
// ============================================
async function scrapeWebsiteContent(url: string, searchDepth: string): Promise<string> {
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
        query: `Analyse complète du site: ${url} - contenu, services, positionnement`,
        include_domains: [hostname],
        search_depth: searchDepth,
        include_raw_content: true,
        max_results: 5
      })
    });

    if (!response.ok) {
      console.error(`Tavily error: ${response.status}`);
      return `[Contenu du site ${url} partiellement accessible]`;
    }

    const data = await response.json();
    
    // Combine all results for richer context
    const contents = data.results?.map((r: any) => r.content || r.raw_content || "").join("\n\n");
    
    if (contents && contents.length > 100) {
      console.log(`✅ Scraped ${contents.length} characters of content`);
      return contents.substring(0, 15000); // Limit to avoid token overflow
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
    // Try markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {}
    }
    // Try raw JSON extraction
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      try {
        return JSON.parse(text.slice(startIndex, endIndex + 1));
      } catch {}
    }
    return null;
  }
}

// ============================================
// HELPER: Call AI with model selection
// ============================================
async function callAI(model: string, prompt: string, maxTokens: number): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI API error: ${response.status} - ${errorText}`);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

// ============================================
// PROMPT: Freemium "Teaser" Audit
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
    {
      "description": "Ce que le plan Pro débloque",
      "upgrade_plan": "Pro"
    },
    {
      "description": "Ce que le plan Agency débloque",
      "upgrade_plan": "Agency"
    }
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, pas de texte avant ou après.`;
}

// ============================================
// PROMPT: Premium Full Analysis
// ============================================
function buildPremiumPrompt(
  siteContent: string, 
  url: string, 
  companyName: string, 
  plan: string
): string {
  const depthInstructions = {
    pro: "Analyse approfondie avec benchmark local (3-5 concurrents)",
    agency: "Étude stratégique avec analyse marché régional + national (15-20 concurrents)",
    enterprise: "Expertise premium avec vision internationale et plan de transformation"
  };

  return `Tu es un Directeur de Stratégie Senior chez McKinsey & Company.

**CONTEXTE :**
- URL : ${url}
- Entreprise : ${companyName}
- Plan : ${plan.toUpperCase()}
- Contenu du site :
${siteContent}

**NIVEAU D'ANALYSE :** ${depthInstructions[plan as keyof typeof depthInstructions] || depthInstructions.pro}

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

    console.log(`\n${"=".repeat(50)}`);
    console.log(`🚀 AUDIT V4.0 PRODUCT-LED GROWTH`);
    console.log(`   ID: ${audit_id}`);
    console.log(`${"=".repeat(50)}\n`);

    // 1. Récupérer le contexte
    const { data: audit, error: auditError } = await supabase
      .from("pre_audits")
      .select(`*, companies(*), organizations(*)`)
      .eq("id", audit_id)
      .single();

    if (auditError || !audit) throw new Error("Audit not found");

    const plan = audit.organizations?.subscription_plan || "freemium";
    const roster = AI_ROSTER[plan as keyof typeof AI_ROSTER] || AI_ROSTER.freemium;
    const breakpoints = STRATEGIC_BREAKPOINTS[plan as keyof typeof STRATEGIC_BREAKPOINTS] || [];

    console.log(`📊 Plan: ${plan.toUpperCase()}`);
    console.log(`🤖 AI Team: ${roster.model_description}`);
    console.log(`🎯 Breakpoints: ${breakpoints.length > 0 ? breakpoints.join(', ') : 'None'}`);
    console.log(`🌐 URL: ${audit.url}\n`);

    // Check if resuming from a strategic choice
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

    // 3. REAL SCRAPING (Core of Product-Led Growth)
    console.log("🕷️ Phase 1: Real Website Scraping...");
    const siteContent = await scrapeWebsiteContent(audit.url, roster.search_depth);

    // 4. AI ANALYSIS
    console.log("🧠 Phase 2: AI Analysis...");
    
    await supabase
      .from("pre_audits")
      .update({ current_phase: "PHASE_2_AI_ANALYSIS" })
      .eq("id", audit_id);

    const companyName = audit.companies?.name || audit.company_guess || "Entreprise";
    
    let prompt: string;
    if (plan === "freemium") {
      prompt = buildFreemiumPrompt(siteContent, audit.url, companyName);
    } else {
      prompt = buildPremiumPrompt(siteContent, audit.url, companyName, plan);
    }

    const aiContent = await callAI(roster.strategist, prompt, roster.max_tokens);
    const analysisResult = extractJSON(aiContent);

    if (!analysisResult) {
      throw new Error("Failed to parse AI response");
    }

    console.log(`✅ Analysis complete - Global Score: ${analysisResult.scores?.global || 70}/100`);

    // 5. Check for strategic breakpoint (Premium only)
    if (breakpoints.includes("AFTER_DIAGNOSIS") && plan !== "freemium" && !strategic_choice) {
      console.log("⏸️ Strategic breakpoint reached - Generating options...");

      // Generate strategic options
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

      if (optionsError) {
        console.error("Error generating strategic options:", optionsError);
        // Continue without breakpoint if error
      } else {
        // Pause the audit and wait for user choice
        await supabase
          .from("pre_audits")
          .update({
            status: "waiting_for_choice",
            current_phase: "STRATEGIC_BREAKPOINT_1",
            consolidated: {
              partial_analysis: analysisResult,
              awaiting_strategic_choice: true,
              breakpoint: "AFTER_DIAGNOSIS"
            }
          })
          .eq("id", audit_id);

        return new Response(
          JSON.stringify({
            success: true,
            status: "waiting_for_choice",
            message: "Strategic breakpoint reached. User must select a strategic direction.",
            audit_id,
            partial_score: analysisResult.scores?.global
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

    // Build final consolidated result
    const finalResult = {
      audit_id,
      plan,
      ai_model: roster.model_description,
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
      console.warn("Could not increment audit count:", e);
    }

    // 8. Trigger HTML report generation
    try {
      await supabase.functions.invoke("audit-html", {
        body: { audit_id }
      });
      console.log("📄 HTML report generation triggered");
    } catch (e) {
      console.warn("Could not trigger HTML generation:", e);
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`🎯 AUDIT COMPLETED`);
    console.log(`   Score: ${analysisResult.scores?.global || 70}/100`);
    console.log(`   Plan: ${plan}`);
    console.log(`${"=".repeat(50)}\n`);

    return new Response(
      JSON.stringify({
        success: true,
        status: "completed",
        audit_id,
        global_score: analysisResult.scores?.global || 70,
        plan,
        ai_model: roster.model_description,
        has_teasers: plan === "freemium" && analysisResult.teasers?.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
