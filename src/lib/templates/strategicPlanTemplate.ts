/**
 * Template HTML pour le Plan Stratégique
 * Respecte la charte visuelle IMOTION
 */

import { IMOTION_BRAND } from '../brandConfig';

export interface StrategicPlanData {
  company: {
    name: string;
    website: string;
    sector?: string;
  };
  executiveSummary: string;
  objectives: Array<{
    title: string;
    description: string;
    kpis: string[];
    timeline: string;
    budget: string;
  }>;
  strategies: Array<{
    pillar: string;
    description: string;
    actions: Array<{
      name: string;
      description: string;
      owner: string;
      deadline: string;
      status: 'not_started' | 'in_progress' | 'completed';
    }>;
  }>;
  roadmap: Array<{
    quarter: string;
    milestones: string[];
    deliverables: string[];
  }>;
  budget: {
    total: string;
    breakdown: Array<{
      category: string;
      amount: string;
      percentage: number;
    }>;
  };
  risks: Array<{
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  generatedAt: string;
  planId: string;
}

export function generateStrategicPlanHTML(data: StrategicPlanData): string {
  const { company, executiveSummary, objectives, strategies, roadmap, budget, risks, generatedAt, planId } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plan Stratégique - ${company.name} | IMOTION</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${IMOTION_BRAND.typography.fontFamily.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.normal};
      color: ${IMOTION_BRAND.colors.text.primary};
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: ${IMOTION_BRAND.colors.background.main};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      box-shadow: ${IMOTION_BRAND.shadows.lg};
    }

