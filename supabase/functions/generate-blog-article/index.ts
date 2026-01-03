/**
 * Supabase Edge Function: generate-blog-article
 * 
 * Génère automatiquement un article de blog de qualité sur le marketing & commerce B2B
 * Utilise Lovable AI Gateway pour la génération de contenu
 * Programmé pour s'exécuter 2 fois par mois via cron job
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleRequest {
  topic?: string;
  category?: string;
  manual?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let requestBody: ArticleRequest = {};
    try {
      requestBody = await req.json();
    } catch {
      // Empty body is fine for cron triggers
    }
    
    const { topic, category, manual } = requestBody;

    console.log('=== Blog Article Generation Started ===');
    console.log('Topic:', topic || 'Auto-selected');
    console.log('Category:', category || 'Auto-selected');
    console.log('Manual:', manual || false);

    // Sélectionner un sujet si non fourni
    const selectedTopic = topic || selectTopic();
    const selectedCategory = category || selectCategory();

    // Générer le contenu de l'article via Lovable AI
    const articleContent = await generateArticleContent(selectedTopic, selectedCategory);

    // Générer un slug unique
    const baseSlug = generateSlug(articleContent.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Insérer l'article dans la base de données
    const { data: article, error: insertError } = await supabase
      .from('blog_articles')
      .insert({
        slug,
        title: articleContent.title,
        excerpt: articleContent.excerpt,
        content_md: articleContent.content,
        category: selectedCategory,
        cover_url: articleContent.coverUrl,
        author_name: 'IMOTION IA',
        author_role: 'Intelligence Artificielle',
        published_at: new Date().toISOString(),
        reliability_score: 85,
        tags: ['marketing-b2b', 'stratégie-digitale', 'ia'],
        sources: [{ name: 'Lovable AI', type: 'ai-generated' }]
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('=== Article Generated Successfully ===');
    console.log('Article ID:', article.id);
    console.log('Slug:', article.slug);
    console.log('Title:', article.title);

    return new Response(
      JSON.stringify({
        success: true,
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          category: article.category,
          published_at: article.published_at
        },
        message: 'Blog article generated and published successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const requestId = crypto.randomUUID();
    console.error(`[${requestId}] Error generating blog article:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
        requestId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Sélectionne automatiquement un sujet pertinent pour l'article
 */
function selectTopic(): string {
  const topics = [
    "Comment optimiser votre funnel de conversion B2B en 2026",
    "Les KPIs marketing essentiels pour les SaaS B2B",
    "Stratégies d'Account-Based Marketing (ABM) qui fonctionnent",
    "Comment réduire votre CAC de 30% : Guide pratique",
    "L'IA dans le marketing B2B : Cas d'usage concrets",
    "Optimisation du cycle de vente : De 90 à 45 jours",
    "Lead Scoring : Méthodologie et implémentation",
    "Content Marketing B2B : ROI et mesure de performance",
    "Sales Enablement : Aligner marketing et ventes",
    "Marketing Automation : Guide complet pour PME",
    "Analyse de la concurrence : Outils et méthodologie",
    "Pricing Strategy : Comment définir vos tarifs B2B",
    "Customer Success : Réduire le churn de 50%",
    "LinkedIn Ads : Stratégies avancées pour le B2B",
    "SEO B2B : Comment générer des leads qualifiés",
    "Transformation digitale : Roadmap pour TPE/PME",
    "Intelligence Artificielle : ROI pour le marketing B2B",
    "Growth Hacking B2B : Techniques éprouvées"
  ];

  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex];
}

/**
 * Sélectionne une catégorie pour l'article
 */
function selectCategory(): string {
  const categories = [
    'articles',
    'etudes-de-cas',
    'cas-clients',
    'infographies',
    'chiffres-cles'
  ];

  const random = Math.random();
  if (random < 0.7) {
    return 'articles';
  } else {
    const randomIndex = Math.floor(Math.random() * (categories.length - 1)) + 1;
    return categories[randomIndex];
  }
}

/**
 * Génère le contenu complet de l'article en utilisant Lovable AI
 */
async function generateArticleContent(topic: string, category: string) {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const prompt = buildPrompt(topic, category);

  console.log('Calling Lovable AI Gateway...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en marketing et commerce B2B chez IMOTION Conseil. Tu rédiges des articles de blog professionnels, actionnables et basés sur des données. Ton style est direct, professionnel et inspirant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
    }
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.choices?.[0]?.message?.content;

  if (!generatedText) {
    throw new Error('No content generated from AI');
  }

  console.log('AI response received, parsing content...');
  
  return parseGeneratedContent(generatedText, topic);
}

/**
 * Construit le prompt pour la génération de contenu
 */
function buildPrompt(topic: string, category: string): string {
  return `Rédige un article de blog professionnel en français sur le sujet suivant :

**Sujet** : ${topic}
**Catégorie** : ${category}

**Instructions** :
1. Titre accrocheur et optimisé SEO (60-70 caractères max)
2. Extrait captivant de 150-160 caractères
3. Contenu structuré en Markdown avec :
   - Introduction engageante (problème + promesse de solution)
   - 4-5 sections avec sous-titres (## Titre)
   - Exemples concrets et chiffres clés avec sources
   - Conseils actionnables et pratiques
   - Encadrés "💡 Conseil Pro" ou "📊 Chiffre Clé"
   - Conclusion avec appel à l'action vers IMOTION

**Format de réponse STRICT** (respecte exactement ce format) :
TITRE: [Titre de l'article sans guillemets]
EXTRAIT: [Extrait de 150-160 caractères]
CONTENU:
[Contenu complet en Markdown, commençant directement par l'introduction]

**Ton** : Professionnel, expert, actionnable, inspirant
**Longueur** : 1500-2000 mots minimum
**Public cible** : Directeurs marketing, CMO, responsables commerciaux B2B, dirigeants TPE/PME`;
}

/**
 * Parse le contenu généré pour extraire titre, extrait et contenu
 */
function parseGeneratedContent(text: string, fallbackTopic: string) {
  let title: string;
  let excerpt: string;
  let content: string;

  const titleMatch = text.match(/TITRE:\s*(.+?)(?:\n|EXTRAIT:)/s);
  const excerptMatch = text.match(/EXTRAIT:\s*(.+?)(?:\n|CONTENU:)/s);
  const contentMatch = text.match(/CONTENU:\s*([\s\S]+)/);

  if (titleMatch && excerptMatch && contentMatch) {
    title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
    excerpt = excerptMatch[1].trim().replace(/^["']|["']$/g, '');
    content = contentMatch[1].trim();
  } else {
    // Fallback: utiliser le texte complet avec un titre généré
    console.warn('Could not parse structured response, using fallback');
    title = fallbackTopic;
    excerpt = `Découvrez nos conseils d'experts sur ${fallbackTopic.toLowerCase()}.`;
    content = text;
  }

  // Calculer le temps de lecture (250 mots/minute)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(5, Math.ceil(wordCount / 250));

  return {
    title,
    excerpt,
    content,
    coverUrl: generateCoverUrl(),
    readingTime
  };
}

/**
 * Génère un slug unique à partir du titre
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

/**
 * Génère une URL de cover image
 */
function generateCoverUrl(): string {
  const imageIds = [
    'blog-analytics',
    'blog-automation',
    'blog-digital-transformation-b2b',
    'blog-growth',
    'blog-meeting',
    'business-analytics',
    'marketing-workspace'
  ];
  
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  return `/src/assets/${randomId}.jpg`;
}
