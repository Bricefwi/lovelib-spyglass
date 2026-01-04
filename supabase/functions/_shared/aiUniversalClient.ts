// ============================================================================
// AI UNIVERSAL CLIENT - IMOTION MANUS IA 2.0
// ============================================================================
// Ce client route automatiquement les appels vers les bonnes APIs:
// - OpenAI (GPT-5.2, GPT-5.1, GPT-5, O1-pro)
// - Anthropic (Claude Opus 4.5, Claude Sonnet 4.5)
// - Perplexity (Sonar Pro, Sonar Reasoning, Sonar Deep Research)
// - Google (Gemini 3.0 Pro, Gemini 2.5 Flash)
// ============================================================================
// Version: 2.0
// Date: Janvier 2026
// ============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'perplexity' | 'google' | 'lovable';

export interface AICallOptions {
  model: string;
  provider: AIProvider;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  returnCitations?: boolean;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  citations?: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  lovable: 'https://ai.gateway.lovable.dev/v1/chat/completions'
};

// ============================================================================
// MODEL MAPPINGS - Derniers modèles disponibles Janvier 2026
// ============================================================================

export const LATEST_MODELS = {
  // OpenAI - GPT-5 Series (Janvier 2026)
  openai: {
    'gpt-5.2-pro': 'gpt-5-2025-08-07',           // Top-tier Enterprise - Le meilleur
    'gpt-5.2': 'gpt-5-2025-08-07',               // Standard GPT-5.2
    'gpt-5.1': 'gpt-5-2025-08-07',               // GPT-5.1
    'gpt-5': 'gpt-5-2025-08-07',                 // GPT-5 base
    'gpt-5-mini': 'gpt-5-mini-2025-08-07',       // Économique
    'gpt-4o': 'gpt-4o',                          // Fallback
    'o1-pro': 'o3-2025-04-16',                   // Reasoning avancé - Excellent pour stratégie
    'o1': 'o4-mini-2025-04-16',                  // Reasoning standard
  },
  
  // Anthropic - Claude 4.5 Series (Les meilleurs modèles Claude)
  anthropic: {
    'claude-opus-4-5': 'claude-opus-4-5-20251101',     // TOP-TIER - Le plus intelligent
    'claude-sonnet-4-5': 'claude-sonnet-4-5',          // Excellent rapport qualité/performance
    'claude-haiku-4-5': 'claude-3-5-haiku-20241022',   // Fast & économique
  },
  
  // Perplexity - Sonar Series (Pro & Labs - Les meilleurs pour la recherche)
  perplexity: {
    'sonar-deep-research': 'sonar-deep-research',   // LABS - Deep Research ultra-profond
    'sonar-reasoning-pro': 'sonar-reasoning-pro',   // Reasoning avancé avec citations
    'sonar-reasoning': 'sonar-reasoning',           // Reasoning standard
    'sonar-pro': 'sonar-pro',                       // PRO - Recherche avancée avec citations
    'sonar': 'sonar',                               // Standard
  },
  
  // Google - Gemini Series
  google: {
    'gemini-3-pro': 'gemini-2.5-pro',               // Pro avec Deep Research
    'gemini-3-flash': 'gemini-2.5-flash',           // Flash rapide
    'gemini-2.5-pro': 'gemini-2.5-pro',             // Pro preview
    'gemini-2.5-flash': 'gemini-2.5-flash',         // Flash économique
    'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite', // Ultra économique (Freemium)
  }
};

// ============================================================================
// MAIN CALL FUNCTION
// ============================================================================

export async function callAI(options: AICallOptions): Promise<AIResponse> {
  const {
    model,
    provider,
    systemPrompt,
    userPrompt,
    maxTokens = 8000,
    temperature = 0.7,
    returnCitations = false
  } = options;

  console.log(`🤖 AI Call: ${provider}/${model}`);
  console.log(`   Max tokens: ${maxTokens}, Temperature: ${temperature}`);

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(model, systemPrompt, userPrompt, maxTokens, temperature);
      
      case 'anthropic':
        return await callAnthropic(model, systemPrompt, userPrompt, maxTokens, temperature);
      
      case 'perplexity':
        return await callPerplexity(model, systemPrompt, userPrompt, maxTokens, temperature, returnCitations);
      
      case 'google':
        return await callGoogle(model, systemPrompt, userPrompt, maxTokens, temperature);
      
      case 'lovable':
      default:
        return await callLovableGateway(model, systemPrompt, userPrompt, maxTokens, temperature);
    }
  } catch (error) {
    console.error(`❌ AI Call Error (${provider}/${model}):`, error);
    
    // Tentative de fallback
    return await handleFallback(options, error);
  }
}

// ============================================================================
// OPENAI IMPLEMENTATION
// ============================================================================

