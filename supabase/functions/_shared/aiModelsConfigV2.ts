// ============================================================================
// AI MODELS CONFIGURATION - PREMIUM ROUTING V2.0
// ============================================================================
// Stratégie: "Crescendo" - Plus le plan est élevé, plus l'IA est puissante
// Chaque tâche est routée vers le meilleur modèle pour ce job spécifique
// ============================================================================
// Version: 2.0
// Date: Janvier 2026
// Modèles: Claude Opus 4.5, GPT-5.2, Perplexity Deep Research, Gemini 3 Pro
// ============================================================================

export type PlanTier = 'freemium' | 'pro' | 'agency' | 'enterprise';
export type TaskType = 'research' | 'analysis' | 'strategy' | 'writing' | 'synthesis' | 'verification';
export type AIProvider = 'openai' | 'anthropic' | 'perplexity' | 'google' | 'lovable';

export interface ModelConfig {
  model: string;
  provider: AIProvider;
  maxTokens: number;
  temperature: number;
  description: string;
}

export interface PlanAIConfig {
  planName: string;
  displayModels: string;
  research: ModelConfig;
  analysis: ModelConfig;
  strategy: ModelConfig;
  writing: ModelConfig;
  synthesis: ModelConfig;
  verification: ModelConfig;
  searchDepth: 'basic' | 'advanced' | 'deep' | 'ultra';
  maxScrapingChars: number;
  breakpoints: string[];
  expectedPages: string;
  agentCount: number;
  infographicsCount: number;
}

