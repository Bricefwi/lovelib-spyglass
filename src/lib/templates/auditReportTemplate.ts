/**
 * Template HTML pour les Rapports d'Audit
 * Respecte la charte visuelle IMOTION
 */

import { IMOTION_BRAND } from '../brandConfig';

export interface AuditReportData {
  company: {
    name: string;
    website: string;
    sector?: string;
    size?: string;
  };
  scores: {
    global: number;
    seo: number;
    performance: number;
    ux: number;
    content: number;
    conversion: number;
  };
  analysis: {
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
  }>;
  scenarios?: Array<{
    name: string;
    description: string;
    investment: string;
    timeline: string;
    expectedROI: string;
    kpis: string[];
  }>;
  generatedAt: string;
  reportId: string;
  confidenceScore?: number;
}

export function generateAuditReportHTML(data: AuditReportData): string {
  const { company, scores, analysis, recommendations, scenarios, generatedAt, reportId, confidenceScore } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Digital - ${company.name} | IMOTION</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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

    /* Header */
    .header {
      text-align: center;
      padding: 60px 40px 40px;
      border-bottom: 3px solid ${IMOTION_BRAND.colors.primary};
    }

    .logo {
      max-width: 200px;
      height: auto;
      margin: 0 auto 30px;
      display: block;
    }

    .title {
      font-size: ${IMOTION_BRAND.typography.fontSize['4xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      color: ${IMOTION_BRAND.colors.text.primary};
      margin-bottom: 15px;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.tight};
    }

    .subtitle {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      color: ${IMOTION_BRAND.colors.text.secondary};
      margin-bottom: 25px;
    }

    .company-badge {
      display: inline-block;
      background: ${IMOTION_BRAND.colors.background.secondary};
      color: ${IMOTION_BRAND.colors.primary};
      padding: 12px 30px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      border: 2px solid ${IMOTION_BRAND.colors.border.accent};
    }

    /* Section */
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
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid ${IMOTION_BRAND.colors.border.default};
    }

    /* Scores Grid */
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .score-card {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 25px 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .score-card:hover {
      transform: translateY(-2px);
      box-shadow: ${IMOTION_BRAND.shadows.md};
    }

    .score-value {
      font-size: ${IMOTION_BRAND.typography.fontSize['5xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 8px;
      line-height: 1;
    }

    .score-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      color: ${IMOTION_BRAND.colors.text.secondary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
    }

    /* SWOT Analysis */
    .swot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin-top: 25px;
    }

    .swot-card {
      background: ${IMOTION_BRAND.colors.background.main};
      border: 1px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 25px;
      border-left: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .swot-card h3 {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 15px;
    }

    .swot-card ul {
      list-style: none;
      padding: 0;
    }

    .swot-card li {
      padding: 8px 0 8px 20px;
      position: relative;
      color: ${IMOTION_BRAND.colors.text.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .swot-card li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: ${IMOTION_BRAND.colors.primary};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
    }

    /* Recommendations */
    .recommendation {
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 25px;
      margin-bottom: 20px;
      border-left: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .recommendation-title {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .priority-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
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
      color: ${IMOTION_BRAND.colors.text.primary};
      margin-bottom: 15px;
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .recommendation-metrics {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .metric {
      flex: 1;
      min-width: 150px;
    }

    .metric-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 5px;
    }

    .metric-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    /* Scenarios */
    .scenario {
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      padding: 30px;
      margin-bottom: 25px;
      border-left: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .scenario-name {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 15px;
    }

    .scenario-description {
      color: ${IMOTION_BRAND.colors.text.primary};
      margin-bottom: 20px;
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .scenario-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .scenario-detail {
      background: white;
      padding: 15px;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
    }

    .scenario-detail-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 5px;
    }

    .scenario-detail-value {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .scenario-kpis {
      margin-top: 15px;
    }

    .scenario-kpis h4 {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
    }

    .scenario-kpis ul {
      list-style: none;
      padding: 0;
    }

    .scenario-kpis li {
      padding: 5px 0 5px 20px;
      position: relative;
      color: ${IMOTION_BRAND.colors.text.primary};
    }

    .scenario-kpis li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${IMOTION_BRAND.colors.status.success};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
    }

    /* Confidence Badge */
    .confidence-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      padding: 8px 20px;
      margin-top: 15px;
    }

    .confidence-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${IMOTION_BRAND.colors.primary};
    }

    .confidence-text {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      color: ${IMOTION_BRAND.colors.text.secondary};
    }

    .confidence-value {
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
    }

    /* CTA Button */
    .cta-button {
      display: inline-block;
      background: ${IMOTION_BRAND.colors.primary};
      color: white;
      padding: 15px 40px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      text-decoration: none;
      text-align: center;
      transition: background 0.2s, transform 0.2s;
      box-shadow: ${IMOTION_BRAND.shadows.md};
      cursor: pointer;
      border: none;
    }

    .cta-button:hover {
      background: ${IMOTION_BRAND.colors.primaryDark};
      transform: translateY(-2px);
      box-shadow: ${IMOTION_BRAND.shadows.lg};
    }

    /* Footer */
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

    /* Print Styles */
    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
      }

      .cta-button {
        display: none;
      }
    }

    /* Responsive */
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

      .scores-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .swot-grid {
        grid-template-columns: 1fr;
      }

      .recommendation-header {
        flex-direction: column;
      }

      .scenario-details {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="${IMOTION_BRAND.logos.main}" alt="${IMOTION_BRAND.logos.alt}" class="logo">
      <h1 class="title">Audit Digital Approfondi</h1>
      <p class="subtitle">Analyse stratégique marketing & commerciale</p>
      <div class="company-badge">${company.website}</div>
      ${confidenceScore ? `
      <div class="confidence-badge">
        <div class="confidence-indicator"></div>
        <span class="confidence-text">
          Indice de confiance : <span class="confidence-value">${confidenceScore}%</span>
        </span>
      </div>
      ` : ''}
    </div>

    <!-- Scores Section -->
    <div class="section">
      <h2 class="section-title">📊 Scores de Performance</h2>
      <div class="scores-grid">
        <div class="score-card">
          <div class="score-value">${scores.global}</div>
          <div class="score-label">Score Global</div>
        </div>
        <div class="score-card">
          <div class="score-value">${scores.seo}</div>
          <div class="score-label">SEO</div>
        </div>
        <div class="score-card">
          <div class="score-value">${scores.performance}</div>
          <div class="score-label">Performance</div>
        </div>
        <div class="score-card">
          <div class="score-value">${scores.ux}</div>
          <div class="score-label">UX/UI</div>
        </div>
        <div class="score-card">
          <div class="score-value">${scores.content}</div>
          <div class="score-label">Contenu</div>
        </div>
        <div class="score-card">
          <div class="score-value">${scores.conversion}</div>
          <div class="score-label">Conversion</div>
        </div>
      </div>
    </div>

    <!-- SWOT Analysis -->
    <div class="section">
      <h2 class="section-title">🎯 Analyse SWOT</h2>
      <div class="swot-grid">
        <div class="swot-card">
          <h3>💪 Forces</h3>
          <ul>
            ${analysis.strengths.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-card">
          <h3>⚠️ Faiblesses</h3>
          <ul>
            ${analysis.weaknesses.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-card">
          <h3>🚀 Opportunités</h3>
          <ul>
            ${analysis.opportunities.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-card">
          <h3>🛡️ Menaces</h3>
          <ul>
            ${analysis.threats.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="section">
      <h2 class="section-title">💡 Recommandations Stratégiques</h2>
      ${recommendations.map(rec => `
        <div class="recommendation">
          <div class="recommendation-header">
            <h3 class="recommendation-title">${rec.title}</h3>
            <span class="priority-badge priority-${rec.priority}">
              ${rec.priority === 'high' ? 'Priorité Haute' : rec.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Basse'}
            </span>
          </div>
          <p class="recommendation-description">${rec.description}</p>
          <div class="recommendation-metrics">
            <div class="metric">
              <div class="metric-label">Impact</div>
              <div class="metric-value">${rec.impact}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Effort</div>
              <div class="metric-value">${rec.effort}</div>
            </div>
            <div class="metric">
              <div class="metric-label">ROI Estimé</div>
              <div class="metric-value">${rec.roi}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Scenarios (if provided) -->
    ${scenarios && scenarios.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🔮 Scénarios d'Évolution</h2>
      <p style="margin-bottom: 25px; color: ${IMOTION_BRAND.colors.text.secondary};">
        Plusieurs trajectoires stratégiques possibles selon vos objectifs et ressources.
      </p>
      ${scenarios.map(scenario => `
        <div class="scenario">
          <h3 class="scenario-name">${scenario.name}</h3>
          <p class="scenario-description">${scenario.description}</p>
          <div class="scenario-details">
            <div class="scenario-detail">
              <div class="scenario-detail-label">Investissement</div>
              <div class="scenario-detail-value">${scenario.investment}</div>
            </div>
            <div class="scenario-detail">
              <div class="scenario-detail-label">Timeline</div>
              <div class="scenario-detail-value">${scenario.timeline}</div>
            </div>
            <div class="scenario-detail">
              <div class="scenario-detail-label">ROI Attendu</div>
              <div class="scenario-detail-value">${scenario.expectedROI}</div>
            </div>
          </div>
          <div class="scenario-kpis">
            <h4>KPIs Clés</h4>
            <ul>
              ${scenario.kpis.map(kpi => `<li>${kpi}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- CTA Section -->
    <div class="section" style="text-align: center;">
      <h2 class="section-title">📥 Télécharger ce Rapport</h2>
      <p style="margin-bottom: 25px; color: ${IMOTION_BRAND.colors.text.secondary};">
        Conservez une copie PDF de votre audit pour vos équipes et partenaires.
      </p>
      <button class="cta-button" onclick="window.print()">
        Télécharger en PDF
      </button>
    </div>

    <!-- Footer -->
    <div class="footer">
      <img src="${IMOTION_BRAND.logos.compact}" alt="${IMOTION_BRAND.logos.alt}" class="footer-logo">
      <div class="footer-text">
        <strong>${IMOTION_BRAND.company.name}</strong> - ${IMOTION_BRAND.company.tagline}<br>
        ${IMOTION_BRAND.company.website} | ${IMOTION_BRAND.company.email}
      </div>
      <div class="footer-meta">
        Rapport généré automatiquement le ${new Date(generatedAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}<br>
        ID: ${reportId} | Confiance: ${confidenceScore || 'N/A'}%
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
