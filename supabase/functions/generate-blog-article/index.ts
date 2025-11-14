/**
 * Supabase Edge Function: generate-blog-article
 * 
 * Génère automatiquement un article de blog de qualité sur le marketing & commerce B2B
 * Utilise l'API Gemini/OpenAI/Anthropic pour la génération de contenu
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
  manual?: boolean; // Si true, génération manuelle (pas via cron)
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { topic, category, manual } = await req.json() as ArticleRequest;

    console.log('=== Blog Article Generation Started ===');
    console.log('Topic:', topic || 'Auto-selected');
    console.log('Category:', category || 'Auto-selected');
    console.log('Manual:', manual || false);

    // Sélectionner un sujet si non fourni
    const selectedTopic = topic || await selectTopic();
    const selectedCategory = category || selectCategory();

    // Générer le contenu de l'article
    const articleContent = await generateArticleContent(selectedTopic, selectedCategory);

    // Générer un slug unique
    const slug = generateSlug(articleContent.title);

    // Vérifier si le slug existe déjà
    const { data: existingArticle } = await supabase
      .from('blog_articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingArticle) {
      throw new Error(`Article with slug "${slug}" already exists`);
    }

    // Insérer l'article dans la base de données
    const { data: article, error: insertError } = await supabase
      .from('blog_articles')
      .insert({
        slug,
        title: articleContent.title,
        excerpt: articleContent.excerpt,
        content: articleContent.content,
        category: selectedCategory,
        cover_url: articleContent.coverUrl,
        meta_title: articleContent.metaTitle,
        meta_description: articleContent.metaDescription,
        published_at: new Date().toISOString(),
        author: 'IMOTION IA',
        reading_time: articleContent.readingTime
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('=== Article Generated Successfully ===');
    console.log('Article ID:', article.id);
    console.log('Slug:', article.slug);

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
        error: 'Une erreur est survenue lors de la génération de l\'article.',
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
async function selectTopic(): Promise<string> {
  const topics = [
    "Comment optimiser votre funnel de conversion B2B en 2025",
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
    "SEO B2B : Comment générer des leads qualifiés"
  ];

  // Sélectionner un sujet aléatoire
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

  // Favoriser "articles" (70% du temps)
  const random = Math.random();
  if (random < 0.7) {
    return 'articles';
  } else {
    const randomIndex = Math.floor(Math.random() * (categories.length - 1)) + 1;
    return categories[randomIndex];
  }
}

/**
 * Génère le contenu complet de l'article en utilisant l'IA
 */
async function generateArticleContent(topic: string, category: string) {
  // Essayer d'abord Gemini (gratuit), puis OpenAI, puis Anthropic
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  let content: string;
  let title: string;
  let excerpt: string;

  if (geminiKey) {
    const result = await generateWithGemini(topic, category, geminiKey);
    content = result.content;
    title = result.title;
    excerpt = result.excerpt;
  } else if (openaiKey) {
    const result = await generateWithOpenAI(topic, category, openaiKey);
    content = result.content;
    title = result.title;
    excerpt = result.excerpt;
  } else if (anthropicKey) {
    const result = await generateWithAnthropic(topic, category, anthropicKey);
    content = result.content;
    title = result.title;
    excerpt = result.excerpt;
  } else {
    throw new Error('No AI API key configured');
  }

  // Calculer le temps de lecture (250 mots/minute)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 250);

  return {
    title,
    excerpt,
    content,
    coverUrl: generateCoverUrl(category),
    metaTitle: title,
    metaDescription: excerpt,
    readingTime
  };
}

/**
 * Génère du contenu avec l'API Gemini
 */
async function generateWithGemini(topic: string, category: string, apiKey: string) {
  const prompt = buildPrompt(topic, category);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text;

  return parseGeneratedContent(generatedText);
}

/**
 * Génère du contenu avec l'API OpenAI
 */
async function generateWithOpenAI(topic: string, category: string, apiKey: string) {
  const prompt = buildPrompt(topic, category);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en marketing et commerce B2B. Tu rédiges des articles de blog professionnels, actionnables et basés sur des données.'
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
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;

  return parseGeneratedContent(generatedText);
}

/**
 * Génère du contenu avec l'API Anthropic
 */
async function generateWithAnthropic(topic: string, category: string, apiKey: string) {
  const prompt = buildPrompt(topic, category);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.content[0].text;

  return parseGeneratedContent(generatedText);
}

/**
 * Construit le prompt pour la génération de contenu
 */
function buildPrompt(topic: string, category: string): string {
  return `Rédige un article de blog professionnel en français sur le sujet suivant :

**Sujet** : ${topic}
**Catégorie** : ${category}

**Instructions** :
1. Titre accrocheur et optimisé SEO (60-70 caractères)
2. Extrait captivant de 150-160 caractères
3. Contenu structuré en Markdown avec :
   - Introduction engageante
   - 3-5 sections avec sous-titres (##)
   - Exemples concrets et chiffres clés
   - Conseils actionnables
   - Conclusion avec CTA

**Format de réponse** :
TITRE: [Titre de l'article]
EXTRAIT: [Extrait de 150-160 caractères]
CONTENU:
[Contenu complet en Markdown]

**Ton** : Professionnel, expert, actionnable
**Longueur** : 1500-2000 mots
**Public** : Directeurs marketing, CMO, responsables commerciaux B2B`;
}

/**
 * Parse le contenu généré pour extraire titre, extrait et contenu
 */
function parseGeneratedContent(text: string) {
  const titleMatch = text.match(/TITRE:\s*(.+)/);
  const excerptMatch = text.match(/EXTRAIT:\s*(.+)/);
  const contentMatch = text.match(/CONTENU:\s*([\s\S]+)/);

  if (!titleMatch || !excerptMatch || !contentMatch) {
    throw new Error('Failed to parse generated content');
  }

  return {
    title: titleMatch[1].trim(),
    excerpt: excerptMatch[1].trim(),
    content: contentMatch[1].trim()
  };
}

/**
 * Génère un slug unique à partir du titre
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Éviter les tirets multiples
    .substring(0, 100); // Limiter la longueur
}

/**
 * Génère une URL de cover image basée sur la catégorie
 */
function generateCoverUrl(category: string): string {
  // Utiliser Unsplash Source pour des images de qualité
  const keywords = {
    'articles': 'business,marketing',
    'etudes-de-cas': 'analytics,data',
    'cas-clients': 'team,success',
    'infographies': 'charts,statistics',
    'chiffres-cles': 'numbers,growth'
  };

  const keyword = keywords[category as keyof typeof keywords] || 'business';
  return `https://source.unsplash.com/800x400/?${keyword}`;
}