// ============================================================================
// CONFIGURATION PREMIUM PAR PLAN - JANVIER 2026
// ============================================================================
export const AI_MODELS_CONFIG: Record<PlanTier, PlanAIConfig> = {
  // =========================================================================
  // FREEMIUM - Fast & Economical
  // Modèle: Gemini 2.5 Flash Lite uniquement
  // =========================================================================
  freemium: {
    planName: "Freemium",
    displayModels: "Gemini 2.5 Flash Lite",
    research: {
      model: "gemini-2.5-flash-lite",
      provider: "google",
      maxTokens: 4000,
      temperature: 0.5,
      description: "Recherche rapide et économique"
    },
    analysis: {
      model: "gemini-2.5-flash-lite",
      provider: "google",
      maxTokens: 4000,
      temperature: 0.3,
      description: "Analyse basique"
    },
    strategy: {
      model: "gemini-2.5-flash-lite",
      provider: "google",
      maxTokens: 4000,
      temperature: 0.5,
      description: "Stratégie express"
    },
    writing: {
      model: "gemini-2.5-flash-lite",
      provider: "google",
      maxTokens: 4000,
      temperature: 0.7,
      description: "Rédaction automatique"
    },
    synthesis: {
      model: "gemini-2.5-flash-lite",
      provider: "google",
      maxTokens: 4000,
      temperature: 0.4,
      description: "Synthèse rapide"
    },
    verification: {
      model: "gemini-2.5-flash-lite",
      provider: "google",
      maxTokens: 2000,
      temperature: 0.2,
      description: "Vérification basique"
    },
    searchDepth: "basic",
    maxScrapingChars: 10000,
    breakpoints: [],
    expectedPages: "15-20",
    agentCount: 7,
    infographicsCount: 3
  },

  // =========================================================================
  // PRO - Balanced Performance
  // Modèles: Claude Sonnet 4.5 + Perplexity Sonar Pro + Gemini 3 Pro
  // =========================================================================
  pro: {
    planName: "Pro",
    displayModels: "Claude Sonnet 4.5 + Perplexity Sonar Pro + Gemini 3 Pro",
    research: {
      model: "sonar-pro",
      provider: "perplexity",
      maxTokens: 8000,
      temperature: 0.3,
      description: "Recherche web avancée avec Perplexity Sonar Pro"
    },
    analysis: {
      model: "gemini-3-pro",
      provider: "google",
      maxTokens: 16000,
      temperature: 0.3,
      description: "Analyse approfondie avec Gemini 3 Pro"
    },
    strategy: {
      model: "claude-sonnet-4-5",
      provider: "anthropic",
      maxTokens: 16000,
      temperature: 0.5,
      description: "Stratégie avec Claude Sonnet 4.5"
    },
    writing: {
      model: "claude-sonnet-4-5",
      provider: "anthropic",
      maxTokens: 16000,
      temperature: 0.7,
      description: "Rédaction premium avec Claude Sonnet 4.5"
    },
    synthesis: {
      model: "gemini-3-pro",
      provider: "google",
      maxTokens: 12000,
      temperature: 0.4,
      description: "Synthèse stratégique avec Gemini 3 Pro"
    },
    verification: {
      model: "sonar-pro",
      provider: "perplexity",
      maxTokens: 4000,
      temperature: 0.2,
      description: "Vérification des sources avec Perplexity"
    },
    searchDepth: "advanced",
    maxScrapingChars: 30000,
    breakpoints: ["AFTER_DIAGNOSIS"],
    expectedPages: "35-50",
    agentCount: 12,
    infographicsCount: 8
  },

  // =========================================================================
  // AGENCY - Advanced Analysis (White Label)
  // Modèles: Claude Opus 4.5 + GPT-5.1 + Perplexity Sonar Reasoning PRO
  // =========================================================================
  agency: {
    planName: "Agency",
    displayModels: "Claude Opus 4.5 + GPT-5.1 + Perplexity Sonar Reasoning PRO",
    research: {
      model: "sonar-reasoning-pro",
      provider: "perplexity",
      maxTokens: 12000,
      temperature: 0.2,
      description: "Recherche approfondie avec Perplexity Sonar Reasoning PRO"
    },
    analysis: {
      model: "claude-opus-4-5",
      provider: "anthropic",
      maxTokens: 24000,
      temperature: 0.3,
      description: "Analyse stratégique avec Claude Opus 4.5"
    },
    strategy: {
      model: "gpt-5.1",
      provider: "openai",
      maxTokens: 24000,
      temperature: 0.5,
      description: "Stratégie avancée avec GPT-5.1"
    },
    writing: {
      model: "claude-opus-4-5",
      provider: "anthropic",
      maxTokens: 24000,
      temperature: 0.7,
      description: "Rédaction consulting avec Claude Opus 4.5"
    },
    synthesis: {
      model: "gpt-5.1",
      provider: "openai",
      maxTokens: 20000,
      temperature: 0.4,
      description: "Synthèse exécutive avec GPT-5.1"
    },
    verification: {
      model: "sonar-reasoning-pro",
      provider: "perplexity",
      maxTokens: 8000,
      temperature: 0.2,
      description: "Vérification croisée avec Perplexity Sonar Reasoning PRO"
    },
    searchDepth: "deep",
    maxScrapingChars: 50000,
    breakpoints: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS"],
    expectedPages: "60-80",
    agentCount: 15,
    infographicsCount: 15
  },

  // =========================================================================
  // ENTERPRISE - Maximum Quality (McKinsey/BCG Level)
  // Modèles: Claude Opus 4.5 + GPT-5.2 Pro + Perplexity Deep Research (Labs) + O1-Pro
  // =========================================================================
  enterprise: {
    planName: "Enterprise",
    displayModels: "Claude Opus 4.5 + GPT-5.2 Pro + Perplexity Deep Research (Labs) + O1-Pro",
    research: {
      model: "sonar-deep-research",
      provider: "perplexity",
      maxTokens: 16000,
      temperature: 0.2,
      description: "Deep Research ultra-profond avec Perplexity Labs"
    },
    analysis: {
      model: "gpt-5.2-pro",
      provider: "openai",
      maxTokens: 32000,
      temperature: 0.2,
      description: "Analyse experte avec GPT-5.2 Pro (Top-tier)"
    },
    strategy: {
      model: "claude-opus-4-5",
      provider: "anthropic",
      maxTokens: 32000,
      temperature: 0.4,
      description: "Stratégie C-Level avec Claude Opus 4.5 (Le plus intelligent)"
    },
    writing: {
      model: "claude-opus-4-5",
      provider: "anthropic",
      maxTokens: 32000,
      temperature: 0.6,
      description: "Rédaction McKinsey-level avec Claude Opus 4.5"
    },
    synthesis: {
      model: "o1-pro",
      provider: "openai",
      maxTokens: 32000,
      temperature: 0.3,
      description: "Synthèse exécutive C-Level avec O1-Pro (Reasoning avancé)"
    },
    verification: {
      model: "sonar-deep-research",
      provider: "perplexity",
      maxTokens: 12000,
      temperature: 0.1,
      description: "Vérification exhaustive avec Perplexity Deep Research (Labs)"
    },
    searchDepth: "ultra",
    maxScrapingChars: 100000,
    breakpoints: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS", "AFTER_STRATEGY"],
    expectedPages: "100-150",
    agentCount: 17,
    infographicsCount: 25
  }
};

// ============================================================================
// API ENDPOINTS PAR PROVIDER
// ============================================================================
export const PROVIDER_ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  perplexity: "https://api.perplexity.ai/chat/completions",
  google: "https://generativelanguage.googleapis.com/v1beta/models",
  lovable: "https://ai.gateway.lovable.dev/v1/chat/completions"
};

