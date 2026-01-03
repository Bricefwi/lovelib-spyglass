// ============================================
// AI MODELS CONFIGURATION - PREMIUM ROUTING
// ============================================
// Strategy: "Crescendo" - The higher the plan, the more powerful the AI
// Each task is routed to the best model for that specific job
// Updated: January 2026
// ============================================

export type PlanTier = 'freemium' | 'pro' | 'agency' | 'enterprise';
export type TaskType = 'research' | 'analysis' | 'strategy' | 'writing' | 'synthesis';

export interface ModelConfig {
  model: string;
  provider: 'lovable' | 'anthropic' | 'openai' | 'perplexity';
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
  searchDepth: 'basic' | 'advanced' | 'deep';
  maxScrapingChars: number;
  breakpoints: string[];
}

// ============================================
// PREMIUM AI MODELS BY PLAN
// ============================================
export const AI_MODELS_CONFIG: Record<PlanTier, PlanAIConfig> = {
  // ----------------------------------------
  // FREEMIUM - Fast & Economical
  // ----------------------------------------
  freemium: {
    planName: "Freemium",
    displayModels: "Gemini 2.5 Flash Lite",
    research: {
      model: "google/gemini-2.5-flash-lite",
      provider: "lovable",
      maxTokens: 4000,
      temperature: 0.5,
      description: "Recherche rapide et économique"
    },
    analysis: {
      model: "google/gemini-2.5-flash-lite",
      provider: "lovable",
      maxTokens: 4000,
      temperature: 0.3,
      description: "Analyse basique"
    },
    strategy: {
      model: "google/gemini-2.5-flash-lite",
      provider: "lovable",
      maxTokens: 4000,
      temperature: 0.5,
      description: "Stratégie express"
    },
    writing: {
      model: "google/gemini-2.5-flash-lite",
      provider: "lovable",
      maxTokens: 4000,
      temperature: 0.7,
      description: "Rédaction automatique"
    },
    synthesis: {
      model: "google/gemini-2.5-flash-lite",
      provider: "lovable",
      maxTokens: 4000,
      temperature: 0.4,
      description: "Synthèse rapide"
    },
    searchDepth: "basic",
    maxScrapingChars: 10000,
    breakpoints: []
  },

  // ----------------------------------------
  // PRO - Balanced Performance
  // Gemini 3 Pro + Claude Sonnet 4 + Perplexity Sonar Pro
  // ----------------------------------------
  pro: {
    planName: "Pro",
    displayModels: "Gemini 3 Pro + Claude Sonnet 4 + Perplexity Sonar Pro",
    research: {
      model: "perplexity/sonar-pro",
      provider: "perplexity",
      maxTokens: 8000,
      temperature: 0.3,
      description: "Recherche web avancée avec Perplexity"
    },
    analysis: {
      model: "google/gemini-3-pro-preview",
      provider: "lovable",
      maxTokens: 16000,
      temperature: 0.3,
      description: "Analyse approfondie avec Gemini 3 Pro"
    },
    strategy: {
      model: "google/gemini-3-pro-preview",
      provider: "lovable",
      maxTokens: 16000,
      temperature: 0.5,
      description: "Stratégie avec Gemini 3 Pro"
    },
    writing: {
      model: "claude-sonnet-4-5",
      provider: "anthropic",
      maxTokens: 16000,
      temperature: 0.7,
      description: "Rédaction premium avec Claude Sonnet 4"
    },
    synthesis: {
      model: "google/gemini-3-pro-preview",
      provider: "lovable",
      maxTokens: 12000,
      temperature: 0.4,
      description: "Synthèse stratégique"
    },
    searchDepth: "advanced",
    maxScrapingChars: 20000,
    breakpoints: ["AFTER_DIAGNOSIS"]
  },

  // ----------------------------------------
  // AGENCY - Advanced Analysis
  // Gemini 3 Pro + Claude Sonnet 4 + GPT-5 + Perplexity Reasoning
  // ----------------------------------------
  agency: {
    planName: "Agency",
    displayModels: "Gemini 3 Pro + Claude Sonnet 4 + GPT-5 + Perplexity Reasoning",
    research: {
      model: "perplexity/sonar-reasoning",
      provider: "perplexity",
      maxTokens: 12000,
      temperature: 0.2,
      description: "Recherche approfondie avec raisonnement"
    },
    analysis: {
      model: "claude-sonnet-4-5",
      provider: "anthropic",
      maxTokens: 24000,
      temperature: 0.3,
      description: "Analyse stratégique avec Claude Sonnet 4"
    },
    strategy: {
      model: "google/gemini-3-pro-preview",
      provider: "lovable",
      maxTokens: 24000,
      temperature: 0.5,
      description: "Stratégie avancée avec Gemini 3 Pro"
    },
    writing: {
      model: "openai/gpt-5",
      provider: "lovable",
      maxTokens: 24000,
      temperature: 0.7,
      description: "Rédaction consulting avec GPT-5"
    },
    synthesis: {
      model: "claude-sonnet-4-5",
      provider: "anthropic",
      maxTokens: 20000,
      temperature: 0.4,
      description: "Synthèse exécutive premium"
    },
    searchDepth: "deep",
    maxScrapingChars: 30000,
    breakpoints: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS"]
  },

  // ----------------------------------------
  // ENTERPRISE - Maximum Quality
  // Claude Opus 4.5 + GPT-5 + Gemini 3 Pro + Perplexity Reasoning
  // ----------------------------------------
  enterprise: {
    planName: "Enterprise",
    displayModels: "Claude Opus 4.5 + GPT-5 + Perplexity Reasoning",
    research: {
      model: "perplexity/sonar-reasoning",
      provider: "perplexity",
      maxTokens: 16000,
      temperature: 0.2,
      description: "Recherche ultra-profonde avec raisonnement"
    },
    analysis: {
      model: "openai/gpt-5",
      provider: "lovable",
      maxTokens: 32000,
      temperature: 0.2,
      description: "Analyse experte avec GPT-5"
    },
    strategy: {
      model: "claude-opus-4-5-20251101",
      provider: "anthropic",
      maxTokens: 32000,
      temperature: 0.4,
      description: "Stratégie de niveau C-Suite avec Claude Opus 4.5"
    },
    writing: {
      model: "claude-opus-4-5-20251101",
      provider: "anthropic",
      maxTokens: 32000,
      temperature: 0.6,
      description: "Rédaction McKinsey-level avec Claude Opus 4.5"
    },
    synthesis: {
      model: "claude-opus-4-5-20251101",
      provider: "anthropic",
      maxTokens: 32000,
      temperature: 0.3,
      description: "Synthèse exécutive C-Level"
    },
    searchDepth: "deep",
    maxScrapingChars: 50000,
    breakpoints: ["AFTER_DIAGNOSIS", "AFTER_MARKET_ANALYSIS", "AFTER_STRATEGY"]
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// ============================================
// API ENDPOINTS BY PROVIDER
// ============================================
export const PROVIDER_ENDPOINTS = {
  lovable: "https://ai.gateway.lovable.dev/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
  perplexity: "https://api.perplexity.ai/chat/completions"
};

// ============================================
// MODEL COST ESTIMATES (for transparency)
// ============================================
export const MODEL_COSTS = {
  "google/gemini-2.5-flash-lite": { input: 0.075, output: 0.30, unit: "1M tokens" },
  "google/gemini-2.5-flash": { input: 0.15, output: 0.60, unit: "1M tokens" },
  "google/gemini-3-pro-preview": { input: 1.25, output: 5.00, unit: "1M tokens" },
  "claude-sonnet-4-5": { input: 3.00, output: 15.00, unit: "1M tokens" },
  "claude-opus-4-5-20251101": { input: 15.00, output: 75.00, unit: "1M tokens" },
  "openai/gpt-5": { input: 5.00, output: 15.00, unit: "1M tokens" },
  "openai/gpt-5-mini": { input: 0.15, output: 0.60, unit: "1M tokens" },
  "perplexity/sonar-pro": { input: 3.00, output: 15.00, unit: "1M tokens" },
  "perplexity/sonar-reasoning": { input: 5.00, output: 25.00, unit: "1M tokens" }
};
