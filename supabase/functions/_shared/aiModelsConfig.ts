// ============================================
// AI MODELS CONFIGURATION - PREMIUM ROUTING
// ============================================
// Uses the best AI models available for each subscription tier

export interface AIModelConfig {
  provider: string;
  model: string;
  displayName: string;
  description: string;
  maxTokens: number;
  temperature: number;
  costPer1MTokens: number; // Cost in USD per 1M tokens
  capabilities: string[];
  apiEndpoint?: string;
}

export interface PlanAIConfig {
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise';
  primaryModel: AIModelConfig;
  researchModel: AIModelConfig;
  analysisModel: AIModelConfig;
  writingModel: AIModelConfig;
  fallbackModel?: AIModelConfig;
  totalCostPer1MTokens: number;
}

// ============================================
// AVAILABLE AI MODELS
// ============================================

const GEMINI_2_5_FLASH_LITE: AIModelConfig = {
  provider: 'Google',
  model: 'gemini-2.5-flash-lite',
  displayName: 'Gemini 2.5 Flash Lite',
  description: 'Modèle rapide pour diagnostics express',
  maxTokens: 4000,
  temperature: 0.7,
  costPer1MTokens: 0.075,
  capabilities: ['text', 'analysis'],
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'
};

const GEMINI_2_5_FLASH: AIModelConfig = {
  provider: 'Google',
  model: 'gemini-2.5-flash',
  displayName: 'Gemini 2.5 Flash',
  description: 'Équilibre optimal vitesse/qualité',
  maxTokens: 12000,
  temperature: 0.7,
  costPer1MTokens: 0.15,
  capabilities: ['text', 'analysis', 'reasoning'],
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
};

const GEMINI_3_PRO: AIModelConfig = {
  provider: 'Google',
  model: 'gemini-3-pro',
  displayName: 'Gemini 3 Pro',
  description: 'Raisonnement avancé et analyse approfondie',
  maxTokens: 24000,
  temperature: 0.7,
  costPer1MTokens: 1.25,
  capabilities: ['text', 'analysis', 'reasoning', 'coding', 'multimodal'],
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro:generateContent'
};

const CLAUDE_SONNET_4: AIModelConfig = {
  provider: 'Anthropic',
  model: 'claude-sonnet-4-20250514',
  displayName: 'Claude Sonnet 4',
  description: 'Excellence en analyse stratégique et rédaction',
  maxTokens: 16000,
  temperature: 0.7,
  costPer1MTokens: 3.00,
  capabilities: ['text', 'analysis', 'reasoning', 'writing', 'coding'],
  apiEndpoint: 'https://api.anthropic.com/v1/messages'
};

const CLAUDE_OPUS_4_5: AIModelConfig = {
  provider: 'Anthropic',
  model: 'claude-opus-4.5-20250514',
  displayName: 'Claude Opus 4.5',
  description: 'Le meilleur modèle pour analyses ultra-complexes',
  maxTokens: 32000,
  temperature: 0.7,
  costPer1MTokens: 15.00,
  capabilities: ['text', 'analysis', 'reasoning', 'writing', 'coding', 'research'],
  apiEndpoint: 'https://api.anthropic.com/v1/messages'
};

const GPT_4O: AIModelConfig = {
  provider: 'OpenAI',
  model: 'gpt-4o',
  displayName: 'GPT-4o',
  description: 'Multimodal avancé avec vision et audio',
  maxTokens: 16000,
  temperature: 0.7,
  costPer1MTokens: 2.50,
  capabilities: ['text', 'analysis', 'reasoning', 'vision', 'audio'],
  apiEndpoint: 'https://api.openai.com/v1/chat/completions'
};

const GPT_5_2: AIModelConfig = {
  provider: 'OpenAI',
  model: 'gpt-5.2',
  displayName: 'GPT-5.2',
  description: 'Modèle de pointe pour raisonnement complexe',
  maxTokens: 32000,
  temperature: 0.7,
  costPer1MTokens: 20.00,
  capabilities: ['text', 'analysis', 'reasoning', 'coding', 'research', 'vision'],
  apiEndpoint: 'https://api.openai.com/v1/chat/completions'
};

const PERPLEXITY_SONAR_PRO: AIModelConfig = {
  provider: 'Perplexity',
  model: 'sonar-pro',
  displayName: 'Perplexity Sonar Pro',
  description: 'Recherche web en temps réel avec citations',
  maxTokens: 16000,
  temperature: 0.7,
  costPer1MTokens: 3.00,
  capabilities: ['text', 'research', 'web-search', 'citations'],
  apiEndpoint: 'https://api.perplexity.ai/chat/completions'
};

const PERPLEXITY_SONAR_REASONING: AIModelConfig = {
  provider: 'Perplexity',
  model: 'sonar-reasoning',
  displayName: 'Perplexity Sonar Reasoning',
  description: 'Raisonnement profond avec recherche web',
  maxTokens: 24000,
  temperature: 0.7,
  costPer1MTokens: 5.00,
  capabilities: ['text', 'research', 'reasoning', 'web-search', 'citations'],
  apiEndpoint: 'https://api.perplexity.ai/chat/completions'
};

