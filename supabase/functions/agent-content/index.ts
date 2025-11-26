import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: CONTENT_MARKETING_SPECIALIST
 * Mission: Évaluer stratégie contenu + créer calendar éditorial + ROI
 */

const requestSchema = z.object({
  company_data: z.object({
    name: z.string(),
    industry: z.string().optional(),
    target_audience: z.string().optional(),
  }),
  current_content: z.object({
    blog_frequency: z.string().optional(),
    content_types: z.array(z.string()).optional(),
  }).optional(),
  seo_data: z.any().optional(),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📝 ========== CONTENT MARKETING START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, current_content, seo_data, depth } = validation.data;
    console.log(`📝 Content strategy for: ${company_data.name}`);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = `Tu es expert en Content Marketing avec focus B2B/SaaS.

MISSION: Évaluer stratégie contenu actuelle + proposer stratégie optimisée + calendar éditorial.

AXES D'ANALYSE:

1. **AUDIT CONTENU EXISTANT**
   - Volume production (articles/mois)
   - Types formats (blog, vidéo, infographies, études de cas)
   - Qualité rédactionnelle (profondeur, expertise)
   - Performance (trafic, engagement, conversions)
   - Gaps thématiques vs SEO opportunities

2. **STRATÉGIE CONTENU**
   - Piliers thématiques (3-5 piliers)
   - Buyer personas ciblés
   - Funnel mapping (ToFu, MoFu, BoFu)
   - Content mix optimal (% par format)
   - Fréquence publication recommandée

3. **CALENDAR ÉDITORIAL**
   - 3 mois de contenus planifiés
   - Thématiques + formats + CTA
   - Saisonnalité / événements secteur
   - Efforts production (heures)

4. **DISTRIBUTION & AMPLIFICATION**
   - Canaux prioritaires (organic, social, email, paid)
   - Stratégie SEO intégrée
   - Repurposing multi-formats
   - Partenariats / guest blogging

5. **MESURE PERFORMANCE & ROI**
   - KPIs tracking (trafic, leads, conversions)
   - Attribution modèle
   - ROI attendu par type contenu
   - Outils recommandés

OUTPUT JSON:
{
  "audit_existant": {
    "volume_mensuel": "4 articles/mois",
    "formats": ["blog", "cas client"],
    "score_qualite": 72,
    "performance": {
      "trafic_mensuel": 2500,
      "leads_generes": 12,
      "taux_conversion": "0.48%"
    },
    "gaps_critiques": ["Absence vidéo", "Pas d'études de cas détaillées", "SEO faible"]
  },
  "strategie_proposee": {
    "piliers_thematiques": [
      {
        "pilier": "Transformation Digitale",
        "sous_themes": ["IA", "Automation", "Data"],
        "opportunite_seo": "12000 recherches/mois",
        "competition": "moyenne"
      }
    ],
    "content_mix": {
      "blog_long_form": "40%",
      "video": "20%",
      "etudes_cas": "15%",
      "infographies": "10%",
      "webinars": "10%",
      "templates": "5%"
    },
    "frequence": "8-12 contenus/mois",
    "budget_production": "€4-6k/mois"
  },
  "calendar_3_mois": [
    {
      "semaine": "S1 Janvier",
      "contenu": "Guide: 10 stratégies automation marketing 2025",
      "format": "blog long-form (2500 mots)",
      "funnel": "ToFu",
      "keywords_cibles": ["automation marketing", "stratégies 2025"],
      "effort": "8h",
      "distribution": ["organic", "linkedin", "newsletter"],
      "roi_attendu": "+150 leads/trimestre"
    }
  ],
  "distribution": {
    "organic_seo": {
      "priorite": "haute",
      "actions": ["Optimisation on-page", "Internal linking", "Content refresh"]
    },
    "social_media": {
      "canaux": ["LinkedIn", "Twitter"],
      "frequence": "3-5 posts/semaine"
    },
    "email": {
      "newsletters": "bi-mensuelle",
      "nurturing": "4 séquences"
    }
  },
  "roi_projections": {
    "trafic_m12": "+185% (de 2500 à 7125 visites/mois)",
    "leads_m12": "+220% (de 12 à 38 leads/mois)",
    "investissement_annuel": "€50-70k",
    "roi_attendu": "3.5x - 4.2x"
  },
  "narrative": "Votre stratégie contenu actuelle génère 2500 visites/mois mais souffre de 3 faiblesses majeures... En pivotant vers une approche piliers thématiques SEO + diversification formats (vidéo 20%, études de cas 15%), nous projetons +185% trafic organique en 12 mois...",
  "score_strategie_actuelle": 58,
  "score_strategie_proposee": 85
}

STYLE: Stratégique, data-driven, ROI-focused, actionnable.`;

    const seoContext = seo_data?.data?.mots_cles
      ? `\n\nOPPORTUNITÉS SEO IDENTIFIÉES:\n${JSON.stringify(seo_data.data.mots_cles.opportunities || [], null, 2)}`
      : '';

    const userPrompt = `Produis stratégie Content Marketing complète pour:

ENTREPRISE: ${company_data.name}
SECTEUR: ${company_data.industry || 'B2B/SaaS'}
AUDIENCE: ${company_data.target_audience || 'Décideurs marketing & commercial'}
PROFONDEUR: ${depth}

${current_content ? `CONTENU ACTUEL:\n${JSON.stringify(current_content, null, 2)}` : ''}
${seoContext}

Analyse actuel + propose stratégie optimisée + calendar 3 mois + ROI.

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    console.log("📡 Calling OpenAI API for Content strategy...");

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
        max_completion_tokens: depth === 'deep' ? 6000 : depth === 'standard' ? 4000 : 2500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API failed: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const contentData = JSON.parse(
      openaiData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim()
    );

    console.log(`📊 Content score: ${contentData.score_strategie_proposee}/100`);
    console.log("📝 ========== CONTENT MARKETING END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "content_specialist",
        data: contentData,
        metadata: {
          company: company_data.name,
          depth: depth,
          timestamp: new Date().toISOString(),
          model_used: "gpt-4o",
          tokens: {
            input: openaiData.usage?.prompt_tokens || 0,
            output: openaiData.usage?.completion_tokens || 0
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ CONTENT ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message, details: "Content agent failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
