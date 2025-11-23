import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Liste de domaines de confiance (Whitelist Premium)
const TRUSTED_DOMAINS = [
  // Institutions officielles
  'insee.fr', 'statista.com', 'europa.eu', 'oecd.org', 'worldbank.org',
  'imf.org', 'ecb.europa.eu', 'banque-france.fr',
  
  // Cabinets de conseil stratégique (Big 4 + MBB)
  'mckinsey.com', 'bcg.com', 'bain.com', 'deloitte.com', 'kpmg.com',
  'pwc.com', 'ey.com', 'accenture.com',
  
  // Presse économique & analystes
  'lesechos.fr', 'latribune.fr', 'ft.com', 'hbr.org', 'gartner.com',
  'forrester.com', 'bloomberg.com', 'reuters.com', 'usine-nouvelle.com'
];

interface SearchRequest {
  query: string;
  sector?: string;
  maxResults?: number;
}

interface TavilySource {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  answer?: string;
  results: TavilySource[];
  query: string;
  response_time: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
    if (!TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY non configurée dans les secrets Supabase');
    }

    const { query, sector, maxResults = 5 }: SearchRequest = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Le paramètre "query" est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Truth Hunter] Recherche documentaire: "${query}" | Secteur: ${sector || 'général'}`);

    // Construire la requête enrichie avec le secteur si fourni
    const enrichedQuery = sector 
      ? `${query} secteur ${sector} France 2024-2025`
      : `${query} France 2024-2025`;

    // Appel à l'API Tavily (mode advanced search)
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: enrichedQuery,
        search_depth: 'advanced', // Recherche approfondie
        include_domains: TRUSTED_DOMAINS, // Restriction aux sources fiables
        include_answer: true, // Demande un résumé synthétique
        include_raw_content: true, // Récupère le contenu complet pour citation
        max_results: maxResults,
      }),
    });

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error('[Tavily API Error]:', errorText);
      throw new Error(`Erreur API Tavily: ${tavilyResponse.status}`);
    }

    const data: TavilyResponse = await tavilyResponse.json();

    // Formatage des résultats pour l'IA
    const formattedSources = data.results.map((result) => {
      // Extraction du nom de domaine pour identifier le publisher
      const domain = new URL(result.url).hostname.replace('www.', '');
      const publisherName = domain.includes('mckinsey') ? 'McKinsey & Company'
        : domain.includes('bcg') ? 'Boston Consulting Group'
        : domain.includes('insee') ? 'INSEE'
        : domain.includes('statista') ? 'Statista'
        : domain.includes('lesechos') ? 'Les Échos'
        : domain;

      return {
        title: result.title,
        url: result.url,
        content_snippet: result.content.substring(0, 500) + '...', // Limite à 500 chars pour lisibilité
        full_content: result.content, // Contenu complet pour analyse approfondie
        publisher: publisherName,
        published_date: result.published_date || 'Non spécifié',
        relevance_score: result.score,
      };
    });

    // Réponse structurée pour l'orchestrateur
    const response = {
      success: true,
      query: enrichedQuery,
      synthesized_answer: data.answer || 'Aucun résumé disponible',
      sources: formattedSources,
      metadata: {
        total_sources: formattedSources.length,
        response_time_ms: data.response_time,
        trusted_domains_used: TRUSTED_DOMAINS.length,
      },
    };

    console.log(`[Truth Hunter] ✅ ${formattedSources.length} sources fiables trouvées en ${data.response_time}ms`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[fetch-authoritative-data Error]:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la recherche',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
