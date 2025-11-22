/**
 * Template Premium pour Audit Digital Approfondi
 * Analyse Multi-Agents MANUS IA 2.0
 * Respecte la charte visuelle IMOTION complète
 */

import { IMOTION_BRAND } from '../brandConfig';

export interface PremiumAuditData {
  company: {
    name: string;
    website: string;
    sector?: string;
    size?: string;
    industry?: string;
  };
  executiveSummary: string;
  scores: {
    global: number;
    seo: number;
    performance: number;
    ux: number;
    content: number;
    conversion: number;
    marketing?: number;
    tech?: number;
    data?: number;
    ia?: number;
  };
  detailedInsights: Array<{
    category: string;
    title: string;
    analysis: string;
    metrics?: Array<{ label: string; value: string }>;
  }>;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    effort: string;
    roi: string;
    timeline?: string;
    quickWins?: string[];
  }>;
  kpis?: Array<{
    name: string;
    current: string;
    target: string;
    improvement: string;
  }>;
  roadmap?: Array<{
    phase: string;
    duration: string;
    objectives: string[];
    deliverables: string[];
    kpis: string[];
  }>;
  scenarios?: Array<{
    name: string;
    description: string;
    investment: string;
    timeline: string;
    expectedROI: string;
    risks?: string[];
    kpis: string[];
  }>;
  generatedAt: string;
  reportId: string;
  confidenceScore?: number;
}

