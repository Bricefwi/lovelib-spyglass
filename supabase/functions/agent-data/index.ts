import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: DATA_ANALYTICS_SPECIALIST
 * Mission: Audit stack analytics + KPIs + dashboarding + data quality
 */

const requestSchema = z.object({
  company_data: z.object({
    name: z.string(),
  }),
  tech_stack: z.object({
    analytics_tools: z.array(z.string()).optional(),
    crm: z.string().optional(),
    marketing_automation: z.string().optional(),
  }).optional(),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📊 ========== DATA ANALYTICS START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, tech_stack, depth } = validation.data;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const systemPrompt = `Tu es expert Data Analytics & BI avec focus marketing/sales analytics.

OUTPUT JSON:
{
  "stack_actuel": {
    "outils": ["Google Analytics", "HubSpot CRM"],
    "score_maturite": 58,
    "gaps_critiques": [
      "Pas de tracking events avancé",
      "Attribution multi-touch absente",
      "Dashboards manuels (pas real-time)"
    ]
  },
  "kpis_tracking": {
    "kpis_actuels": 12,
    "kpis_recommandes": 25,
    "frameworks": [
      {
        "categorie": "Acquisition",
        "kpis": [
          {
            "nom": "CAC (Customer Acquisition Cost)",
            "valeur_actuelle": "€850",
            "benchmark": "€600-900",
            "tracking": "Manuel via Excel",
            "priorite": "haute"
          }
        ]
      },
      {
        "categorie": "Activation",
        "kpis": ["Time to value", "Feature adoption rate"]
      },
      {
        "categorie": "Revenue",
        "kpis": ["MRR", "Churn rate", "LTV"]
      }
    ]
  },
  "dashboards": {
    "actuels": 2,
    "recommandes": 8,
    "prioritaires": [
      {
        "nom": "Marketing Performance Dashboard",
        "kpis": ["Leads", "MQL", "SQL", "CAC", "ROI campaigns"],
        "frequence_update": "daily",
        "users": ["CMO", "Marketing team"]
      },
      {
        "nom": "Sales Pipeline Dashboard",
        "kpis": ["Opportunities", "Win rate", "Sales cycle", "Revenue forecast"],
        "frequence_update": "real-time",
        "users": ["Sales team", "CEO"]
      }
    ]
  },
  "data_quality": {
    "score": 65,
    "problemes": [
      "20% doublons CRM",
      "Champs obligatoires manquants (35% contacts)",
      "Historique incomplet (avant 2023)"
    ],
    "plan_nettoyage": [
      "Dédoublonnage CRM (3 jours)",
      "Enrichissement données (APIs externes)",
      "Validation champs (règles automatiques)"
    ]
  },
  "attribution": {
    "modele_actuel": "Last-touch",
    "modele_recommande": "Multi-touch weighted",
    "impact": "+35% précision ROI campaigns"
  },
  "roadmap": [
    {
      "phase": "Phase 1 (M1-M2)",
      "actions": [
        "Setup GA4 events avancés",
        "Nettoyer données CRM",
        "Créer 3 dashboards prioritaires"
      ],
      "budget": "€5-8k",
      "roi": "Visibilité real-time performance"
    }
  ],
  "roi_projections": {
    "gain_efficacite": "+25% temps équipe (automatisation reports)",
    "meilleure_decision": "+30% ROI marketing (attribution précise)",
    "investissement_annuel": "€25-40k (outils + setup + formation)"
  },
  "narrative": "Votre stack analytics est fonctionnelle mais présente 3 gaps critiques: tracking events limité, attribution last-touch, dashboards manuels... En migrant vers GA4 events + attribution multi-touch + dashboards real-time, gain +25% efficacité équipe..."
}`;

    const userPrompt = `Audit Data Analytics pour: ${company_data.name}
${tech_stack ? `Stack: ${JSON.stringify(tech_stack)}` : ''}
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
        max_completion_tokens: depth === 'deep' ? 5000 : 3500,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) throw new Error("OpenAI API failed");

    const openaiData = await openaiResponse.json();
    const dataAnalytics = JSON.parse(
      openaiData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim()
    );

    console.log("📊 ========== DATA ANALYTICS END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "data_specialist",
        data: dataAnalytics,
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
    console.error("❌ DATA ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
