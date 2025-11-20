import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  category: string;
  importance: string;
  summary: string;
  source: string;
  key_takeaways: string[];
  impact: string;
}

interface AINewsReport {
  date: string;
  summary: string;
  top_news: NewsItem[];
  trends: string[];
  recommendations: string[];
}

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
        model: 'sonar-pro', // Plus stable que llama-3.1
        messages: [{
          role: 'system',
          content: 'Tu es un expert en veille technologique IA. Sois précis et factuel.'
        }, {
          role: 'user',
          content: 'Quelles sont les 5 actualités majeures de l\'IA ces dernières 24h ? Focus sur: Modèles, Business, Régulation. Retourne les sources.'
        }],
        temperature: 0.1, // Plus bas pour éviter les erreurs de format
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
      ${reportData.top_news.map((n: NewsItem) => `<h3>${n.title}</h3><p>${n.summary}</p>`).join('')}
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

function generateHTMLReport(report: AINewsReport): string {
  const newsItemsHTML = report.top_news.map(item => `
    <div class="news-item ${item.importance}">
      <h3 class="news-title">${item.title}</h3>
      <div class="news-meta">
        <span class="badge badge-${item.category.toLowerCase()}">${item.category}</span>
        <span class="badge badge-${item.importance}">${item.importance === 'high' ? 'Haute importance' : item.importance === 'medium' ? 'Importance moyenne' : 'Info'}</span>
        <span class="source">${item.source}</span>
      </div>
      <p class="news-summary">${item.summary}</p>
      ${item.key_takeaways.length > 0 ? `
        <div class="key-takeaways">
          <strong>Points clés :</strong>
          <ul>
            ${item.key_takeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <div class="impact">
        <strong>Impact IMOTION :</strong> ${item.impact}
      </div>
    </div>
  `).join('');

  const trendsHTML = report.trends.length > 0 ? `
    <div class="section">
      <h2>📈 Tendances Observées</h2>
      <ul class="trends-list">
        ${report.trends.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const recommendationsHTML = report.recommendations.length > 0 ? `
    <div class="section">
      <h2>💡 Recommandations pour IMOTION</h2>
      <ul class="recommendations-list">
        ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Veille IA Quotidienne - ${report.date}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1E293B;
            background: #F8FAFC;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
        }
        
        .header .date {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .summary {
            background: #EFF6FF;
            border-left: 4px solid #3B82F6;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
        }
        
        .summary h2 {
            margin: 0 0 10px 0;
            color: #1E3A8A;
            font-size: 18px;
        }
        
        .section {
            margin: 30px 0;
        }
        
        .section h2 {
            color: #1E3A8A;
            font-size: 22px;
            margin-bottom: 15px;
        }
        
        .news-item {
            border-left: 4px solid #E2E8F0;
            padding: 20px;
            margin-bottom: 20px;
            background: #F8FAFC;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .news-item:hover {
            border-left-color: #3B82F6;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .news-item.high {
            border-left-color: #EF4444;
            background: #FEF2F2;
        }
        
        .news-item.medium {
            border-left-color: #F59E0B;
            background: #FEF3C7;
        }
        
        .news-title {
            font-size: 20px;
            font-weight: 600;
            color: #1E3A8A;
            margin: 0 0 10px 0;
        }
        
        .news-meta {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        
        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .badge-modèles { background: #DBEAFE; color: #1E40AF; }
        .badge-produits { background: #D1FAE5; color: #065F46; }
        .badge-recherche { background: #E0E7FF; color: #3730A3; }
        .badge-business { background: #FEF3C7; color: #92400E; }
        .badge-régulation { background: #FEE2E2; color: #991B1B; }
        .badge-high { background: #FEE2E2; color: #991B1B; }
        .badge-medium { background: #FEF3C7; color: #92400E; }
        .badge-low { background: #E0E7FF; color: #3730A3; }
        
        .source {
            color: #64748B;
            font-size: 14px;
        }
        
        .news-summary {
            margin: 10px 0;
            color: #475569;
        }
        
        .key-takeaways {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
        }
        
        .key-takeaways strong {
            color: #1E3A8A;
            display: block;
            margin-bottom: 8px;
        }
        
        .key-takeaways ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .impact {
            margin-top: 15px;
            padding: 12px;
            background: #EFF6FF;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .impact strong {
            color: #1E3A8A;
        }
        
        .trends-list, .recommendations-list {
            padding-left: 20px;
        }
        
        .trends-list li, .recommendations-list li {
            margin: 10px 0;
            color: #475569;
        }
        
        .footer {
            background: #F8FAFC;
            padding: 20px;
            text-align: center;
            color: #64748B;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Veille IA Quotidienne</h1>
            <div class="date">${new Date(report.date).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
        </div>
        
        <div class="content">
            <div class="summary">
                <h2>📊 Résumé Exécutif</h2>
                <p>${report.summary}</p>
            </div>
            
            <div class="section">
                <h2>🔥 Actualités Principales</h2>
                ${newsItemsHTML}
            </div>
            
            ${trendsHTML}
            ${recommendationsHTML}
        </div>
        
        <div class="footer">
            <p>Rapport généré automatiquement par IMOTION Veille IA</p>
            <p>© ${new Date().getFullYear()} IMOTION - Transformation Digitale B2B</p>
        </div>
    </div>
</body>
</html>
  `;
}