export function generatePremiumAuditHTML(data: PremiumAuditData): string {
  const { company, executiveSummary, scores, detailedInsights, swot, recommendations, kpis, roadmap, scenarios, generatedAt, reportId, confidenceScore } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Digital Premium - ${company.name} | IMOTION</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: ${IMOTION_BRAND.typography.fontFamily.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.normal};
      color: ${IMOTION_BRAND.colors.text.primary};
      background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }

    /* HEADER PREMIUM */
    .header {
      background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryDark} 100%);
      color: white;
      padding: 60px 50px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }

    .header-content {
      position: relative;
      z-index: 1;
    }

    .logo {
      max-width: 250px;
      margin: 0 auto 30px;
      filter: brightness(0) invert(1);
    }

    .title {
      font-size: ${IMOTION_BRAND.typography.fontSize['5xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      margin-bottom: 15px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .subtitle {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      opacity: 0.95;
      margin-bottom: 25px;
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
    }

    .company-badge {
      display: inline-block;
      background: white;
      color: ${IMOTION_BRAND.colors.primary};
      padding: 15px 35px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      margin-top: 10px;
    }

    .company-details {
      margin-top: 20px;
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      opacity: 0.9;
    }

    /* SECTIONS */
    .section {
      padding: 50px;
      border-bottom: 1px solid ${IMOTION_BRAND.colors.border.light};
    }

    .section:last-child { border-bottom: none; }

    .section-title {
      font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 3px solid ${IMOTION_BRAND.colors.primary};
      display: flex;
      align-items: center;
      gap: 15px;
    }

    /* EXECUTIVE SUMMARY */
    .executive-summary {
      background: linear-gradient(135deg, ${IMOTION_BRAND.colors.background.secondary} 0%, white 100%);
      padding: 30px;
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      border-left: 6px solid ${IMOTION_BRAND.colors.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      box-shadow: ${IMOTION_BRAND.shadows.md};
    }

    .confidence-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.primary};
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      padding: 12px 25px;
      margin-top: 20px;
      box-shadow: ${IMOTION_BRAND.shadows.sm};
    }

    .confidence-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${IMOTION_BRAND.colors.status.success};
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .confidence-value {
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
    }

    /* SCORES GRID */
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 25px;
      margin-top: 30px;
    }

    .score-card {
      background: linear-gradient(135deg, white 0%, ${IMOTION_BRAND.colors.background.secondary} 100%);
      padding: 30px 25px;
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      text-align: center;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .score-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: ${IMOTION_BRAND.colors.primary};
    }

    .score-card:hover {
      transform: translateY(-5px);
      box-shadow: ${IMOTION_BRAND.shadows.lg};
      border-color: ${IMOTION_BRAND.colors.primary};
    }

    .score-value {
      font-size: ${IMOTION_BRAND.typography.fontSize['5xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 10px;
      line-height: 1;
    }

    .score-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.text.secondary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
    }

    /* DETAILED INSIGHTS */
    .insights-grid {
      display: grid;
      gap: 30px;
      margin-top: 30px;
    }

    .insight-card {
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 30px;
      border-left: 6px solid ${IMOTION_BRAND.colors.primary};
    }

    .insight-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .insight-category {
      background: ${IMOTION_BRAND.colors.primary};
      color: white;
      padding: 6px 16px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
    }

    .insight-title {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .insight-analysis {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      color: ${IMOTION_BRAND.colors.text.primary};
      margin-bottom: 20px;
    }

    .insight-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .metric-item {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 15px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
    }

    .metric-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      color: ${IMOTION_BRAND.colors.text.secondary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
      margin-bottom: 5px;
    }

    .metric-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
    }

    /* SWOT GRID */
    .swot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-top: 30px;
    }

    .swot-card {
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 25px;
      border-top: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .swot-card h3 {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 20px;
    }

    .swot-card ul {
      list-style: none;
      padding: 0;
    }

    .swot-card li {
      padding: 10px 0 10px 25px;
      position: relative;
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      border-bottom: 1px solid ${IMOTION_BRAND.colors.border.light};
    }

    .swot-card li:last-child { border-bottom: none; }

    .swot-card li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: ${IMOTION_BRAND.colors.primary};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
    }

    /* RECOMMENDATIONS */
    .recommendation {
      background: linear-gradient(135deg, white 0%, ${IMOTION_BRAND.colors.background.secondary} 100%);
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 30px;
      margin-bottom: 25px;
      border-left: 6px solid ${IMOTION_BRAND.colors.primary};
      box-shadow: ${IMOTION_BRAND.shadows.md};
    }

    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .recommendation-title {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .priority-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
    }

    .priority-high {
      background: ${IMOTION_BRAND.colors.status.error};
      color: white;
    }

    .priority-medium {
      background: ${IMOTION_BRAND.colors.status.warning};
      color: white;
    }

    .priority-low {
      background: ${IMOTION_BRAND.colors.status.info};
      color: white;
    }

    .recommendation-description {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      margin-bottom: 20px;
    }

    .quick-wins {
      background: #f0fdf4;
      border: 2px solid ${IMOTION_BRAND.colors.status.success};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 20px;
      margin: 20px 0;
    }

    .quick-wins h4 {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.status.success};
      margin-bottom: 12px;
    }

    .quick-wins ul {
      list-style: none;
      padding: 0;
    }

    .quick-wins li {
      padding: 8px 0 8px 25px;
      position: relative;
    }

    .quick-wins li:before {
      content: "⚡";
      position: absolute;
      left: 0;
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
    }

    .recommendation-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric {
      background: white;
      border: 1px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 15px;
    }

    .metric-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    /* KPIs */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-top: 30px;
    }

    .kpi-card {
      background: linear-gradient(135deg, white 0%, ${IMOTION_BRAND.colors.background.secondary} 100%);
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 25px;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-left: 6px solid ${IMOTION_BRAND.colors.primary};
    }

    .kpi-name {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      margin-bottom: 20px;
    }

    .kpi-comparison {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .kpi-item {
      text-align: center;
      flex: 1;
    }

    .kpi-item-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      color: ${IMOTION_BRAND.colors.text.secondary};
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .kpi-item-value {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .kpi-item-value.target {
      color: ${IMOTION_BRAND.colors.primary};
    }

    .kpi-arrow {
      font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      color: ${IMOTION_BRAND.colors.primary};
    }

    .kpi-improvement {
      background: ${IMOTION_BRAND.colors.status.success};
      color: white;
      padding: 8px 16px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      text-align: center;
    }

    /* ROADMAP */
    .roadmap-timeline {
      position: relative;
      padding-left: 40px;
      margin-top: 30px;
    }

    .roadmap-timeline::before {
      content: "";
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryDark} 100%);
    }

    .roadmap-phase {
      position: relative;
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 30px;
      margin-bottom: 30px;
    }

    .roadmap-phase::before {
      content: "";
      position: absolute;
      left: -52px;
      top: 30px;
      width: 20px;
      height: 20px;
      background: ${IMOTION_BRAND.colors.primary};
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 0 0 2px ${IMOTION_BRAND.colors.primary};
    }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }

    .phase-number {
      background: ${IMOTION_BRAND.colors.primary};
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
    }

    .phase-name {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      flex: 1;
    }

    .phase-duration {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 8px 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
    }

    .phase-section {
      margin-bottom: 20px;
    }

    .phase-section:last-child { margin-bottom: 0; }

    .phase-section h4 {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
    }

    .phase-section ul {
      list-style: none;
      padding: 0;
    }

    .phase-section li {
      padding: 8px 0 8px 25px;
      position: relative;
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .phase-section li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${IMOTION_BRAND.colors.status.success};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
    }

    /* SCENARIOS */
    .scenario {
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 35px;
      margin-bottom: 30px;
      border-top: 6px solid ${IMOTION_BRAND.colors.primary};
    }

    .scenario-name {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 15px;
    }

    .scenario-description {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      margin-bottom: 25px;
    }

    .scenario-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .scenario-detail {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      text-align: center;
    }

    .scenario-detail-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.text.secondary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 8px;
    }

    .scenario-detail-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
    }

    .scenario-risks {
      background: #fef2f2;
      border: 2px solid ${IMOTION_BRAND.colors.status.error};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 20px;
      margin-bottom: 20px;
    }

    .scenario-risks h4 {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.status.error};
      margin-bottom: 12px;
    }

    .scenario-risks ul {
      list-style: none;
      padding: 0;
    }

    .scenario-risks li {
      padding: 6px 0 6px 25px;
      position: relative;
    }

    .scenario-risks li:before {
      content: "⚠";
      position: absolute;
      left: 0;
    }

    .scenario-kpis ul {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      list-style: none;
      padding: 0;
    }

    .scenario-kpis li {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 12px 15px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      border-left: 4px solid ${IMOTION_BRAND.colors.status.success};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
    }

    /* NEXT STEPS */
    .next-steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }

    .step-card {
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 30px;
      text-align: center;
      transition: all 0.3s;
    }

    .step-card:hover {
      border-color: ${IMOTION_BRAND.colors.primary};
      transform: translateY(-5px);
      box-shadow: ${IMOTION_BRAND.shadows.xl};
    }

    .step-icon {
      font-size: ${IMOTION_BRAND.typography.fontSize['5xl']};
      margin-bottom: 20px;
    }

    .step-card h3 {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 12px;
    }

    /* CTA */
    .cta-section {
      background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryDark} 100%);
      color: white;
      padding: 50px;
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      text-align: center;
      margin: 40px 0;
    }

    .cta-section h3 {
      font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      margin-bottom: 15px;
    }

    .cta-section p {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      margin-bottom: 30px;
      opacity: 0.95;
    }

    .cta-button {
      display: inline-block;
      background: white;
      color: ${IMOTION_BRAND.colors.primary};
      padding: 18px 45px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      margin: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    }

    .cta-button.secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    /* FOOTER */
    .footer {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 50px;
      text-align: center;
    }

    .footer-logo {
      max-width: 150px;
      margin: 0 auto 25px;
      opacity: 0.7;
    }

    .footer-text {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      color: ${IMOTION_BRAND.colors.text.secondary};
      margin-bottom: 20px;
    }

    .footer-meta {
      padding-top: 25px;
      border-top: 2px solid ${IMOTION_BRAND.colors.border.default};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.muted};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    /* PRINT */
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
      .cta-button { display: none; }
      .header { break-after: avoid; }
      .section { break-inside: avoid; }
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .header { padding: 40px 25px; }
      .section { padding: 30px 25px; }
      .title { font-size: ${IMOTION_BRAND.typography.fontSize['3xl']}; }
      .scores-grid, .swot-grid, .insights-grid { grid-template-columns: 1fr; }
      .roadmap-timeline { padding-left: 30px; }
      .roadmap-timeline::before { left: 10px; }
      .roadmap-phase::before { left: -42px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="header-content">
        <img src="${IMOTION_BRAND.logos.main}" alt="${IMOTION_BRAND.logos.alt}" class="logo">
        <h1 class="title">🎯 Audit Digital Premium</h1>
        <p class="subtitle">Analyse Multi-Agents Approfondie • Powered by MANUS IA 2.0</p>
        <div class="company-badge">${company.name}</div>
        ${company.sector || company.size ? `
        <div class="company-details">
          ${company.sector ? company.sector : ''} ${company.size ? `• ${company.size}` : ''}
          <br>${company.website}
        </div>
        ` : ''}
      </div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div class="section">
      <h2 class="section-title">📋 Résumé Exécutif</h2>
      <div class="executive-summary">
        ${executiveSummary}
      </div>
      ${confidenceScore ? `
        <div class="confidence-badge">
          <div class="confidence-indicator"></div>
          <span>Niveau de confiance de l'analyse: <span class="confidence-value">${confidenceScore}%</span></span>
        </div>
      ` : ''}
    </div>

    <!-- SCORES -->
    <div class="section">
      <h2 class="section-title">📊 Scores de Maturité Digitale</h2>
      <div class="scores-grid">
        <div class="score-card">
          <div class="score-value">${scores.global}</div>
          <div class="score-label">Score Global</div>
        </div>
        ${Object.entries(scores).filter(([key]) => key !== 'global').map(([key, value]) => `
        <div class="score-card">
          <div class="score-value">${value}</div>
          <div class="score-label">${key.toUpperCase()}</div>
        </div>
        `).join('')}
      </div>
    </div>

    <!-- DETAILED INSIGHTS -->
    ${detailedInsights && detailedInsights.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🔍 Analyses Détaillées</h2>
      <div class="insights-grid">
        ${detailedInsights.map(insight => `
        <div class="insight-card">
          <div class="insight-header">
            <span class="insight-category">${insight.category}</span>
            <h3 class="insight-title">${insight.title}</h3>
          </div>
          <div class="insight-analysis">${insight.analysis}</div>
          ${insight.metrics && insight.metrics.length > 0 ? `
          <div class="insight-metrics">
            ${insight.metrics.map(metric => `
            <div class="metric-item">
              <div class="metric-label">${metric.label}</div>
              <div class="metric-value">${metric.value}</div>
            </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- SWOT ANALYSIS -->
    <div class="section">
      <h2 class="section-title">🎯 Analyse SWOT Stratégique</h2>
      <div class="swot-grid">
        <div class="swot-card">
          <h3>💪 Forces Identifiées</h3>
          <ul>
            ${swot.strengths.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-card">
          <h3>⚠️ Axes d'Amélioration</h3>
          <ul>
            ${swot.weaknesses.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-card">
          <h3>🚀 Opportunités de Croissance</h3>
          <ul>
            ${swot.opportunities.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-card">
          <h3>🔴 Risques et Menaces</h3>
          <ul>
            ${swot.threats.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- KPIs -->
    ${kpis && kpis.length > 0 ? `
    <div class="section">
      <h2 class="section-title">📊 KPIs et Objectifs</h2>
      <div class="kpis-grid">
        ${kpis.map(kpi => `
        <div class="kpi-card">
          <div class="kpi-name">${kpi.name}</div>
          <div class="kpi-comparison">
            <div class="kpi-item">
              <div class="kpi-item-label">Actuel</div>
              <div class="kpi-item-value">${kpi.current}</div>
            </div>
            <div class="kpi-arrow">→</div>
            <div class="kpi-item">
              <div class="kpi-item-label">Cible</div>
              <div class="kpi-item-value target">${kpi.target}</div>
            </div>
          </div>
          <div class="kpi-improvement">${kpi.improvement}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- RECOMMENDATIONS -->
    <div class="section">
      <h2 class="section-title">💡 Plan d'Actions Recommandées</h2>
      ${recommendations.map(rec => `
      <div class="recommendation">
        <div class="recommendation-header">
          <h3 class="recommendation-title">${rec.title}</h3>
          <span class="priority-badge priority-${rec.priority}">
            ${rec.priority === 'high' ? '🔴 Priorité Haute' : rec.priority === 'medium' ? '🟡 Priorité Moyenne' : '🟢 Priorité Basse'}
          </span>
        </div>
        <p class="recommendation-description">${rec.description}</p>
        ${rec.quickWins && rec.quickWins.length > 0 ? `
        <div class="quick-wins">
          <h4>⚡ Quick Wins:</h4>
          <ul>
            ${rec.quickWins.map(win => `<li>${win}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        <div class="recommendation-metrics">
          <div class="metric">
            <div class="metric-label">Impact Business</div>
            <div class="metric-value">${rec.impact}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Effort Requis</div>
            <div class="metric-value">${rec.effort}</div>
          </div>
          <div class="metric">
            <div class="metric-label">ROI Estimé</div>
            <div class="metric-value">${rec.roi}</div>
          </div>
          ${rec.timeline ? `
          <div class="metric">
            <div class="metric-label">Timeline</div>
            <div class="metric-value">${rec.timeline}</div>
          </div>
          ` : ''}
        </div>
      </div>
      `).join('')}
    </div>

    <!-- ROADMAP -->
    ${roadmap && roadmap.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🗺️ Roadmap Stratégique</h2>
      <div class="roadmap-timeline">
        ${roadmap.map((phase, index) => `
        <div class="roadmap-phase">
          <div class="phase-header">
            <div class="phase-number">${index + 1}</div>
            <div class="phase-name">${phase.phase}</div>
            <div class="phase-duration">${phase.duration}</div>
          </div>
          ${phase.objectives.length > 0 ? `
          <div class="phase-section">
            <h4>🎯 Objectifs:</h4>
            <ul>${phase.objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
          </div>
          ` : ''}
          ${phase.deliverables.length > 0 ? `
          <div class="phase-section">
            <h4>📦 Livrables:</h4>
            <ul>${phase.deliverables.map(del => `<li>${del}</li>`).join('')}</ul>
          </div>
          ` : ''}
          ${phase.kpis.length > 0 ? `
          <div class="phase-section">
            <h4>📊 KPIs de suivi:</h4>
            <ul>${phase.kpis.map(kpi => `<li>${kpi}</li>`).join('')}</ul>
          </div>
          ` : ''}
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- SCENARIOS -->
    ${scenarios && scenarios.length > 0 ? `
    <div class="section">
      <h2 class="section-title">📈 Scénarios d'Évolution (12 mois)</h2>
      ${scenarios.map(scenario => `
      <div class="scenario">
        <h3 class="scenario-name">${scenario.name}</h3>
        <p class="scenario-description">${scenario.description}</p>
        <div class="scenario-details">
          <div class="scenario-detail">
            <div class="scenario-detail-label">💰 Investissement</div>
            <div class="scenario-detail-value">${scenario.investment}</div>
          </div>
          <div class="scenario-detail">
            <div class="scenario-detail-label">⏱️ Durée</div>
            <div class="scenario-detail-value">${scenario.timeline}</div>
          </div>
          <div class="scenario-detail">
            <div class="scenario-detail-label">📊 ROI Attendu</div>
            <div class="scenario-detail-value">${scenario.expectedROI}</div>
          </div>
        </div>
        ${scenario.risks && scenario.risks.length > 0 ? `
        <div class="scenario-risks">
          <h4>⚠️ Risques identifiés:</h4>
          <ul>
            ${scenario.risks.map(risk => `<li>${risk}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        ${scenario.kpis.length > 0 ? `
        <div class="scenario-kpis">
          <h4>📊 KPIs de Suivi:</h4>
          <ul>
            ${scenario.kpis.map(kpi => `<li>${kpi}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- NEXT STEPS -->
    <div class="section">
      <h2 class="section-title">🚀 Prochaines Étapes</h2>
      <div class="next-steps-grid">
        <div class="step-card">
          <div class="step-icon">1️⃣</div>
          <h3>Priorisation</h3>
          <p>Identifier les quick wins et actions à fort impact</p>
        </div>
        <div class="step-card">
          <div class="step-icon">2️⃣</div>
          <h3>Planification</h3>
          <p>Élaborer un plan d'action détaillé avec timeline</p>
        </div>
        <div class="step-card">
          <div class="step-icon">3️⃣</div>
          <h3>Exécution</h3>
          <p>Mise en œuvre progressive avec suivi des KPIs</p>
        </div>
      </div>

      <div class="cta-section">
        <h3>Besoin d'accompagnement ?</h3>
        <p>Nos experts IMOTION peuvent vous aider à mettre en œuvre ces recommandations</p>
        <button class="cta-button" onclick="window.location.href='mailto:contact@imotion.fr?subject=Suivi Audit Premium ${reportId}'">
          📧 Planifier un Rendez-vous Stratégique
        </button>
        <button class="cta-button secondary" onclick="window.print()">
          📄 Télécharger ce Rapport en PDF
        </button>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <img src="${IMOTION_BRAND.logos.compact}" alt="${IMOTION_BRAND.logos.alt}" class="footer-logo">
      <p class="footer-text">
        <strong>${IMOTION_BRAND.company.name}</strong> - ${IMOTION_BRAND.company.tagline}<br>
        <strong>Audit Premium Multi-Agents</strong> powered by <strong>MANUS IA 2.0</strong>
      </p>
      <div class="footer-meta">
        <strong>Référence Audit: ${reportId}</strong><br>
        Généré le ${new Date(generatedAt).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}<br>
        Analysé par: 7 agents IA spécialisés (Marketing, SEO, Tech, UX, Data, Conversion, Strategy)<br>
        <br>
        © ${new Date().getFullYear()} IMOTION. Tous droits réservés.<br>
        Document confidentiel - Usage strictement réservé à ${company.name}<br>
        <br>
        <strong>IMOTION</strong> | contact@imotion.fr | ${IMOTION_BRAND.company.website}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
