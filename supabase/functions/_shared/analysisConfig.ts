// ============================================
// ANALYSIS CONFIGURATION BY PLAN
// ============================================
// Defines which analyses are available for each subscription tier

export interface AnalysisModule {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  estimatedDuration: string;
  requiredPlan: 'freemium' | 'pro' | 'agency' | 'enterprise';
}

export const ANALYSIS_MODULES: AnalysisModule[] = [
  // CORE MODULES (Freemium)
  {
    id: 'technical_audit',
    name: 'Audit Technique',
    description: 'Analyse de la stack technique, performance, sécurité de base',
    agentCount: 2,
    estimatedDuration: '30s',
    requiredPlan: 'freemium'
  },
  {
    id: 'seo_express',
    name: 'SEO Express',
    description: 'Diagnostic SEO rapide (meta, structure, indexation)',
    agentCount: 1,
    estimatedDuration: '20s',
    requiredPlan: 'freemium'
  },
  {
    id: 'ux_quick_check',
    name: 'UX Quick Check',
    description: 'Analyse UX/UI rapide (navigation, CTA, mobile)',
    agentCount: 1,
    estimatedDuration: '20s',
    requiredPlan: 'freemium'
  },
  {
    id: 'content_overview',
    name: 'Aperçu Contenu',
    description: 'Analyse superficielle du contenu et messaging',
    agentCount: 1,
    estimatedDuration: '20s',
    requiredPlan: 'freemium'
  },
  {
    id: 'performance_check',
    name: 'Performance Check',
    description: 'Vitesse de chargement et optimisations de base',
    agentCount: 1,
    estimatedDuration: '15s',
    requiredPlan: 'freemium'
  },
  {
    id: 'conversion_basics',
    name: 'Conversion Basics',
    description: 'Analyse basique du funnel de conversion',
    agentCount: 1,
    estimatedDuration: '15s',
    requiredPlan: 'freemium'
  },

  // PRO MODULES
  {
    id: 'seo_advanced',
    name: 'SEO Avancé',
    description: 'Audit SEO complet (backlinks, mots-clés, stratégie)',
    agentCount: 2,
    estimatedDuration: '1min',
    requiredPlan: 'pro'
  },
  {
    id: 'competitor_local',
    name: 'Benchmark Local',
    description: 'Analyse de 3-5 concurrents locaux',
    agentCount: 1,
    estimatedDuration: '1min 30s',
    requiredPlan: 'pro'
  },
  {
    id: 'pestel_analysis',
    name: 'Analyse PESTEL',
    description: 'Facteurs Politiques, Économiques, Sociaux, Technologiques, Écologiques, Légaux',
    agentCount: 1,
    estimatedDuration: '45s',
    requiredPlan: 'pro'
  },
  {
    id: 'porter_forces',
    name: 'Porter 5 Forces',
    description: 'Analyse concurrentielle structurée',
    agentCount: 1,
    estimatedDuration: '45s',
    requiredPlan: 'pro'
  },
  {
    id: 'marketing_audit',
    name: 'Audit Marketing Approfondi',
    description: 'Stratégie marketing, positionnement, messaging',
    agentCount: 1,
    estimatedDuration: '1min',
    requiredPlan: 'pro'
  },
  {
    id: 'commercial_audit',
    name: 'Audit Commercial Détaillé',
    description: 'Processus de vente, argumentaires, parcours client',
    agentCount: 1,
    estimatedDuration: '1min',
    requiredPlan: 'pro'
  },

  // AGENCY MODULES
  {
    id: 'competitor_national',
    name: 'Benchmark National',
    description: 'Analyse de 10-15 concurrents nationaux',
    agentCount: 2,
    estimatedDuration: '3min',
    requiredPlan: 'agency'
  },
  {
    id: 'market_study_regional',
    name: 'Étude de Marché Régionale',
    description: 'Analyse du marché régional, opportunités, tendances',
    agentCount: 1,
    estimatedDuration: '2min',
    requiredPlan: 'agency'
  },
  {
    id: 'competitive_intelligence',
    name: 'Intelligence Compétitive',
    description: 'Veille concurrentielle avancée, stratégies des leaders',
    agentCount: 1,
    estimatedDuration: '2min',
    requiredPlan: 'agency'
  },
  {
    id: 'content_marketing',
    name: 'Content Marketing',
    description: 'Stratégie de contenu, calendrier éditorial, SEO content',
    agentCount: 1,
    estimatedDuration: '1min 30s',
    requiredPlan: 'agency'
  },
  {
    id: 'social_media_audit',
    name: 'Audit Social Media',
    description: 'Analyse des réseaux sociaux, engagement, stratégie',
    agentCount: 1,
    estimatedDuration: '1min 30s',
    requiredPlan: 'agency'
  },
  {
    id: 'email_marketing',
    name: 'Email Marketing',
    description: 'Stratégie email, automation, segmentation',
    agentCount: 1,
    estimatedDuration: '1min',
    requiredPlan: 'agency'
  },
  {
    id: 'data_analytics',
    name: 'Data Analytics',
    description: 'Analyse des données, KPIs, tableaux de bord',
    agentCount: 1,
    estimatedDuration: '1min',
    requiredPlan: 'agency'
  },

  // ENTERPRISE MODULES
  {
    id: 'competitor_international',
    name: 'Benchmark International',
    description: 'Analyse de 20+ concurrents internationaux',
    agentCount: 2,
    estimatedDuration: '5min',
    requiredPlan: 'enterprise'
  },
  {
    id: 'market_study_international',
    name: 'Étude de Marché Internationale',
    description: 'Analyse des marchés internationaux, expansion, opportunités',
    agentCount: 2,
    estimatedDuration: '4min',
    requiredPlan: 'enterprise'
  },
  {
    id: 'pricing_intelligence',
    name: 'Pricing Intelligence',
    description: 'Analyse des prix concurrents, stratégie de pricing optimale',
    agentCount: 1,
    estimatedDuration: '2min',
    requiredPlan: 'enterprise'
  },
  {
    id: 'legal_compliance',
    name: 'Conformité Juridique',
    description: 'Analyse RGPD, mentions légales, conformité réglementaire',
    agentCount: 1,
    estimatedDuration: '1min 30s',
    requiredPlan: 'enterprise'
  },
  {
    id: 'digital_transformation',
    name: 'Transformation Digitale',
    description: 'Roadmap de transformation, migration, modernisation',
    agentCount: 1,
    estimatedDuration: '2min',
    requiredPlan: 'enterprise'
  },
  {
    id: 'migration_plan',
    name: 'Plan de Migration',
    description: 'Analyse de la stack actuelle, plan de migration détaillé',
    agentCount: 1,
    estimatedDuration: '2min',
    requiredPlan: 'enterprise'
  }
];

