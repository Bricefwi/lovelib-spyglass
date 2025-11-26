import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: SOCIAL_MEDIA_SPECIALIST
 * Mission: Audit présence social + stratégie + calendar
 */

const requestSchema = z.object({
  company_data: z.object({
    name: z.string(),
    industry: z.string().optional(),
  }),
  social_accounts: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  depth: z.enum(['essential', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("📱 ========== SOCIAL MEDIA SPECIALIST START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_data, social_accounts, depth } = validation.data;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const systemPrompt = `Tu es expert Social Media B2B avec focus LinkedIn/Twitter.

MISSION: Audit présence social + stratégie optimisée + calendar 1 mois.

OUTPUT JSON:
{
  "audit_presence": {
    "linkedin": {
      "actif": true,
      "followers": 2500,
      "engagement_rate": "2.8%",
      "frequence_post": "2-3/semaine",
      "score": 65,
      "forces": ["Contenu expertise", "Engagement communauté"],
      "faiblesses": ["Fréquence irrégulière", "Pas de vidéo"]
    },
    "twitter": {...},
    "score_global": 58
  },
  "strategie_proposee": {
    "canaux_prioritaires": ["LinkedIn (80%)", "Twitter (20%)"],
    "objectifs": {
      "notoriete": "+50% reach en 6 mois",
      "engagement": "4.5% taux engagement",
      "leads": "15-20 leads qualifiés/mois"
    },
    "content_mix": {
      "expertise_posts": "40%",
      "cas_clients": "20%",
      "thought_leadership": "20%",
      "interactif_polls": "10%",
      "reposts_partners": "10%"
    },
    "frequence": {
      "linkedin": "5 posts/semaine + 10 comments/semaine",
      "twitter": "3 posts/semaine"
    }
  },
  "calendar_1_mois": [
    {
      "jour": "Lundi 6 Jan",
      "plateforme": "LinkedIn",
      "type": "Expertise post",
      "sujet": "Les 5 tendances marketing 2025",
      "format": "Carrousel 10 slides",
      "cta": "Télécharger guide complet",
      "hashtags": ["#MarketingDigital", "#Tendances2025"]
    }
  ],
  "roi_projections": {
    "reach_m6": "+120% (de 50k à 110k impressions/mois)",
    "leads_m6": "15-25 leads qualifiés/mois",
    "budget_ads": "€500-1000/mois",
    "effort_community_mgmt": "10h/semaine"
  },
  "narrative": "Votre présence LinkedIn est votre atout majeur (2500 followers, 2.8% engagement) mais souffre d'irrégularité... En passant à 5 posts/semaine avec 40% contenu expertise + 20% cas clients, projection +120% reach en 6 mois..."
}`;

    const userPrompt = `Audit Social Media pour: ${company_data.name}
Secteur: ${company_data.industry || 'B2B'}
Profondeur: ${depth}
${social_accounts ? `\nComptes: ${JSON.stringify(social_accounts)}` : ''}

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
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) throw new Error("OpenAI API failed");

    const openaiData = await openaiResponse.json();
    const socialData = JSON.parse(
      openaiData.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim()
    );

    console.log("📱 ========== SOCIAL MEDIA END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "social_specialist",
        data: socialData,
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
    console.error("❌ SOCIAL ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
