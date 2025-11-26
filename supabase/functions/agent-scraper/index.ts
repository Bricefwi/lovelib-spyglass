import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: SCRAPER_SPECIALIST
 * Mission: Collecter données entreprise avec ZÉRO hallucination
 * Règle: Tout doit avoir score de confiance et source traçable
 */

const requestSchema = z.object({
  url: z.string().url(),
  company_name: z.string().optional(),
  depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🔍 ========== SCRAPER SPECIALIST START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url, company_name, depth } = validation.data;
    console.log(`📊 Scraping: ${url} (depth: ${depth})`);

    // Use Perplexity for web research with citations
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      throw new Error("PERPLEXITY_API_KEY not configured");
    }

    const systemPrompt = `Tu es un expert en data scraping et validation. RÈGLES ABSOLUES:

1. ZÉRO HALLUCINATION - Rapporte UNIQUEMENT ce qui existe réellement
2. SOURCES TRAÇABLES - URL + timestamp pour chaque assertion
3. SCORE DE CONFIANCE - Attribue un score 0-100 pour chaque donnée:
   - 100 = Confirmé par sources officielles multiples
   - 80-99 = Confirmé par source officielle unique
   - 60-79 = Confirmé par sources secondaires fiables
   - 40-59 = Information partielle ou datée
   - 20-39 = Information douteuse
   - 0-19 = Non trouvé ou contradictoire

4. DÉDOUBLONNAGE - Normalise et déduplique les informations
5. VALIDATION CROISÉE - Si contradictions, rapporte les deux versions

OUTPUT JSON STRUCTURE:
{
  "company_profile": {
    "name": "...",
    "legal_name": "...",
    "founded": "...",
    "employees": "...",
    "revenue_range": "...",
    "industry": "...",
    "headquarters": {...},
    "website": "...",
    "description": "...",
    "confidence": {
      "name": 100,
      "founded": 85,
      "employees": 70,
      ...
    },
    "sources": [
      {"field": "name", "url": "...", "date": "2025-11-26", "type": "official"},
      {"field": "employees", "url": "...", "date": "2024-06-15", "type": "secondary"}
    ]
  },
  "contacts": {
    "phone": "...",
    "email": "...",
    "social_media": {...},
    "confidence": {...}
  },
  "business_info": {
    "siret": "...",
    "vat_number": "...",
    "registration": "...",
    "confidence": {...}
  },
  "validation_report": {
    "data_completeness": "75%",
    "total_sources": 12,
    "official_sources": 5,
    "suspicious_fields": [],
    "data_freshness": "< 30 days",
    "cross_validation_status": "passed"
  }
}

IMPORTANT:
- Si donnée NON trouvée → confidence = 0, field = null, ajouter explication
- Si contradictions → rapporter les deux, marquer "conflicting" dans sources
- Privilégier sources officielles (site entreprise, registres publics, LinkedIn officiel)`;

    const userPrompt = `Recherche et collecte toutes les données disponibles sur l'entreprise dont le site web est: ${url}
${company_name ? `Nom probable: ${company_name}` : ''}

Niveau de profondeur: ${depth}
${depth === 'quick' ? '- Focus sur données essentielles uniquement' : ''}
${depth === 'deep' ? '- Recherche exhaustive incluant historique, dirigeants, actualités' : ''}

Instructions:
1. Commence par identifier l'entreprise (nom légal, SIRET si France, registration si autre pays)
2. Collecte données de base: fondation, taille, secteur, localisation
3. Cherche contacts et présence digitale
4. Attribue scores de confiance honnêtes
5. Documente chaque source avec URL et date

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

    console.log("📡 Calling Perplexity API for web research...");

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // Max precision
        max_tokens: depth === 'deep' ? 4000 : depth === 'standard' ? 2500 : 1500,
        return_citations: true, // Enable citations
        return_related_questions: false
      })
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("❌ Perplexity API error:", errorText);
      throw new Error(`Perplexity API failed: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const scrapedContent = perplexityData.choices[0].message.content;
    const citations = perplexityData.citations || [];

    console.log(`✅ Data scraped, length: ${scrapedContent.length} chars`);
    console.log(`📚 Citations found: ${citations.length}`);

    // Parse JSON
    let scrapedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = scrapedContent.replace(/```json\n?|\n?```/g, '').trim();
      scrapedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parsing failed, raw content:", scrapedContent.substring(0, 500));

      // Fallback with minimal data
      scrapedData = {
        company_profile: {
          name: company_name || "Unknown",
          website: url,
          confidence: { name: 50 },
          sources: []
        },
        validation_report: {
          data_completeness: "0%",
          total_sources: 0,
          error: "Failed to parse AI response"
        }
      };
    }

    // Enrich with Perplexity citations if available
    if (citations.length > 0 && scrapedData.company_profile) {
      scrapedData.company_profile.perplexity_citations = citations;
    }

    // Calculate overall quality score
    const avgConfidence = scrapedData.company_profile?.confidence
      ? Object.values(scrapedData.company_profile.confidence).reduce((a: number, b: number) => a + b, 0) /
        Object.values(scrapedData.company_profile.confidence).length
      : 0;

    const qualityScore = {
      overall_confidence: Math.round(avgConfidence),
      data_completeness: scrapedData.validation_report?.data_completeness || "0%",
      source_quality: citations.length > 0 ? "good" : "limited",
      freshness: scrapedData.validation_report?.data_freshness || "unknown"
    };

    console.log(`📊 Quality score: ${qualityScore.overall_confidence}% confidence`);
    console.log("🔍 ========== SCRAPER SPECIALIST END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "scraper_specialist",
        data: scrapedData,
        quality: qualityScore,
        metadata: {
          url: url,
          depth: depth,
          timestamp: new Date().toISOString(),
          model_used: "perplexity/sonar-pro",
          citations_count: citations.length
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ SCRAPER ERROR:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Scraper agent failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