// ============================================
// CONFIGURATION PAR PLAN
// ============================================

export const AI_MODELS_BY_PLAN: Record<string, PlanAIConfig> = {
  freemium: {
    plan: 'freemium',
    primaryModel: GEMINI_2_5_FLASH_LITE,
    researchModel: GEMINI_2_5_FLASH_LITE,
    analysisModel: GEMINI_2_5_FLASH_LITE,
    writingModel: GEMINI_2_5_FLASH_LITE,
    fallbackModel: GEMINI_2_5_FLASH,
    totalCostPer1MTokens: 0.075
  },
  
  pro: {
    plan: 'pro',
    primaryModel: GEMINI_2_5_FLASH,
    researchModel: PERPLEXITY_SONAR_PRO,
    analysisModel: GEMINI_3_PRO,
    writingModel: CLAUDE_SONNET_4,
    fallbackModel: GEMINI_2_5_FLASH,
    totalCostPer1MTokens: 1.94 // Average: (0.15 + 3.00 + 1.25 + 3.00) / 4
  },
  
  agency: {
    plan: 'agency',
    primaryModel: GEMINI_3_PRO,
    researchModel: PERPLEXITY_SONAR_REASONING,
    analysisModel: CLAUDE_SONNET_4,
    writingModel: GPT_4O,
    fallbackModel: GEMINI_3_PRO,
    totalCostPer1MTokens: 2.94 // Average: (1.25 + 5.00 + 3.00 + 2.50) / 4
  },
  
  enterprise: {
    plan: 'enterprise',
    primaryModel: CLAUDE_OPUS_4_5,
    researchModel: PERPLEXITY_SONAR_REASONING,
    analysisModel: GPT_5_2,
    writingModel: CLAUDE_OPUS_4_5,
    fallbackModel: CLAUDE_SONNET_4,
    totalCostPer1MTokens: 11.25 // Average: (15.00 + 5.00 + 20.00 + 15.00) / 4
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get AI model configuration for a specific plan
 */
export function getAIConfigForPlan(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): PlanAIConfig {
  return AI_MODELS_BY_PLAN[plan] || AI_MODELS_BY_PLAN.freemium;
}

/**
 * Get the best model for a specific task type
 */
export function getModelForTask(
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise',
  taskType: 'research' | 'analysis' | 'writing' | 'general'
): AIModelConfig {
  const config = getAIConfigForPlan(plan);
  
  switch (taskType) {
    case 'research':
      return config.researchModel;
    case 'analysis':
      return config.analysisModel;
    case 'writing':
      return config.writingModel;
    default:
      return config.primaryModel;
  }
}

/**
 * Calculate estimated cost for an audit based on plan
 */
export function calculateAuditCost(
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise',
  estimatedTokens: number
): number {
  const config = getAIConfigForPlan(plan);
  return (estimatedTokens / 1_000_000) * config.totalCostPer1MTokens;
}

/**
 * Get human-readable model description for display
 */
export function getModelDisplayInfo(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): string {
  const config = getAIConfigForPlan(plan);
  
  const models = [
    config.primaryModel.displayName,
    config.researchModel.displayName,
    config.analysisModel.displayName,
    config.writingModel.displayName
  ];
  
  // Remove duplicates
  const uniqueModels = [...new Set(models)];
  
  if (uniqueModels.length === 1) {
    return uniqueModels[0];
  } else if (uniqueModels.length === 2) {
    return `${uniqueModels[0]} + ${uniqueModels[1]}`;
  } else {
    return `${uniqueModels[0]} + ${uniqueModels.length - 1} autres modèles premium`;
  }
}

/**
 * Get detailed model breakdown for pricing page
 */
export function getModelBreakdown(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): string[] {
  const config = getAIConfigForPlan(plan);
  
  const breakdown: string[] = [];
  
  // Add unique models with their use cases
  const modelUseCases = new Map<string, string[]>();
  
  if (config.researchModel.model === config.primaryModel.model) {
    modelUseCases.set(config.primaryModel.displayName, ['Recherche', 'Analyse', 'Rédaction']);
  } else {
    modelUseCases.set(config.researchModel.displayName, ['Recherche web']);
    modelUseCases.set(config.analysisModel.displayName, ['Analyse stratégique']);
    modelUseCases.set(config.writingModel.displayName, ['Rédaction']);
  }
  
  modelUseCases.forEach((useCases, modelName) => {
    breakdown.push(`${modelName} (${useCases.join(', ')})`);
  });
  
  return breakdown;
}

/**
 * Estimate tokens for an audit based on plan
 */
export function estimateTokensForPlan(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): number {
  const estimates: Record<string, number> = {
    freemium: 50_000,      // ~50K tokens for 7 agents
    pro: 200_000,          // ~200K tokens for 12 agents
    agency: 500_000,       // ~500K tokens for 15 agents
    enterprise: 1_000_000  // ~1M tokens for 17 agents
  };
  
  return estimates[plan] || estimates.freemium;
}

/**
 * Calculate cost per audit for pricing transparency
 */
export function getCostPerAudit(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): number {
  const tokens = estimateTokensForPlan(plan);
  return calculateAuditCost(plan, tokens);
}
