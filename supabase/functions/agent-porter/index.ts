import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: PORTER_SPECIALIST
 * Mission: Analyse Porter 5 Forces avec profondeur stratégique
 */

const requestSchema = z.object({
  company_data: z.object({
    name: z.string(),
    industry: z.string(),
    market_position: z.string().optional(),
  }),
  pestel_context: z.any().optional(),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("⚔️ ========== PORTER SPECIALIST START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, pestel_context, depth } = validation.data;
    console.log(`⚔️ Porter analysis for: ${company_data.name}`);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const systemPrompt = `Tu es expert en stratégie compétitive Porter 5 Forces.

MISSION: Analyser intensité concurrentielle et attractivité sectorielle.

Pour chaque force:
1. **Score 1-5** (1=faible menace, 5=forte menace)
2. **Justification** argumentée avec faits sectoriels + données marché
3. **Barrières à l'entrée** identifiées et quantifiées
4. **Implications stratégiques** (offensif/défensif) pour l'entreprise
5. **Sources** et données marché récentes

OUTPUT JSON:
{
  "forces": {
    "pouvoir_fournisseurs": {
      "score": 3,
      "intensite": "moyenne",
      "justification": "Marché fournisseurs fragmenté (200+ acteurs France selon [source]). Coûts de changement faibles (< 5% CA). Standardisation produits 70%.",
      "barrieres": [
        "Coûts de changement faibles",
        "Standardisation élevée",
        "Alternatives nombreuses"
      ],
      "implications_strategiques": [
        "Négocier contrats cadre 2-3 ans pour sécuriser prix",
        "Diversifier sources (min 3 fournisseurs par catégorie)",
        "Intégration verticale partielle si volumes >€1M"
      ],
      "donnees_marche": {
        "nombre_fournisseurs": "200+",
        "concentration": "Faible (Top 5 = 25% marché)",
        "evolution_prix": "+3%/an"
      }
    },
    "pouvoir_clients": {...},
    "nouveaux_entrants": {...},
    "produits_substituts": {...},
    "rivalite_concurrentielle": {...}
  },
  "narrative": "Le secteur ${company_data.industry} présente une intensité concurrentielle élevée (score 7.2/10)...",
  "synthese_strategique": {
    "attractivite_sectorielle": 6.5,
    "positionnement_recommande": "Différenciation qualité + niche premium",
    "menaces_prioritaires": ["Nouveaux entrants digitaux", "Substituion technologique"],
    "opportunites": ["Consolidation fournisseurs", "Expansion géographique"],
    "actions_immediates": ["Action 1", "Action 2", "Action 3"]
  },
  "score_global_porter": 7.2
}

STYLE: Analytique, data-driven, insights stratégiques actionnables.`;

    const pestelSummary = pestel_context
      ? `\n\nCONTEXTE PESTEL:\n${JSON.stringify(pestel_context.synthese_strategique || {}, null, 2)}`
      : '';

    const userPrompt = `Produis analyse Porter 5 Forces pour:

ENTREPRISE: ${company_data.name}
SECTEUR: ${company_data.industry}
POSITION MARCHÉ: ${company_data.market_position || 'À déterminer'}
PROFONDEUR: ${depth}${pestelSummary}

Analyse chaque force avec profondeur et données marché récentes.

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    console.log("📡 Calling Claude API for Porter analysis...");

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: depth === 'deep' ? 6000 : depth === 'standard' ? 4000 : 2500,
        temperature: 0.2,
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
    const porterContent = anthropicData.content[0].text;

    console.log(`✅ Porter analysis generated`);

    // Parse JSON
    let porterData;
    try {
      const cleanContent = porterContent.replace(/```json\n?|\n?```/g, '').trim();
      porterData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parsing failed");
      throw new Error("Failed to parse Porter analysis");
    }

    const inputTokens = anthropicData.usage?.input_tokens || 0;
    const outputTokens = anthropicData.usage?.output_tokens || 0;

    console.log(`📊 Porter global score: ${porterData.score_global_porter}/10`);
    console.log("⚔️ ========== PORTER SPECIALIST END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "porter_specialist",
        data: porterData,
        metadata: {
          company: company_data.name,
          industry: company_data.industry,
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
    console.error("❌ PORTER ERROR:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Porter agent failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
