import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PERPLEXITY_API_KEY || !ANTHROPIC_API_KEY || !RESEND_API_KEY) {
      throw new Error('Missing required API keys');
    }

    console.log('Starting AI news collection...');

    // 1. Collecte Perplexity (Modèle corrigé: sonar-pro)
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{
          role: 'system',
          content: 'Tu es un expert en veille technologique IA. Sois précis et factuel.'
        }, {
          role: 'user',
          content: 'Quelles sont les 5 actualités majeures de l\'IA ces dernières 24h ? Focus sur: Modèles, Business, Régulation. Retourne les sources.'
        }],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!perplexityResponse.ok) {
      const err = await perplexityResponse.text();
      console.error('Perplexity Error:', err);
      throw new Error(`Perplexity API Error ${perplexityResponse.status}: ${err}`);
    }

    const perplexityData = await perplexityResponse.json();
    const newsContent = perplexityData.choices[0]?.message?.content || "Aucune news trouvée.";
    console.log('News collected from Perplexity');

    // 2. Synthèse Claude
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const synthesisResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229', // Modèle le plus intelligent pour le JSON
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Tu es un analyste expert chez IMOTION. Analyse ceci : \n\n${newsContent}\n\n
        Génère un JSON valide STRICTEMENT selon cette structure (sans texte avant/après) :
        {
          "summary": "Résumé global en 2 phrases",
          "top_news": [
            { "title": "Titre", "category": "Business", "importance": "high", "summary": "...", "source": "...", "key_takeaways": ["..."], "impact": "..." }
          ],
          "trends": ["Tendance 1", "Tendance 2"],
          "recommendations": ["Recommandation 1"]
        }`
      }]
    });

    const contentBlock = synthesisResponse.content[0];
    const synthesisText = contentBlock.type === 'text' ? contentBlock.text : '';
    const jsonMatch = synthesisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON parsing failed from Claude response');
    
    const reportData = JSON.parse(jsonMatch[0]);
    reportData.date = new Date().toISOString().split('T')[0];

    // 3. Sauvegarde DB
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Génération HTML simplifiée pour l'email
    const htmlContent = `
      <h1>Veille IA - ${reportData.date}</h1>
      <p>${reportData.summary}</p>
      <h2>Actualités</h2>
      ${reportData.top_news.map((n:any) => `<h3>${n.title}</h3><p>${n.summary}</p>`).join('')}
    `;

    await supabase.from('ai_news_reports').upsert({
      date: reportData.date,
      summary: reportData.summary,
      top_news: reportData.top_news,
      trends: reportData.trends,
      recommendations: reportData.recommendations,
      html_content: htmlContent
    }, { onConflict: 'date' });

    console.log('Report saved.');

    return new Response(JSON.stringify({ success: true, report: reportData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
