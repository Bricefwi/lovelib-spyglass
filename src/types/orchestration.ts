/**
 * Types pour l'orchestration multi-agents plan-aware
 * Phase 1 - Machine de Guerre IMOTION
 */

export type PlanTier = 'starter' | 'agency' | 'enterprise' | 'one_shot';
export type AuditDepth = 'essential' | 'quick_check' | 'deep' | 'ultra_deep' | 'full_audit';
export type NarrativeStyle = 'concise' | 'balanced' | 'comprehensive';
export type QualityLevel = 'premium' | 'ultra_premium';

/**
 * Configuration des modules activés par plan
 */
export interface ModulesConfig {
  scraping: boolean;
  pestel: boolean;
  porter_5_forces: boolean;
  competitive_intel: boolean;
  audit_marketing: AuditDepth;
  audit_commercial: AuditDepth;
  seo_sem: boolean | AuditDepth;
  content_marketing: boolean;
  social_media: boolean;
  email_marketing: boolean;
  data_analytics: boolean;
  pricing_intelligence: boolean;
}

/**
 * Profil complet d'un plan tarifaire
 */
export interface PlanProfile {
  id: string;
  tier: PlanTier;
  display_name: string;
  price_per_month: number;
  annual_audits: number;
  llm_budget_per_audit: number;
  orchestration_time: string;
  report_pages: string;
  scenarios_count: number;
  infographics_count: number;
  modules_config: ModulesConfig;
  rédacteur_model: string;
  rédacteur_temperature: number;
  white_label: boolean;
  narrative_style: NarrativeStyle;
  quality_level: QualityLevel;
  created_at: string;
  updated_at: string;
}

/**
 * Configuration du branding (marque blanche)
 */
export interface BrandingConfig {
  primary_color: string;
  logo_url: string | null;
  company_name: string;
  accent_color: string | null;
  footer_text: string | null;
}

/**
 * Données scrappées avec score de confiance
 */
export interface ScrapedData {
  company_profile: {
    name: string;
    founded?: string;
    employees?: string;
    revenue_range?: string;
    confidence: Record<string, number>; // 0-100
    sources: Array<{
      field: string;
      url: string;
      date: string;
    }>;
  };
  validation_report: {
    data_completeness: string;
    suspicious_fields: string[];
    data_freshness: string;
  };
}

/**
 * Analyse PESTEL
 */
export interface PESTELAnalysis {
  politique: PESTELFactor[];
  économique: PESTELFactor[];
  social: PESTELFactor[];
  technologique: PESTELFactor[];
  environnemental: PESTELFactor[];
  légal: PESTELFactor[];
  narrative: string; // 2-3 pages style Laboratoire
}

export interface PESTELFactor {
  titre: string;
  impact: string; // "Positif (+X%)" ou "Négatif (-X%)"
  probabilité: string;
  timeline: string;
  sources: string[];
  implication_company: string;
}

/**
 * Analyse Porter 5 Forces
 */
export interface PorterAnalysis {
  forces: {
    fournisseurs: PorterForce;
    clients: PorterForce;
    nouveaux_entrants: PorterForce;
    substituts: PorterForce;
    rivalité: PorterForce;
  };
  narrative: string;
  strategic_implications: string[];
}

export interface PorterForce {
  score: number; // 1-5
  justification: string;
  barrières: string[];
  implications: string[];
}

/**
 * Analyse SWOT narrative
 */
export interface SWOTAnalysis {
  forces: SWOTSection;
  faiblesses: SWOTSection;
  opportunités: SWOTSection;
  menaces: SWOTSection;
}

export interface SWOTSection {
  narrative: string; // Style Laboratoire
  points_clés: Array<{
    titre: string;
    détail: string;
    implication: string;
    levier_stratégique: string;
  }>;
  score: number; // 0-10
  actions_immédiat: string[];
}

/**
 * Résultat d'un agent spécialisé
 */
export interface AgentResult {
  agent_name: string;
  model_used: string;
  temperature: number;
  execution_time: number; // ms
  tokens_used: number;
  cost_usd: number;
  data: any; // JSON structuré
  narrative?: string; // Texte riche style Laboratoire
  confidence_score?: number;
  sources?: string[];
}

/**
 * Configuration de l'orchestration
 */
export interface OrchestrationConfig {
  audit_id: string;
  plan_profile: PlanProfile;
  branding: BrandingConfig;
  user_id: string;
  organization_id: string;
  company_url: string;
  company_name?: string;
  orchestration_start: string;
}

/**
 * Résultat de l'orchestration complète
 */
export interface OrchestrationResult {
  audit_id: string;
  plan_tier: PlanTier;
  quality_level: QualityLevel;
  execution_summary: {
    total_time: number; // ms
    total_cost_usd: number;
    total_tokens: number;
    agents_executed: number;
    errors: any[];
  };
  scraped_data: ScrapedData;
  pestel?: PESTELAnalysis;
  porter?: PorterAnalysis;
  swot: SWOTAnalysis;
  audits: {
    marketing?: AgentResult;
    commercial?: AgentResult;
    seo_sem?: AgentResult;
    content?: AgentResult;
    social?: AgentResult;
    email?: AgentResult;
    data?: AgentResult;
    pricing?: AgentResult;
  };
  consolidated_narrative: string; // Senior Writer synthèse
  recommendations: Recommendation[];
  strategic_scenarios: Scenario[];
  report_metadata: {
    pages_count: number;
    infographics_count: number;
    scenarios_count: number;
    narrative_quality_score: number;
  };
}

/**
 * Recommandation stratégique
 */
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
  timeline: string;
  roi_estimated: string;
  kpis: string[];
  budget_required?: string;
}

/**
 * Scénario stratégique
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  roi: string;
  investment: string;
  timeline: string;
  risks: string[];
  kpis: string[];
  actions: string[];
  narrative: string;
}

/**
 * Résultat final du rapport HTML
 */
export interface ReportOutput {
  report_id: string;
  audit_id: string;
  html_content: string;
  pdf_url?: string;
  branding_applied: BrandingConfig;
  generated_at: string;
  page_count: number;
}
