// ============================================
// MARKET INTELLIGENCE & COMPETITIVE BENCHMARKING
// ============================================
// Advanced market analysis and competitor research by subscription tier

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MarketIntelligenceRequest {
  auditId: string;
  url: string;
  companyName: string;
  sector?: string;
  location?: string;
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { auditId, url, companyName, sector, location, plan }: MarketIntelligenceRequest = await req.json();

    console.log(`🔍 Market Intelligence for ${companyName} (${plan} plan)`);

    // Determine scope based on plan
    const scope = getScopeForPlan(plan);
    console.log(`📊 Scope: ${scope.competitorCount} competitors, ${scope.marketScope} market`);

    // Step 1: Identify competitors
    const competitors = await identifyCompetitors(url, sector, location, scope.competitorCount);
    console.log(`✅ Identified ${competitors.length} competitors`);

    // Step 2: Analyze each competitor
    const competitorAnalyses = [];
    for (const competitor of competitors) {
      const analysis = await analyzeCompetitor(competitor, plan);
      competitorAnalyses.push(analysis);
    }

    // Step 3: Market analysis (if plan allows)
    let marketAnalysis = null;
    if (plan === 'agency' || plan === 'enterprise') {
      marketAnalysis = await analyzeMarket(sector, location, scope.marketScope, plan);
    }

    // Step 4: Pricing intelligence (Enterprise only)
    let pricingIntelligence = null;
    if (plan === 'enterprise') {
      pricingIntelligence = await analyzePricing(competitors);
    }

    // Step 5: Generate strategic recommendations
    const recommendations = await generateRecommendations(
      companyName,
      url,
      competitors,
      competitorAnalyses,
      marketAnalysis,
      plan
    );

    // Save results to database
    const result = {
      competitors: competitorAnalyses,
      market_analysis: marketAnalysis,
      pricing_intelligence: pricingIntelligence,
      recommendations,
      scope: scope.marketScope,
      generated_at: new Date().toISOString()
    };

    await supabase
      .from('pre_audits')
      .update({ 
        market_intelligence: result,
        updated_at: new Date().toISOString()
      })
      .eq('id', auditId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Market Intelligence error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getScopeForPlan(plan: string) {
  const scopes: Record<string, any> = {
    freemium: {
      competitorCount: 0,
      marketScope: 'none'
    },
    pro: {
      competitorCount: 5,
      marketScope: 'local'
    },
    agency: {
      competitorCount: 15,
      marketScope: 'regional/national'
    },
    enterprise: {
      competitorCount: 25,
      marketScope: 'international'
    }
  };
  return scopes[plan] || scopes.freemium;
}

async function identifyCompetitors(
  url: string,
  sector: string | undefined,
  location: string | undefined,
  count: number
): Promise<string[]> {
  if (count === 0) return [];

  const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");
  if (!tavilyApiKey) {
    console.log("⚠️ TAVILY_API_KEY not configured");
    return [];
  }

  try {
    const domain = new URL(url).hostname;
    const query = `concurrents directs de ${domain} ${sector || ''} ${location || ''} site web`;

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query,
        search_depth: "advanced",
        max_results: count,
        include_domains: [], // Exclude the client's own domain
        exclude_domains: [domain]
      })
    });

    if (!response.ok) {
      console.error(`Tavily error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const competitors = data.results?.map((r: any) => r.url).filter(Boolean) || [];
    
    return competitors.slice(0, count);
  } catch (error: any) {
    console.error("Competitor identification error:", error.message);
    return [];
  }
}

async function analyzeCompetitor(competitorUrl: string, plan: string): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const model = plan === 'pro' ? 'google/gemini-2.5-flash' : 'google/gemini-2.5-pro';

  const prompt = `Analyse ce concurrent : ${competitorUrl}

Fournis une analyse structurée en JSON :
{
  "name": "Nom de l'entreprise",
  "url": "${competitorUrl}",
  "positioning": "Positionnement marché",
  "strengths": ["Force 1", "Force 2", ...],
  "weaknesses": ["Faiblesse 1", "Faiblesse 2", ...],
  "pricing_strategy": "Stratégie de prix observée",
  "unique_value_proposition": "Proposition de valeur unique",
  "target_audience": "Audience cible",
  "marketing_channels": ["Canal 1", "Canal 2", ...],
  "estimated_traffic": "Estimation du trafic",
  "key_differentiators": ["Différenciateur 1", ...]
}`;

  try {
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
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error(`AI API error: ${response.status}`);
      return { url: competitorUrl, error: "Analysis failed" };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { url: competitorUrl, error: "Could not parse analysis" };
  } catch (error: any) {
    console.error(`Competitor analysis error for ${competitorUrl}:`, error.message);
    return { url: competitorUrl, error: error.message };
  }
}

async function analyzeMarket(
  sector: string | undefined,
  location: string | undefined,
  scope: string,
  plan: string
): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const model = 'google/gemini-2.5-pro';

  const prompt = `Tu es un Consultant en Stratégie de Marché (ex-BCG).

Analyse le marché suivant :
- Secteur : ${sector || 'Non spécifié'}
- Zone géographique : ${location || 'Non spécifiée'}
- Scope : ${scope}

Fournis une analyse de marché complète en JSON :
{
  "market_overview": {
    "size_estimate": "Taille du marché estimée",
    "growth_rate": "Taux de croissance annuel",
    "maturity_stage": "emerging|growth|mature|declining",
    "key_trends": ["Tendance 1", "Tendance 2", ...]
  },
  "pestel_analysis": {
    "political": ["Facteur politique 1", ...],
    "economic": ["Facteur économique 1", ...],
    "social": ["Facteur social 1", ...],
    "technological": ["Facteur technologique 1", ...],
    "environmental": ["Facteur environnemental 1", ...],
    "legal": ["Facteur légal 1", ...]
  },
  "porter_five_forces": {
    "threat_new_entrants": {"score": 0-10, "analysis": "string"},
    "bargaining_power_suppliers": {"score": 0-10, "analysis": "string"},
    "bargaining_power_buyers": {"score": 0-10, "analysis": "string"},
    "threat_substitutes": {"score": 0-10, "analysis": "string"},
    "competitive_rivalry": {"score": 0-10, "analysis": "string"}
  },
  "growth_opportunities": [
    {
      "title": "string",
      "description": "string",
      "market_potential": "string",
      "investment_required": "string",
      "timeline": "string",
      "roi_estimate": "string"
    }
  ]
}`;

  try {
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
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      console.error(`AI API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error: any) {
    console.error("Market analysis error:", error.message);
    return null;
  }
}