    .header {
      text-align: center;
      padding: 60px 40px 40px;
      background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%);
      color: white;
      border-radius: ${IMOTION_BRAND.borderRadius.lg} ${IMOTION_BRAND.borderRadius.lg} 0 0;
    }

    .logo {
      max-width: 180px;
      height: auto;
      margin: 0 auto 25px;
      display: block;
      filter: brightness(0) invert(1);
    }

    .title {
      font-size: ${IMOTION_BRAND.typography.fontSize['4xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      margin-bottom: 15px;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.tight};
    }

    .subtitle {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      opacity: 0.95;
    }

    .section {
      padding: 40px;
      border-bottom: 1px solid ${IMOTION_BRAND.colors.border.default};
    }

    .section:last-child {
      border-bottom: none;
    }

    .section-title {
      font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 25px;
      padding-bottom: 12px;
      border-bottom: 3px solid ${IMOTION_BRAND.colors.primary};
    }

    .executive-summary {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 30px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      border-left: 4px solid ${IMOTION_BRAND.colors.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .objective-card {
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 30px;
      margin-bottom: 25px;
      border-left: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .objective-title {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 15px;
    }

    .objective-description {
      color: ${IMOTION_BRAND.colors.text.primary};
      margin-bottom: 20px;
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .objective-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .meta-item {
      background: white;
      padding: 12px;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
    }

    .meta-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 5px;
    }

    .meta-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .kpi-list {
      list-style: none;
      padding: 0;
    }

    .kpi-list li {
      padding: 8px 0 8px 25px;
      position: relative;
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .kpi-list li:before {
      content: "📊";
      position: absolute;
      left: 0;
    }

    .strategy-pillar {
      margin-bottom: 35px;
    }

    .pillar-header {
      background: ${IMOTION_BRAND.colors.primary};
      color: white;
      padding: 20px 25px;
      border-radius: ${IMOTION_BRAND.borderRadius.md} ${IMOTION_BRAND.borderRadius.md} 0 0;
    }

    .pillar-title {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      margin-bottom: 8px;
    }

    .pillar-description {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      opacity: 0.95;
    }

    .actions-list {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 25px;
      border-radius: 0 0 ${IMOTION_BRAND.borderRadius.md} ${IMOTION_BRAND.borderRadius.md};
    }

    .action-item {
      background: white;
      padding: 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
      margin-bottom: 15px;
      border-left: 3px solid ${IMOTION_BRAND.colors.border.default};
    }

    .action-item:last-child {
      margin-bottom: 0;
    }

    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .action-name {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
    }

    .status-not_started {
      background: ${IMOTION_BRAND.colors.border.default};
      color: ${IMOTION_BRAND.colors.text.secondary};
    }

    .status-in_progress {
      background: ${IMOTION_BRAND.colors.status.warning};
      color: white;
    }

    .status-completed {
      background: ${IMOTION_BRAND.colors.status.success};
      color: white;
    }

    .action-description {
      color: ${IMOTION_BRAND.colors.text.secondary};
      margin-bottom: 12px;
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    .action-meta {
      display: flex;
      gap: 20px;
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.secondary};
    }

    .action-meta strong {
      color: ${IMOTION_BRAND.colors.primary};
    }

    .roadmap-timeline {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .quarter-card {
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 25px;
      border-top: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .quarter-title {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 15px;
    }

    .quarter-section {
      margin-bottom: 15px;
    }

    .quarter-section:last-child {
      margin-bottom: 0;
    }

    .quarter-section-title {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.text.primary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
      margin-bottom: 8px;
    }

    .quarter-section ul {
      list-style: none;
      padding: 0;
    }

    .quarter-section li {
      padding: 5px 0 5px 20px;
      position: relative;
      color: ${IMOTION_BRAND.colors.text.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    .quarter-section li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: ${IMOTION_BRAND.colors.primary};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
    }

    .budget-overview {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 30px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      margin-bottom: 25px;
    }

    .budget-total {
      text-align: center;
      margin-bottom: 30px;
    }

    .budget-total-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      color: ${IMOTION_BRAND.colors.text.secondary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 10px;
    }

    .budget-total-amount {
      font-size: ${IMOTION_BRAND.typography.fontSize['5xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      color: ${IMOTION_BRAND.colors.primary};
    }

    .budget-breakdown {
      display: grid;
      gap: 15px;
    }

    .budget-item {
      background: white;
      padding: 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-category {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .budget-amount {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .budget-amount-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
    }

    .budget-percentage {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.secondary};
    }

    .risk-card {
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 25px;
      margin-bottom: 20px;
    }

    .risk-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .risk-title {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .impact-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
    }

    .impact-high {
      background: ${IMOTION_BRAND.colors.status.error};
      color: white;
    }

    .impact-medium {
      background: ${IMOTION_BRAND.colors.status.warning};
      color: white;
    }

    .impact-low {
      background: ${IMOTION_BRAND.colors.status.info};
      color: white;
    }

    .mitigation {
      background: white;
      padding: 15px;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
      border-left: 3px solid ${IMOTION_BRAND.colors.status.success};
    }

    .mitigation-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.status.success};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 5px;
    }

    .mitigation-text {
      color: ${IMOTION_BRAND.colors.text.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    .footer {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 40px;
      text-align: center;
      border-radius: 0 0 ${IMOTION_BRAND.borderRadius.lg} ${IMOTION_BRAND.borderRadius.lg};
    }

    .footer-logo {
      max-width: 120px;
      height: auto;
      margin: 0 auto 20px;
      display: block;
      opacity: 0.8;
    }

    .footer-text {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.secondary};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .footer-meta {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid ${IMOTION_BRAND.colors.border.default};
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      color: ${IMOTION_BRAND.colors.text.muted};
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 40px 20px 30px;
      }
      .title {
        font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      }
      .section {
        padding: 30px 20px;
      }
      .roadmap-timeline {
        grid-template-columns: 1fr;
      }
      .action-header {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${IMOTION_BRAND.logos.main}" alt="${IMOTION_BRAND.logos.alt}" class="logo">
      <h1 class="title">Plan Stratégique Marketing & Commercial</h1>
      <p class="subtitle">${company.name}</p>
    </div>

    <div class="section">
      <h2 class="section-title">📋 Résumé Exécutif</h2>
      <div class="executive-summary">
        ${executiveSummary}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🎯 Objectifs Stratégiques</h2>
      ${objectives.map(obj => `
        <div class="objective-card">
          <h3 class="objective-title">${obj.title}</h3>
          <p class="objective-description">${obj.description}</p>
          <div class="objective-meta">
            <div class="meta-item">
              <div class="meta-label">Timeline</div>
              <div class="meta-value">${obj.timeline}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Budget</div>
              <div class="meta-value">${obj.budget}</div>
            </div>
          </div>
          <div class="quarter-section">
            <div class="quarter-section-title">KPIs de Suivi</div>
            <ul class="kpi-list">
              ${obj.kpis.map(kpi => `<li>${kpi}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2 class="section-title">🚀 Stratégies & Actions</h2>
      ${strategies.map(strategy => `
        <div class="strategy-pillar">
          <div class="pillar-header">
            <h3 class="pillar-title">${strategy.pillar}</h3>
            <p class="pillar-description">${strategy.description}</p>
          </div>
          <div class="actions-list">
            ${strategy.actions.map(action => `
              <div class="action-item">
                <div class="action-header">
                  <h4 class="action-name">${action.name}</h4>
                  <span class="status-badge status-${action.status}">
                    ${action.status === 'not_started' ? 'À Démarrer' : action.status === 'in_progress' ? 'En Cours' : 'Terminé'}
                  </span>
                </div>
                <p class="action-description">${action.description}</p>
                <div class="action-meta">
                  <span><strong>Responsable:</strong> ${action.owner}</span>
                  <span><strong>Échéance:</strong> ${action.deadline}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2 class="section-title">📅 Roadmap Trimestrielle</h2>
      <div class="roadmap-timeline">
        ${roadmap.map(quarter => `
          <div class="quarter-card">
            <h3 class="quarter-title">${quarter.quarter}</h3>
            <div class="quarter-section">
              <div class="quarter-section-title">Jalons</div>
              <ul>
                ${quarter.milestones.map(milestone => `<li>${milestone}</li>`).join('')}
              </ul>
            </div>
            <div class="quarter-section">
              <div class="quarter-section-title">Livrables</div>
              <ul>
                ${quarter.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">💰 Budget Prévisionnel</h2>
      <div class="budget-overview">
        <div class="budget-total">
          <div class="budget-total-label">Budget Total</div>
          <div class="budget-total-amount">${budget.total}</div>
        </div>
        <div class="budget-breakdown">
          ${budget.breakdown.map(item => `
            <div class="budget-item">
              <div class="budget-category">${item.category}</div>
              <div class="budget-amount">
                <div class="budget-amount-value">${item.amount}</div>
                <div class="budget-percentage">(${item.percentage}%)</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">⚠️ Risques & Mitigations</h2>
      ${risks.map(risk => `
        <div class="risk-card">
          <div class="risk-header">
            <h3 class="risk-title">${risk.risk}</h3>
            <span class="impact-badge impact-${risk.impact}">
              Impact ${risk.impact === 'high' ? 'Élevé' : risk.impact === 'medium' ? 'Moyen' : 'Faible'}
            </span>
          </div>
          <div class="mitigation">
            <div class="mitigation-label">Plan de Mitigation</div>
            <div class="mitigation-text">${risk.mitigation}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <img src="${IMOTION_BRAND.logos.compact}" alt="${IMOTION_BRAND.logos.alt}" class="footer-logo">
      <div class="footer-text">
        <strong>${IMOTION_BRAND.company.name}</strong> - ${IMOTION_BRAND.company.tagline}<br>
        ${IMOTION_BRAND.company.website} | ${IMOTION_BRAND.company.email}
      </div>
      <div class="footer-meta">
        Plan généré le ${new Date(generatedAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}<br>
        ID: ${planId}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
