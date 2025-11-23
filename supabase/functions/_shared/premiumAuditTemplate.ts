/**
 * Template Premium pour Audit Digital Approfondi
 * Analyse Multi-Agents MANUS IA 2.0
 * Respecte la charte visuelle IMOTION complète
 */

const IMOTION_BRAND = {
  colors: {
    primary: '#E30613',
    primaryDark: '#B00510',
    primaryLight: '#ff4d54',
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
    },
    border: {
      default: '#e5e5e5',
      light: '#f0f0f0',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    }
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  }
};

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
    global?: number;
    seo?: number;
    performance?: number;
    ux?: number;
    content?: number;
    conversion?: number;
    marketing?: number;
    tech?: number;
    data?: number;
    ia?: number;
    market?: number;
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
    investment?: string;
    timeline?: string;
    expectedROI?: string;
    roi?: string;
    risk?: string;
    risks?: string[];
    kpis?: string[];
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

    /* SWOT */
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

    /* SCENARIOS */
    .scenario-card {
      background: white;
      border: 2px solid ${IMOTION_BRAND.colors.border.default};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      padding: 30px;
      margin-bottom: 25px;
      border-left: 6px solid ${IMOTION_BRAND.colors.primary};
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
      margin-bottom: 20px;
    }

    .scenario-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

    /* FOOTER */
    .footer {
      background: #1a1a1a;
      color: white;
      padding: 40px 50px;
      text-align: center;
    }

    .footer p {
      margin: 10px 0;
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="header-content">
        <h1 class="title">🎯 Audit Digital Approfondi</h1>
        <p class="subtitle">Analyse Stratégique Multi-Agents MANUS IA 2.0</p>
        <div class="company-badge">${company.name}</div>
        <div class="company-details">
          ${company.website} ${company.industry ? `• ${company.industry}` : ''}
        </div>
      </div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div class="section">
      <h2 class="section-title">📋 Synthèse Exécutive</h2>
      <div class="executive-summary">
        ${executiveSummary}
        ${confidenceScore ? `
        <div class="confidence-badge">
          <div class="confidence-indicator"></div>
          <span>Confiance IA: <span class="confidence-value">${confidenceScore}%</span></span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- SCORES -->
    <div class="section">
      <h2 class="section-title">📊 Scores de Maturité Digitale</h2>
      <div class="scores-grid">
        ${Object.entries(scores).filter(([_, value]) => value !== undefined).map(([key, value]) => `
          <div class="score-card">
            <div class="score-value">${value}/100</div>
            <div class="score-label">${key.toUpperCase()}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SWOT -->
    <div class="section">
      <h2 class="section-title">🎯 Analyse SWOT</h2>
      <div class="swot-grid">
        <div class="swot-card">
          <h3>💪 Forces</h3>
          <ul>${swot.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="swot-card">
          <h3>⚠️ Faiblesses</h3>
          <ul>${swot.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
        </div>
        <div class="swot-card">
          <h3>🚀 Opportunités</h3>
          <ul>${swot.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
        </div>
        <div class="swot-card">
          <h3>🔴 Menaces</h3>
          <ul>${swot.threats.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
    </div>

    <!-- SCENARIOS -->
    ${scenarios && scenarios.length > 0 ? `
    <div class="section">
      <h2 class="section-title">📈 Scénarios d'Évolution Stratégique</h2>
      ${scenarios.map(scenario => `
        <div class="scenario-card">
          <div class="scenario-name">${scenario.name}</div>
          <div class="scenario-description">${scenario.description}</div>
          <div class="scenario-metrics">
            ${scenario.roi || scenario.expectedROI ? `
              <div class="metric-item">
                <div class="metric-label">ROI Attendu</div>
                <div class="metric-value">${scenario.roi || scenario.expectedROI}</div>
              </div>
            ` : ''}
            ${scenario.risk ? `
              <div class="metric-item">
                <div class="metric-label">Risque</div>
                <div class="metric-value">${scenario.risk}</div>
              </div>
            ` : ''}
            ${scenario.investment ? `
              <div class="metric-item">
                <div class="metric-label">Investissement</div>
                <div class="metric-value">${scenario.investment}</div>
              </div>
            ` : ''}
            ${scenario.timeline ? `
              <div class="metric-item">
                <div class="metric-label">Timeline</div>
                <div class="metric-value">${scenario.timeline}</div>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- FOOTER -->
    <div class="footer">
      <p style="font-weight: 600; font-size: 16px;">IMOTION - AI No-Code Solutions</p>
      <p>www.imotion.fr • contact@imotion.fr</p>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Rapport généré le ${new Date(generatedAt).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
      <p style="color: #666; font-size: 12px;">ID: ${reportId}</p>
      <p style="margin-top: 15px; color: #666; font-size: 11px;">
        © ${new Date().getFullYear()} IMOTION. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
`;
}
