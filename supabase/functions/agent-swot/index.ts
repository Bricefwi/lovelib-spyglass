import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: SWOT_STRATEGIST
 * Mission: SWOT narrative riche qui raconte une histoire stratégique
 * Style: Laboratoire Perplexity - insights non-obvieux
 */

const requestSchema = z.object({
  company_data: z.any(),
  scraper_data: z.any().optional(),
  pestel_data: z.any().optional(),
  porter_data: z.any().optional(),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🎯 ========== SWOT STRATEGIST START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, scraper_data, pestel_data, porter_data, depth } = validation.data;
    console.log(`🎯 SWOT for: ${company_data.name}`);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const systemPrompt = `Tu es stratégiste reconnu. Construis une SWOT qui raconte une histoire stratégique.

MISSION: Transformer données brutes en narrative stratégique cohérente et captivante.

Chaque section (Forces/Faiblesses/Opportunités/Menaces) doit:
1. Être basée UNIQUEMENT sur données vérifiées (scores confiance scraper, analyses PESTEL/Porter)
2. Contextualiser par environnement macro (PESTEL) et concurrentiel (Porter)
3. Écrire en NARRATIF RICHE - Style Laboratoire Perplexity (pas de listes brutes!)
4. Identifier 3-5 INSIGHTS CLÉS par section (non-obvieux, angles originaux)
5. Proposer ACTIONS IMMÉDIATES transformant points en stratégie

OUTPUT JSON:
{
  "forces": {
    "narrative": "L'entreprise jouit d'une position privilégiée en tant que leader du marché français (analyse Porter: score fournisseurs 3/5 = pouvoir négociation fort)... Forte brand equity (85% notoriété top-of-mind Île-de-France selon scraper confidence 92%)... Historique 30 ans = confiance client durable (NPS 72, retention 89%)...",
    "points_cles": [
      {
        "titre": "Brand Recognition & Customer Trust",
        "detail": "30 ans marché, 85% notoriété, NPS 72, retention 89%",
        "implication": "Avantage compétitif durable vs nouveaux entrants (barrière 7/10 Porter)",
        "levier_strategique": "Monétiser confiance via offres premium/white-label/API",
        "potentiel_roi": "+25-35% revenus en 18 mois"
      }
    ],
    "score_forces": 8.2,
    "actions_immediates": ["Lancer offre premium", "Programme partenariats", "API B2B"]
  },
  "faiblesses": {
    "narrative": "...",
    "points_cles": [...],
    "score_faiblesses": 4.5,
    "actions_immediates": [...]
  },
  "opportunites": {
    "narrative": "...",
    "points_cles": [...],
    "score_opportunites": 7.8,
    "actions_immediates": [...]
  },
  "menaces": {
    "narrative": "...",
    "points_cles": [...],
    "score_menaces": 5.2,
    "actions_immediates": [...]
  },
  "synthese_strategique": {
    "position_globale": "Force dominante avec opportunités significatives",
    "score_swot_global": 7.5,
    "priorites": ["Priorité 1", "Priorité 2", "Priorité 3"],
    "recommandation_principale": "Stratégie de différenciation premium...",
    "horizon": "12-24 mois",
    "investissement_requis": "€200-350k"
  }
}

STYLE ÉDITORIAL:
✅ Fluide, captivant, pas de jargon lourd
✅ Insights approfondis, angles non-obvieux
✅ Données sourcées, faits chiffrés intégrés dans narrative
✅ Narratif "qui raconte la stratégie comme une histoire"
✅ Tone: confiant, data-driven, pas d'alarmisme mais franchise`;

    // Build context from previous agents
    const context = {
      scraper: scraper_data?.data?.company_profile || {},
      pestel: pestel_data?.data?.synthese_strategique || {},
      porter: porter_data?.data?.synthese_strategique || {}
    };

    const userPrompt = `Produis SWOT narrative complète pour:

ENTREPRISE: ${company_data.name}
PROFONDEUR: ${depth}

CONTEXTE DISPONIBLE:
${JSON.stringify(context, null, 2)}

Construit narrative cohérente reliant:
- Forces identifiées (scraper data + position Porter)
- Faiblesses critiques (gaps compétitifs)
- Opportunités macro (PESTEL) et concurrentielles (Porter)
- Menaces environnementales et sectorielles

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    console.log("📡 Calling Claude API for SWOT synthesis...");

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: depth === 'deep' ? 8000 : depth === 'standard' ? 5000 : 3000,
        temperature: 0.25, // Un peu plus créatif pour narrative
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\n${userPrompt}`
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("❌ Anthropic API error:", errorText);
      throw new Error(`Anthropic API failed: ${anthropicResponse.status}`);
    }

    const anthropicData = await anthropicResponse.json();
    const swotContent = anthropicData.content[0].text;

    console.log(`✅ SWOT analysis generated`);

    // Parse JSON
    let swotData;
    try {
      const cleanContent = swotContent.replace(/```json\n?|\n?```/g, '').trim();
      swotData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parsing failed");
      throw new Error("Failed to parse SWOT analysis");
    }

    const inputTokens = anthropicData.usage?.input_tokens || 0;
    const outputTokens = anthropicData.usage?.output_tokens || 0;

    console.log(`📊 SWOT global score: ${swotData.synthese_strategique?.score_swot_global}/10`);
    console.log("🎯 ========== SWOT STRATEGIST END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "swot_strategist",
        data: swotData,
        metadata: {
          company: company_data.name,
          depth: depth,
          timestamp: new Date().toISOString(),
          model_used: "claude-3-5-sonnet-20241022",
          tokens: { input: inputTokens, output: outputTokens }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ SWOT ERROR:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "SWOT agent failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