// Helper function to get modules for a specific plan
export function getModulesForPlan(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): AnalysisModule[] {
  const planHierarchy = {
    freemium: ['freemium'],
    pro: ['freemium', 'pro'],
    agency: ['freemium', 'pro', 'agency'],
    enterprise: ['freemium', 'pro', 'agency', 'enterprise']
  };

  const allowedPlans = planHierarchy[plan];
  return ANALYSIS_MODULES.filter(module => allowedPlans.includes(module.requiredPlan));
}

// Helper function to count total agents for a plan
export function getAgentCountForPlan(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): number {
  const modules = getModulesForPlan(plan);
  return modules.reduce((total, module) => total + module.agentCount, 0);
}

// Helper function to estimate total duration for a plan
export function getEstimatedDurationForPlan(plan: 'freemium' | 'pro' | 'agency' | 'enterprise'): string {
  const durations = {
    freemium: '2-3 min',
    pro: '5-7 min',
    agency: '12-15 min',
    enterprise: '20-30 min'
  };
  return durations[plan];
}

// Upgrade teasers by plan
export const UPGRADE_TEASERS = {
  freemium: {
    nextPlan: 'pro',
    unlocks: [
      'Benchmark de 3-5 concurrents locaux',
      'Analyses PESTEL & Porter 5 Forces',
      'Audit marketing et commercial approfondi',
      'Rapports 35-50 pages vs 15-20 pages',
      '60 audits/an vs 3 audits'
    ]
  },
  pro: {
    nextPlan: 'agency',
    unlocks: [
      'Benchmark de 10-15 concurrents nationaux',
      'Étude de marché régionale complète',
      'Intelligence compétitive avancée',
      'Content Marketing & Social Media',
      'White-label branding',
      '240 audits/an vs 60 audits/an'
    ]
  },
  agency: {
    nextPlan: 'enterprise',
    unlocks: [
      'Benchmark de 20+ concurrents internationaux',
      'Étude de marché internationale',
      'Pricing Intelligence',
      'Conformité juridique & RGPD',
      'Roadmap de transformation digitale',
      'Plan de migration détaillé',
      'API access complet',
      '600 audits/an vs 240 audits/an'
    ]
  },
  enterprise: {
    nextPlan: null,
    unlocks: []
  }
};
