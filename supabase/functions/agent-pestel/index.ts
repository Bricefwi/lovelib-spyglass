import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: PESTEL_ANALYST
 * Mission: Analyse macro-économique sectorielle style "Laboratoire Perplexity"
 * Output: Narrative riche + données chiffrées
 */

const requestSchema = z.object({
  company_data: z.object({
    name: z.string(),
    industry: z.string(),
    country: z.string().default("France"),
  }),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📊 ========== PESTEL ANALYST START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, depth } = validation.data;
    console.log(`🏢 Analyzing: ${company_data.name} in ${company_data.industry}`);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const systemPrompt = `Tu es expert en macro-économie sectorielle avec style Perplexity Laboratoire.

MISSION: Produire analyse PESTEL (Politique, Économique, Social, Technologique, Environnemental, Légal) pour une entreprise.

Pour chaque facteur:
1. Identifie 3-5 tendances clés avec impact business chiffré
2. Évalue impact: % marge, probabilité (0-100%), timeline
3. Source chaque assertion (rapports publics, INSEE, CNIL, Gov.fr, études sectorielles)
4. Relie au modèle économique de l'entreprise cible

OUTPUT JSON:
{
  "pestel": {
    "politique": {
      "tendances": [
        {
          "titre": "RGPD/CNIL 2025",
          "description": "Renforcement contrôles CNIL...",
          "impact": "Négatif (-15% marge si non-compliant)",
          "probabilite": "95%",
          "timeline": "6 mois",
          "sources": ["CNIL.fr", "Gov.fr"],
          "implication_company": "Budget compliance +€50k/an minimum"
        }
      ],
      "score_impact": 7.5,
      "actions_recommandees": ["Action 1", "Action 2"]
    },
    "economique": {...},
    "social": {...},
    "technologique": {...},
    "environnemental": {...},
    "legal": {...}
  },
  "narrative": "L'environnement politique français se resserre sur la protection des données... Cette réglementation impacte directement le secteur [X] en augmentant les coûts de mise en conformité de 12-18% selon [Source]. Pour ${company_data.name}, cela se traduit par...",
  "synthese_strategique": {
    "opportunites_majeures": ["Opp 1", "Opp 2"],
    "menaces_critiques": ["Menace 1", "Menace 2"],
    "recommandations_prioritaires": ["Rec 1", "Rec 2"]
  },
  "score_global": {
    "favorabilite_environnement": 6.5,
    "volatilite": "moyenne",
    "horizon_stabilite": "12-18 mois"
  }
}

STYLE ÉDITORIAL:
✅ Fluide, captivant, pas de jargon lourd
✅ Insights approfondis, angles non-obvieux
✅ Données sourcées, faits chiffrés (%, €, tendances)
✅ Narratif "qui raconte la stratégie comme une histoire"
✅ Tone: confiant, data-driven, pas d'alarmisme mais franchise

PROFONDEUR:
- essential: 2-3 tendances par facteur, narrative 1 page
- standard: 3-5 tendances par facteur, narrative 2-3 pages
- deep: 5+ tendances par facteur, narrative 4-6 pages avec scénarios`;

    const userPrompt = `Produis une analyse PESTEL complète pour:

ENTREPRISE: ${company_data.name}
SECTEUR: ${company_data.industry}
PAYS: ${company_data.country}
PROFONDEUR: ${depth}

Analyse l'environnement macro-économique impactant cette entreprise dans son secteur.
Focus sur ${company_data.country} mais inclus tendances européennes/mondiales pertinentes.

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    console.log("📡 Calling Claude API for PESTEL analysis...");

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
    const pestelContent = anthropicData.content[0].text;

    console.log(`✅ PESTEL analysis generated, length: ${pestelContent.length} chars`);

    // Parse JSON
    let pestelData;
    try {
      const cleanContent = pestelContent.replace(/```json\n?|\n?```/g, '').trim();
      pestelData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parsing failed");
      throw new Error("Failed to parse PESTEL analysis");
    }

    // Calculate tokens used
    const inputTokens = anthropicData.usage?.input_tokens || 0;
    const outputTokens = anthropicData.usage?.output_tokens || 0;

    console.log(`📊 Tokens: ${inputTokens} in + ${outputTokens} out`);
    console.log(`🎯 PESTEL score global: ${pestelData.score_global?.favorabilite_environnement}/10`);
    console.log("📊 ========== PESTEL ANALYST END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "pestel_analyst",
        data: pestelData,
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
    console.error("❌ PESTEL ERROR:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "PESTEL agent failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
