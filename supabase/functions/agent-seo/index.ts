import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: SEO_SEM_SPECIALIST
 * Mission: Audit SEO complet avec roadmap + quick wins
 * Axes: Technique, Mots-clés, Backlinks, SERPs, Benchmark concurrence
 */

const requestSchema = z.object({
  url: z.string().url(),
  company_data: z.object({
    name: z.string(),
    industry: z.string().optional(),
  }),
  competitors: z.array(z.string().url()).optional(),
  depth: z.enum(['quick_check', 'standard', 'deep', 'full_audit']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🔍 ========== SEO/SEM SPECIALIST START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url, company_data, competitors, depth } = validation.data;
    console.log(`🔍 SEO audit for: ${url} (depth: ${depth})`);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = `Tu es expert SEO/SEM avec 15 ans d'expérience, 50+ audits sites top-100 FR.

MISSION: Produire audit SEO complet avec narrative + roadmap actionnaire.

AXES D'ANALYSE:

1. **AUDIT TECHNIQUE SEO**
   - Performance (Core Web Vitals, Lighthouse scores)
   - Mobile-first (responsive, mobile-friendly)
   - Crawlabilité (robots.txt, sitemap, structure URLs)
   - Indexation (pages indexées vs total, canonicalisation)
   - Structured data (Schema.org, Rich Snippets)
   - HTTPS, redirections, erreurs 404

2. **STRATÉGIE MOTS-CLÉS**
   - Volume de recherche (mensuel)
   - Difficulté/compétition (0-100)
   - Intention (informationnel, transactionnel, navigational)
   - Gaps vs concurrence
   - Opportunités long-tail

3. **BACKLINKS & AUTORITÉ**
   - Domain Authority (DA) / Domain Rating (DR)
   - Profil backlinks (quantité, qualité, diversité)
   - Backlinks toxiques à désavouer
   - Comparaison vs top 5 concurrents
   - Stratégie netlinking recommandée

4. **POSITIONNEMENT SERPs**
   - Rankings top 10/50/100
   - Featured snippets capturés
   - People Also Ask présence
   - Image pack, local pack
   - Tendances positions (up/down)

5. **BENCHMARK CONCURRENTIEL**
   - Analyse vs top 5 concurrents directs
   - Gaps mots-clés (eux oui, nous non)
   - Stratégies gagnantes identifiées

6. **QUICK WINS**
   - Actions impact rapide (< 3 mois ROI visible)
   - Priorité haute/moyenne/basse
   - Effort estimation (heures/jours)

OUTPUT JSON:
{
  "technique": {
    "core_web_vitals": {
      "lcp": "2.1s",
      "fid": "85ms",
      "cls": "0.08",
      "score": 85
    },
    "mobile_friendly": true,
    "https": true,
    "sitemap": "présent",
    "robots_txt": "optimisé",
    "indexation": {
      "pages_indexed": 142,
      "pages_total": 180,
      "ratio": "79%"
    },
    "score_technique": 82,
    "problemes_critiques": ["Canonical tags manquants sur 23 pages", "12 redirections 302 à convertir en 301"],
    "recommandations": [...]
  },
  "mots_cles": {
    "volume_mensuel_total": 45000,
    "position_moyenne": 28.5,
    "top_10": 12,
    "top_50": 47,
    "opportunities": [
      {
        "keyword": "audit marketing digital",
        "volume": 1200,
        "difficulty": 42,
        "current_position": null,
        "potential_traffic": "+800 visites/mois",
        "intention": "transactionnel"
      }
    ],
    "gaps_vs_competitors": ["keyword 1", "keyword 2"],
    "score_mots_cles": 65
  },
  "backlinks": {
    "domain_authority": 45,
    "total_backlinks": 1250,
    "referring_domains": 85,
    "backlinks_qualite": 62,
    "backlinks_toxiques": 12,
    "comparaison_concurrents": {
      "concurrent_1": { "da": 58, "backlinks": 3200 },
      "concurrent_2": { "da": 52, "backlinks": 1800 }
    },
    "score_autorite": 58,
    "strategie_netlinking": [...]
  },
  "serps": {
    "featured_snippets": 3,
    "people_also_ask": 8,
    "image_pack": 2,
    "local_pack": 0,
    "score_serps": 45
  },
  "quick_wins": [
    {
      "titre": "Optimiser meta descriptions (42 pages)",
      "impact": "Haut (+15% CTR potentiel)",
      "effort": "2 jours",
      "priorite": "haute",
      "roi_estimation": "+500 visites/mois en 6 semaines"
    }
  ],
  "narrative": "Votre site bénéficie d'une architecture technique solide (Core Web Vitals = 85/100)... CEPENDANT, la stratégie mots-clés est fragmentée... Vous capturez seulement 23% du volume de recherche pertinent vs leader du secteur... Opportunité identifiée: 145 mots-clés à difficulty 15-30 (quick wins) pourraient générer +2500 visites/mois en 90 jours...",
  "roadmap_6_mois": [
    { "mois": "M1", "actions": ["Action 1", "Action 2"], "budget": "€2k", "roi_attendu": "+800 visites" },
    { "mois": "M2", "actions": [...], "budget": "€3k", "roi_attendu": "+1200 visites" }
  ],
  "score_global_seo": 68,
  "potentiel_amelioration": "+185% trafic organique en 12 mois"
}

STYLE:
- Analytique mais accessible
- Data-driven avec chiffres concrets
- Franc sans alarmisme
- Roadmap actionnaire avec budgets/ROI

PROFONDEUR:
- quick_check: Technique + mots-clés top, 5 quick wins
- standard: Tous axes sauf benchmark détaillé, 10 quick wins
- deep: Tous axes + benchmark 3 concurrents, roadmap 6 mois
- full_audit: Exhaustif + benchmark 5 concurrents, roadmap 12 mois`;

    const competitorsList = competitors && competitors.length > 0
      ? `\n\nCONCURRENTS À ANALYSER:\n${competitors.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : '';

    const userPrompt = `Produis audit SEO/SEM complet pour:

URL: ${url}
ENTREPRISE: ${company_data.name}
SECTEUR: ${company_data.industry || 'À déterminer'}
PROFONDEUR: ${depth}${competitorsList}

Analyse SEO technique, stratégie mots-clés, backlinks, SERPs, benchmark concurrence.
${depth === 'full_audit' || depth === 'deep' ? 'Inclus roadmap détaillée 6-12 mois avec budgets et ROI.' : ''}

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    console.log("📡 Calling OpenAI API for SEO analysis...");

    const maxTokensByDepth: Record<string, number> = {
      'quick_check': 2000,
      'standard': 4000,
      'deep': 6000,
      'full_audit': 8000
    };

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: maxTokensByDepth[depth] || 4000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ OpenAI API error:", errorText);
      throw new Error(`OpenAI API failed: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const seoContent = openaiData.choices[0].message.content;

    console.log(`✅ SEO analysis generated`);

    // Parse JSON
    let seoData;
    try {
      const cleanContent = seoContent.replace(/```json\n?|\n?```/g, '').trim();
      seoData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parsing failed");
      throw new Error("Failed to parse SEO analysis");
    }

    const inputTokens = openaiData.usage?.prompt_tokens || 0;
    const outputTokens = openaiData.usage?.completion_tokens || 0;

    console.log(`📊 SEO global score: ${seoData.score_global_seo}/100`);
    console.log(`📈 Potentiel: ${seoData.potentiel_amelioration}`);
    console.log("🔍 ========== SEO/SEM SPECIALIST END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "seo_specialist",
        data: seoData,
        metadata: {
          url: url,
          company: company_data.name,
          depth: depth,
          timestamp: new Date().toISOString(),
          model_used: "gpt-4o",
          tokens: { input: inputTokens, output: outputTokens }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ SEO ERROR:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "SEO agent failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