async function callOpenAI(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<AIResponse> {
  
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Résoudre le nom du modèle
  const resolvedModel = LATEST_MODELS.openai[model as keyof typeof LATEST_MODELS.openai] || model;

  const response = await fetch(API_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    model: resolvedModel,
    provider: 'openai',
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
}

// ============================================================================
// ANTHROPIC IMPLEMENTATION
// ============================================================================

async function callAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<AIResponse> {
  
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Résoudre le nom du modèle
  const resolvedModel = LATEST_MODELS.anthropic[model as keyof typeof LATEST_MODELS.anthropic] || model;

  const response = await fetch(API_ENDPOINTS.anthropic, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: resolvedModel,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  
  // Extraire le contenu de la réponse Anthropic
  const content = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n');

  return {
    content,
    model: resolvedModel,
    provider: 'anthropic',
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    }
  };
}

// ============================================================================
// PERPLEXITY IMPLEMENTATION (avec citations)
// ============================================================================

async function callPerplexity(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number,
  returnCitations: boolean
): Promise<AIResponse> {
  
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY') || Deno.env.get('SONAR_API_KEY');
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  // Résoudre le nom du modèle
  const resolvedModel = LATEST_MODELS.perplexity[model as keyof typeof LATEST_MODELS.perplexity] || model;

  const response = await fetch(API_ENDPOINTS.perplexity, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      return_citations: returnCitations,
      return_images: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    model: resolvedModel,
    provider: 'perplexity',
    citations: data.citations || [],
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
}

// ============================================================================
// GOOGLE IMPLEMENTATION
// ============================================================================

async function callGoogle(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<AIResponse> {
  
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  // Résoudre le nom du modèle
  const resolvedModel = LATEST_MODELS.google[model as keyof typeof LATEST_MODELS.google] || model;

  const endpoint = `${API_ENDPOINTS.google}/${resolvedModel}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  
  // Extraire le contenu de la réponse Google
  const content = data.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text)
    .join('\n') || '';

  return {
    content,
    model: resolvedModel,
    provider: 'google',
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0
    }
  };
}

// ============================================================================
// LOVABLE GATEWAY (Fallback)
// ============================================================================

async function callLovableGateway(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<AIResponse> {
  
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const response = await fetch(API_ENDPOINTS.lovable, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lovable Gateway error ${response.status}: ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    model: model,
    provider: 'lovable',
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
}

// ============================================================================
// FALLBACK HANDLER
// ============================================================================

async function handleFallback(options: AICallOptions, originalError: any): Promise<AIResponse> {
  console.log(`⚠️ Attempting fallback for ${options.provider}/${options.model}`);
  
  const fallbackChain = [
    { provider: 'anthropic' as AIProvider, model: 'claude-sonnet-4-5' },
    { provider: 'openai' as AIProvider, model: 'gpt-5' },
    { provider: 'google' as AIProvider, model: 'gemini-3-pro' },
    { provider: 'lovable' as AIProvider, model: 'google/gemini-2.5-flash' }
  ];

  for (const fallback of fallbackChain) {
    if (fallback.provider === options.provider) continue; // Skip the failed provider
    
    try {
      console.log(`   🔄 Trying fallback: ${fallback.provider}/${fallback.model}`);
      
      return await callAI({
        ...options,
        provider: fallback.provider,
        model: fallback.model
      });
    } catch (error) {
      console.log(`   ❌ Fallback failed: ${fallback.provider}/${fallback.model}`);
      continue;
    }
  }

  // Si tous les fallbacks échouent
  return {
    content: '',
    model: options.model,
    provider: options.provider,
    error: `All AI providers failed. Original error: ${originalError.message}`
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Appel parallèle à plusieurs modèles pour comparaison
 */
export async function callMultipleModels(
  models: Array<{ provider: AIProvider; model: string }>,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4000
): Promise<AIResponse[]> {
  
  const calls = models.map(m => callAI({
    provider: m.provider,
    model: m.model,
    systemPrompt,
    userPrompt,
    maxTokens,
    temperature: 0.7
  }));

  return await Promise.all(calls);
}

/**
 * Recherche approfondie avec Perplexity
 */
export async function deepResearch(
  query: string,
  model: 'sonar-pro' | 'sonar-reasoning' | 'sonar-deep-research' = 'sonar-pro'
): Promise<AIResponse> {
  
  return await callAI({
    provider: 'perplexity',
    model: model,
    systemPrompt: `Vous êtes un analyste de recherche senior. Fournissez des informations détaillées, sourcées et vérifiables. Répondez en français. Citez toutes vos sources.`,
    userPrompt: query,
    maxTokens: 12000,
    temperature: 0.3,
    returnCitations: true
  });
}

/**
 * Synthèse avec Claude Opus 4.5
 */
export async function premiumSynthesis(
  content: string,
  instructions: string
): Promise<AIResponse> {
  
  return await callAI({
    provider: 'anthropic',
    model: 'claude-opus-4-5',
    systemPrompt: `Vous êtes un consultant senior de McKinsey. Synthétisez et structurez les informations avec un niveau de qualité C-Level. Répondez en français.`,
    userPrompt: `${instructions}\n\nCONTENU À SYNTHÉTISER:\n${content}`,
    maxTokens: 16000,
    temperature: 0.5
  });
}

/**
 * Vérification des clés API disponibles
 */
export function checkAvailableProviders(): Record<AIProvider, boolean> {
  return {
    openai: !!Deno.env.get('OPENAI_API_KEY'),
    anthropic: !!Deno.env.get('ANTHROPIC_API_KEY'),
    perplexity: !!(Deno.env.get('PERPLEXITY_API_KEY') || Deno.env.get('SONAR_API_KEY')),
    google: !!(Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY')),
    lovable: !!Deno.env.get('LOVABLE_API_KEY')
  };
}

export default callAI;