async function analyzePricing(competitors: string[]): Promise<any> {
  // Pricing intelligence for Enterprise plan
  // This would involve scraping competitor pricing pages and analyzing pricing strategies
  
  return {
    note: "Pricing intelligence requires manual competitor pricing data collection",
    competitors_analyzed: competitors.length,
    recommendation: "Contact our team for detailed pricing intelligence report"
  };
}

async function generateRecommendations(
  companyName: string,
  url: string,
  competitors: string[],
  competitorAnalyses: any[],
  marketAnalysis: any,
  plan: string
): Promise<any[]> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const model = 'google/gemini-2.5-pro';

  const prompt = `Tu es un Consultant Stratégique Senior.

Génère des recommandations stratégiques pour ${companyName} (${url}) basées sur :

**Concurrents analysés :**
${JSON.stringify(competitorAnalyses, null, 2)}

**Analyse de marché :**
${marketAnalysis ? JSON.stringify(marketAnalysis, null, 2) : 'Non disponible'}

Fournis 5-7 recommandations stratégiques actionnables en JSON :
[
  {
    "title": "string",
    "description": "string (400+ mots, très détaillé)",
    "priority": "high|medium|low",
    "expected_impact": "string",
    "implementation_steps": ["étape 1", "étape 2", ...],
    "estimated_cost": "string",
    "timeline": "string",
    "kpis": ["KPI 1", "KPI 2", ...],
    "risks": ["risque 1", ...],
    "mitigation_strategies": ["stratégie 1", ...]
  }
]`;

  try {
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
        max_tokens: 6000
      }),
    });

    if (!response.ok) {
      console.error(`AI API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error: any) {
    console.error("Recommendations generation error:", error.message);
    return [];
  }
}
