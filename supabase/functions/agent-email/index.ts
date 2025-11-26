import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: EMAIL_MARKETING_SPECIALIST
 * Mission: Audit performance emailing + segmentation + automation
 */

const requestSchema = z.object({
  company_data: z.object({
    name: z.string(),
  }),
  current_performance: z.object({
    list_size: z.number().optional(),
    open_rate: z.number().optional(),
    click_rate: z.number().optional(),
    frequency: z.string().optional(),
  }).optional(),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📧 ========== EMAIL MARKETING START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, current_performance, depth } = validation.data;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const systemPrompt = `Tu es expert Email Marketing avec focus B2B lead nurturing.

OUTPUT JSON:
{
  "performance_actuelle": {
    "list_size": 8500,
    "open_rate": "18%",
    "click_rate": "2.3%",
    "benchmarks": {
      "open_rate_industrie": "21%",
      "click_rate_industrie": "2.8%"
    },
    "score": 62,
    "problemes": ["Taux ouverture sous benchmark", "Segmentation insuffisante"]
  },
  "segmentation": {
    "segments_actuels": 3,
    "segments_recommandes": 8,
    "strategies": [
      {
        "segment": "Leads froids (>6 mois inactifs)",
        "taille": "2500",
        "approche": "Campagne réactivation 3 emails",
        "objectif": "Réactiver 15-20%"
      }
    ]
  },
  "automation": {
    "sequences_actuelles": 1,
    "sequences_recommandees": 6,
    "workflows": [
      {
        "nom": "Welcome Series (nouveaux inscrits)",
        "emails": 5,
        "duree": "14 jours",
        "conversion_attendue": "12-15%"
      },
      {
        "nom": "Lead Nurturing (MQL → SQL)",
        "emails": 8,
        "duree": "45 jours",
        "conversion_attendue": "8-12%"
      }
    ]
  },
  "optimisations": [
    {
      "action": "A/B testing subject lines",
      "impact": "+25% open rate",
      "effort": "2h/semaine"
    },
    {
      "action": "Personnalisation contenu par segment",
      "impact": "+40% click rate",
      "effort": "1 jour setup"
    }
  ],
  "roi_projections": {
    "open_rate_m6": "28% (+10 points)",
    "click_rate_m6": "4.2% (+1.9 points)",
    "leads_supplementaires_m6": "+120 MQL",
    "investissement": "€8-12k (outil automation + setup)"
  },
  "narrative": "Votre email marketing génère un open rate de 18% (vs 21% benchmark), révélant un problème de segmentation... En implémentant 8 segments + 6 workflows automation, projection +120 MQL en 6 mois..."
}`;

    const userPrompt = `Audit Email Marketing pour: ${company_data.name}
${current_performance ? `Performance: ${JSON.stringify(current_performance)}` : ''}
Profondeur: ${depth}

Retourne JSON uniquement.`;

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
        max_completion_tokens: depth === 'deep' ? 4500 : 3000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) throw new Error("OpenAI API failed");

    const openaiData = await openaiResponse.json();
    const emailData = JSON.parse(
      openaiData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim()
    );

    console.log("📧 ========== EMAIL MARKETING END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "email_specialist",
        data: emailData,
        metadata: {
          company: company_data.name,
          depth,
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
    console.error("❌ EMAIL ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