// ============================================================================
// COÛTS ESTIMÉS PAR MODÈLE (pour transparence et monitoring)
// ============================================================================
export const MODEL_COSTS = {
  // Google Gemini
  "gemini-2.5-flash-lite": { input: 0.075, output: 0.30, unit: "1M tokens" },
  "gemini-2.5-flash": { input: 0.15, output: 0.60, unit: "1M tokens" },
  "gemini-3-pro": { input: 1.25, output: 5.00, unit: "1M tokens" },
  
  // Anthropic Claude
  "claude-sonnet-4-5": { input: 3.00, output: 15.00, unit: "1M tokens" },
  "claude-opus-4-5": { input: 15.00, output: 75.00, unit: "1M tokens" },
  
  // OpenAI GPT-5
  "gpt-5": { input: 5.00, output: 15.00, unit: "1M tokens" },
  "gpt-5.1": { input: 7.50, output: 22.50, unit: "1M tokens" },
  "gpt-5.2-pro": { input: 15.00, output: 60.00, unit: "1M tokens" },
  "o1-pro": { input: 20.00, output: 80.00, unit: "1M tokens" },
  
  // Perplexity Sonar
  "sonar": { input: 1.00, output: 5.00, unit: "1M tokens" },
  "sonar-pro": { input: 3.00, output: 15.00, unit: "1M tokens" },
  "sonar-reasoning": { input: 5.00, output: 25.00, unit: "1M tokens" },
  "sonar-deep-research": { input: 10.00, output: 50.00, unit: "1M tokens" }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the AI configuration for a specific plan
 */
export function getAIConfigForPlan(plan: string): PlanAIConfig {
  const normalizedPlan = plan.toLowerCase() as PlanTier;
  return AI_MODELS_CONFIG[normalizedPlan] || AI_MODELS_CONFIG.freemium;
}

/**
 * Get the model for a specific task and plan
 */
export function getModelForTask(plan: string, task: TaskType): ModelConfig {
  const config = getAIConfigForPlan(plan);
  return config[task];
}

/**
 * Get display string for pricing page
 */
export function getDisplayModelsForPlan(plan: string): string {
  const config = getAIConfigForPlan(plan);
  return config.displayModels;
}

/**
 * Check if a plan has a specific breakpoint
 */
export function hasBreakpoint(plan: string, breakpoint: string): boolean {
  const config = getAIConfigForPlan(plan);
  return config.breakpoints.includes(breakpoint);
}

/**
 * Get expected page count for a plan
 */
export function getExpectedPages(plan: string): string {
  const config = getAIConfigForPlan(plan);
  return config.expectedPages;
}

/**
 * Get agent count for a plan
 */
export function getAgentCount(plan: string): number {
  const config = getAIConfigForPlan(plan);
  return config.agentCount;
}

/**
 * Get infographics count for a plan
 */
export function getInfographicsCount(plan: string): number {
  const config = getAIConfigForPlan(plan);
  return config.infographicsCount;
}

/**
 * Get estimated cost for a plan (rough estimate)
 */
export function getEstimatedCost(plan: string): { min: number; max: number; currency: string } {
  const costsByPlan: Record<string, { min: number; max: number }> = {
    freemium: { min: 0.05, max: 0.15 },
    pro: { min: 0.50, max: 1.50 },
    agency: { min: 2.00, max: 5.00 },
    enterprise: { min: 5.00, max: 15.00 }
  };
  
  const costs = costsByPlan[plan.toLowerCase()] || costsByPlan.freemium;
  return { ...costs, currency: 'USD' };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that all required API keys are present for a plan
 */
export function validateApiKeysForPlan(plan: string): { valid: boolean; missing: string[] } {
  const config = getAIConfigForPlan(plan);
  const missing: string[] = [];
  
  const requiredKeys: Record<AIProvider, string[]> = {
    openai: ['OPENAI_API_KEY'],
    anthropic: ['ANTHROPIC_API_KEY'],
    perplexity: ['PERPLEXITY_API_KEY', 'SONAR_API_KEY'],
    google: ['GOOGLE_AI_API_KEY', 'GEMINI_API_KEY'],
    lovable: ['LOVABLE_API_KEY']
  };
  
  // Get all unique providers used in this plan
  const usedProviders = new Set<AIProvider>();
  Object.values(config).forEach(val => {
    if (val && typeof val === 'object' && 'provider' in val) {
      usedProviders.add(val.provider as AIProvider);
    }
  });
  
  // Check each provider has at least one key
  for (const provider of usedProviders) {
    const keys = requiredKeys[provider] || [];
    const hasKey = keys.some(key => !!Deno.env.get(key));
    if (!hasKey && keys.length > 0) {
      missing.push(keys[0]);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

export default AI_MODELS_CONFIG;
