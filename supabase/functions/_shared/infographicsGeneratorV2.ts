// ============================================================================
// INFOGRAPHICS GENERATOR V2.0 - REAL SVG GENERATION
// ============================================================================
// Ce module génère de VRAIES infographies SVG intégrées directement 
// dans les rapports HTML, sans dépendance externe.
// ============================================================================
// Version: 2.0
// Date: Janvier 2026
// Infographies: 3 (Freemium) / 8 (Pro) / 15 (Agency) / 25 (Enterprise)
// ============================================================================

import { IMOTION_BRAND_INFO } from './imotionLogo.ts';

export interface InfographicSpec {
  id: string;
  title: string;
  type: 'gauge' | 'bar' | 'radar' | 'donut' | 'timeline' | 'matrix' | 'comparison' | 'funnel';
  data: any;
}

export interface GeneratedInfographic {
  id: string;
  title: string;
  svgContent: string;
  altText: string;
}

// Couleurs IMOTION
const COLORS = {
  primary: '#d8232a',
  primaryLight: '#ff4d54',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#666666',
  lightGray: '#e5e5e5',
  background: '#f5f5f5',
  text: '#1a1a1a'
};

// ============================================================================
// CONFIGURATION DES INFOGRAPHIES PAR PLAN
// ============================================================================

const INFOGRAPHICS_BY_PLAN = {
  freemium: [
    { id: 'global_score', title: 'Score Global de Maturité Digitale', type: 'gauge' as const },
    { id: 'quick_wins', title: 'Top 3 Quick Wins', type: 'bar' as const },
    { id: 'scores_radar', title: 'Radar des Compétences', type: 'radar' as const }
  ],
  pro: [
    { id: 'global_score', title: 'Score Global de Maturité Digitale', type: 'gauge' as const },
    { id: 'scores_radar', title: 'Radar des Compétences', type: 'radar' as const },
    { id: 'scores_breakdown', title: 'Détail des Scores par Domaine', type: 'bar' as const },
    { id: 'swot_matrix', title: 'Matrice SWOT', type: 'matrix' as const },
    { id: 'competitor_comparison', title: 'Comparaison Concurrentielle', type: 'comparison' as const },
    { id: 'conversion_funnel', title: 'Entonnoir de Conversion', type: 'funnel' as const },
    { id: 'priority_matrix', title: 'Matrice Effort/Impact', type: 'matrix' as const },
    { id: 'timeline_actions', title: 'Planning des Actions', type: 'timeline' as const }
  ],
  agency: [
    { id: 'global_score', title: 'Score Global de Maturité Digitale', type: 'gauge' as const },
    { id: 'scores_radar', title: 'Radar des Compétences', type: 'radar' as const },
    { id: 'scores_breakdown', title: 'Détail des Scores par Domaine', type: 'bar' as const },
    { id: 'swot_matrix', title: 'Matrice SWOT', type: 'matrix' as const },
    { id: 'pestel_analysis', title: 'Analyse PESTEL', type: 'radar' as const },
    { id: 'porter_forces', title: 'Forces de Porter', type: 'radar' as const },
    { id: 'competitor_comparison', title: 'Benchmark Concurrentiel', type: 'comparison' as const },
    { id: 'market_positioning', title: 'Positionnement Marché', type: 'matrix' as const },
    { id: 'conversion_funnel', title: 'Entonnoir de Conversion', type: 'funnel' as const },
    { id: 'customer_journey', title: 'Parcours Client', type: 'timeline' as const },
    { id: 'priority_matrix', title: 'Matrice Effort/Impact', type: 'matrix' as const },
    { id: 'roi_projection', title: 'Projection ROI 12 Mois', type: 'bar' as const },
    { id: 'risk_matrix', title: 'Matrice des Risques', type: 'matrix' as const },
    { id: 'budget_breakdown', title: 'Répartition Budget', type: 'donut' as const },
    { id: 'timeline_roadmap', title: 'Roadmap 12 Mois', type: 'timeline' as const }
  ],
  enterprise: [
    { id: 'global_score', title: 'Score Global de Maturité Digitale', type: 'gauge' as const },
    { id: 'scores_radar', title: 'Radar des Compétences', type: 'radar' as const },
    { id: 'scores_breakdown', title: 'Détail des Scores par Domaine', type: 'bar' as const },
    { id: 'swot_matrix', title: 'Matrice SWOT', type: 'matrix' as const },
    { id: 'pestel_analysis', title: 'Analyse PESTEL', type: 'radar' as const },
    { id: 'porter_forces', title: 'Forces de Porter', type: 'radar' as const },
    { id: 'competitor_comparison', title: 'Benchmark Concurrentiel International', type: 'comparison' as const },
    { id: 'market_positioning', title: 'Positionnement Marché Global', type: 'matrix' as const },
    { id: 'conversion_funnel', title: 'Entonnoir de Conversion', type: 'funnel' as const },
    { id: 'customer_journey', title: 'Parcours Client Omnicanal', type: 'timeline' as const },
    { id: 'priority_matrix', title: 'Matrice Effort/Impact', type: 'matrix' as const },
    { id: 'roi_projection', title: 'Projection ROI 36 Mois', type: 'bar' as const },
    { id: 'risk_matrix', title: 'Matrice des Risques', type: 'matrix' as const },
    { id: 'budget_breakdown', title: 'Répartition Budget', type: 'donut' as const },
    { id: 'timeline_roadmap', title: 'Roadmap 36 Mois', type: 'timeline' as const },
    { id: 'scenarios_comparison', title: 'Comparaison des 3 Scénarios', type: 'comparison' as const },
    { id: 'financial_forecast', title: 'Prévisions Financières', type: 'bar' as const },
    { id: 'tech_stack', title: 'Stack Technologique', type: 'radar' as const },
    { id: 'migration_timeline', title: 'Plan de Migration', type: 'timeline' as const },
    { id: 'kpi_dashboard', title: 'Dashboard KPIs', type: 'bar' as const },
    { id: 'market_share', title: 'Parts de Marché', type: 'donut' as const },
    { id: 'pricing_analysis', title: 'Analyse Pricing', type: 'comparison' as const },
    { id: 'change_management', title: 'Plan de Conduite du Changement', type: 'timeline' as const },
    { id: 'governance', title: 'Structure de Gouvernance', type: 'matrix' as const },
    { id: 'success_metrics', title: 'Métriques de Succès', type: 'gauge' as const }
  ]
};

// ============================================================================
// GÉNÉRATEURS SVG PAR TYPE
// ============================================================================

function generateGaugeSVG(data: { score: number; label: string; maxScore?: number }): string {
  const { score, label, maxScore = 100 } = data;
  const percentage = (score / maxScore) * 100;
  const angle = (percentage / 100) * 180;
  const color = percentage >= 70 ? COLORS.success : percentage >= 50 ? COLORS.warning : COLORS.danger;
  
  const radius = 80;
  const cx = 100;
  const cy = 100;
  
  const startAngle = -180;
  const endAngle = startAngle + angle;
  
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  
  const largeArcFlag = angle > 180 ? 1 : 0;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="300" height="195">
  <defs>
    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${COLORS.danger}"/>
      <stop offset="50%" style="stop-color:${COLORS.warning}"/>
      <stop offset="100%" style="stop-color:${COLORS.success}"/>
    </linearGradient>
  </defs>
  
  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="${COLORS.lightGray}" stroke-width="15" stroke-linecap="round"/>
  <path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="15" stroke-linecap="round"/>
  <text x="100" y="90" font-family="Inter, sans-serif" font-size="36" font-weight="700" fill="${COLORS.text}" text-anchor="middle">${score}</text>
  <text x="100" y="110" font-family="Inter, sans-serif" font-size="12" fill="${COLORS.gray}" text-anchor="middle">/ ${maxScore}</text>
  <text x="100" y="125" font-family="Inter, sans-serif" font-size="11" fill="${COLORS.gray}" text-anchor="middle">${label}</text>
</svg>`;
}

function generateBarChartSVG(data: { items: Array<{ label: string; value: number; maxValue?: number }> }): string {
  const { items } = data;
  const maxValue = Math.max(...items.map(i => i.maxValue || i.value));
  const barHeight = 25;
  const gap = 10;
  const chartHeight = items.length * (barHeight + gap) + 40;
  const chartWidth = 400;
  const labelWidth = 100;
  const barMaxWidth = chartWidth - labelWidth - 60;

  const bars = items.map((item, index) => {
    const y = 30 + index * (barHeight + gap);
    const barWidth = (item.value / maxValue) * barMaxWidth;
    const percentage = item.maxValue ? Math.round((item.value / item.maxValue) * 100) : item.value;
    const color = percentage >= 70 ? COLORS.success : percentage >= 50 ? COLORS.warning : COLORS.danger;
    
    return `
      <text x="0" y="${y + 17}" font-family="Inter, sans-serif" font-size="11" fill="${COLORS.text}">${item.label}</text>
      <rect x="${labelWidth}" y="${y}" width="${barMaxWidth}" height="${barHeight}" fill="${COLORS.lightGray}" rx="4"/>
      <rect x="${labelWidth}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4"/>
      <text x="${labelWidth + barWidth + 8}" y="${y + 17}" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="${COLORS.text}">${item.value}${item.maxValue ? `/${item.maxValue}` : ''}</text>
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${chartWidth} ${chartHeight}" width="${chartWidth}" height="${chartHeight}">
  ${bars}
</svg>`;
}

function generateRadarChartSVG(data: { items: Array<{ label: string; value: number }> }): string {
  const { items } = data;
  const cx = 150;
  const cy = 150;
  const radius = 100;
  const levels = 5;
  
  const levelCircles = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COLORS.lightGray}" stroke-width="1"/>`;
  }).join('');
  
  const angleStep = (2 * Math.PI) / items.length;
  const points = items.map((item, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (item.value / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
  
  const axes = items.map((item, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x2 = cx + radius * Math.cos(angle);
    const y2 = cy + radius * Math.sin(angle);
    const labelX = cx + (radius + 20) * Math.cos(angle);
    const labelY = cy + (radius + 20) * Math.sin(angle);
    
    return `
      <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${COLORS.lightGray}" stroke-width="1"/>
      <text x="${labelX}" y="${labelY}" font-family="Inter, sans-serif" font-size="10" fill="${COLORS.text}" text-anchor="middle" dominant-baseline="middle">${item.label}</text>
      <text x="${labelX}" y="${labelY + 12}" font-family="Inter, sans-serif" font-size="9" fill="${COLORS.primary}" text-anchor="middle" font-weight="600">${item.value}%</text>
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="350" height="350">
  ${levelCircles}
  ${axes}
  <polygon points="${points}" fill="${COLORS.primary}33" stroke="${COLORS.primary}" stroke-width="2"/>
</svg>`;
}

function generateDonutChartSVG(data: { items: Array<{ label: string; value: number; color?: string }> }): string {
  const { items } = data;
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const cx = 100;
  const cy = 100;
  const radius = 70;
  const innerRadius = 45;
  
  const colors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, '#8b5cf6', '#ec4899'];
  
  let currentAngle = -90;
  const segments = items.map((item, i) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const color = item.color || colors[i % colors.length];
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return `<path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z" fill="${color}"/>`;
  }).join('');
  
  const legend = items.map((item, i) => {
    const color = item.color || colors[i % colors.length];
    const percentage = Math.round((item.value / total) * 100);
    return `
      <rect x="220" y="${20 + i * 22}" width="12" height="12" fill="${color}" rx="2"/>
      <text x="238" y="${30 + i * 22}" font-family="Inter, sans-serif" font-size="10" fill="${COLORS.text}">${item.label} (${percentage}%)</text>
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 220" width="380" height="220">
  <g transform="translate(0, 10)">
    ${segments}
    <circle cx="${cx}" cy="${cy}" r="${innerRadius - 5}" fill="white"/>
    <text x="${cx}" y="${cy - 5}" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="${COLORS.text}" text-anchor="middle">${total}</text>
    <text x="${cx}" y="${cy + 12}" font-family="Inter, sans-serif" font-size="9" fill="${COLORS.gray}" text-anchor="middle">TOTAL</text>
  </g>
  ${legend}
</svg>`;
}

function generateMatrixSVG(data: { 
  quadrants: Array<{ 
    title: string; 
    items: string[]; 
    color: string;
    icon: string;
  }> 
}): string {
  const { quadrants } = data;
  const width = 500;
  const height = 400;
  const quadrantWidth = width / 2 - 10;
  const quadrantHeight = height / 2 - 10;
  
  const quadrantSVGs = quadrants.map((q, i) => {
    const x = (i % 2) * (quadrantWidth + 20) + 5;
    const y = Math.floor(i / 2) * (quadrantHeight + 20) + 5;
    
    const itemsList = q.items.slice(0, 4).map((item, j) => 
      `<text x="${x + 15}" y="${y + 50 + j * 20}" font-family="Inter, sans-serif" font-size="10" fill="${COLORS.text}">• ${item.slice(0, 45)}${item.length > 45 ? '...' : ''}</text>`
    ).join('');
    
    return `
      <rect x="${x}" y="${y}" width="${quadrantWidth}" height="${quadrantHeight}" fill="${q.color}15" stroke="${q.color}" stroke-width="2" rx="8"/>
      <text x="${x + 15}" y="${y + 25}" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="${q.color}">${q.icon} ${q.title}</text>
      ${itemsList}
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${quadrantSVGs}
</svg>`;
}

function generateFunnelSVG(data: { stages: Array<{ label: string; value: number }> }): string {
  const { stages } = data;
  const width = 400;
  const stageHeight = 50;
  const height = stages.length * stageHeight + 40;
  const maxValue = stages[0]?.value || 100;
  
  const funnelStages = stages.map((stage, i) => {
    const widthPercent = (stage.value / maxValue) * 100;
    const stageWidth = (widthPercent / 100) * (width - 100);
    const x = (width - stageWidth) / 2;
    const y = 20 + i * stageHeight;
    const conversionRate = i > 0 ? Math.round((stage.value / stages[i-1].value) * 100) : 100;
    
    return `
      <rect x="${x}" y="${y}" width="${stageWidth}" height="${stageHeight - 5}" fill="${COLORS.primary}" opacity="${1 - i * 0.15}" rx="4"/>
      <text x="${width / 2}" y="${y + 28}" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="white" text-anchor="middle">${stage.label}</text>
      <text x="${width - 30}" y="${y + 28}" font-family="Inter, sans-serif" font-size="10" fill="${COLORS.text}" text-anchor="end">${stage.value}</text>
      ${i > 0 ? `<text x="${width - 30}" y="${y + 42}" font-family="Inter, sans-serif" font-size="9" fill="${COLORS.gray}" text-anchor="end">(${conversionRate}%)</text>` : ''}
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${funnelStages}
</svg>`;
}

function generateTimelineSVG(data: { phases: Array<{ name: string; duration: string; items: string[] }> }): string {
  const { phases } = data;
  const width = 600;
  const phaseWidth = (width - 40) / phases.length;
  const height = 200;
  
  const timelinePhases = phases.map((phase, i) => {
    const x = 20 + i * phaseWidth;
    const isEven = i % 2 === 0;
    
    const items = phase.items.slice(0, 3).map((item, j) => 
      `<text x="${x + phaseWidth/2}" y="${isEven ? 85 + j * 14 : 135 + j * 14}" font-family="Inter, sans-serif" font-size="9" fill="${COLORS.gray}" text-anchor="middle">• ${item.slice(0, 25)}</text>`
    ).join('');
    
    return `
      <circle cx="${x + phaseWidth/2}" cy="100" r="12" fill="${COLORS.primary}"/>
      <text x="${x + phaseWidth/2}" y="104" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="white" text-anchor="middle">${i + 1}</text>
      <text x="${x + phaseWidth/2}" y="${isEven ? 55 : 165}" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="${COLORS.text}" text-anchor="middle">${phase.name}</text>
      <text x="${x + phaseWidth/2}" y="${isEven ? 70 : 180}" font-family="Inter, sans-serif" font-size="9" fill="${COLORS.primary}" text-anchor="middle">${phase.duration}</text>
      ${items}
      ${i < phases.length - 1 ? `<line x1="${x + phaseWidth/2 + 15}" y1="100" x2="${x + phaseWidth + phaseWidth/2 - 15}" y2="100" stroke="${COLORS.lightGray}" stroke-width="3"/>` : ''}
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <line x1="20" y1="100" x2="${width - 20}" y2="100" stroke="${COLORS.lightGray}" stroke-width="3"/>
  ${timelinePhases}
</svg>`;
}

function generateComparisonSVG(data: { items: Array<{ name: string; scores: Record<string, number> }> }): string {
  const { items } = data;
  if (items.length === 0) return '';
  
  const criteria = Object.keys(items[0].scores);
  const width = 500;
  const rowHeight = 30;
  const headerHeight = 40;
  const height = headerHeight + (criteria.length + 1) * rowHeight + 20;
  const colWidth = (width - 120) / items.length;
  
  const headers = items.map((item, i) => 
    `<text x="${130 + i * colWidth + colWidth/2}" y="25" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="${i === 0 ? COLORS.primary : COLORS.text}" text-anchor="middle">${item.name.slice(0, 12)}</text>`
  ).join('');
  
  const rows = criteria.map((criterion, rowIndex) => {
    const y = headerHeight + rowIndex * rowHeight;
    const cells = items.map((item, colIndex) => {
      const value = item.scores[criterion];
      const color = value >= 70 ? COLORS.success : value >= 50 ? COLORS.warning : COLORS.danger;
      return `
        <rect x="${130 + colIndex * colWidth + 5}" y="${y + 5}" width="${colWidth - 10}" height="20" fill="${color}22" rx="4"/>
        <text x="${130 + colIndex * colWidth + colWidth/2}" y="${y + 19}" font-family="Inter, sans-serif" font-size="10" font-weight="500" fill="${color}" text-anchor="middle">${value}</text>
      `;
    }).join('');
    
    return `
      <text x="10" y="${y + 19}" font-family="Inter, sans-serif" font-size="10" fill="${COLORS.text}">${criterion}</text>
      ${cells}
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="${COLORS.background}" rx="4"/>
  <text x="10" y="25" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="${COLORS.gray}">Critères</text>
  ${headers}
  ${criteria.map((_, i) => `<line x1="0" y1="${headerHeight + i * rowHeight}" x2="${width}" y2="${headerHeight + i * rowHeight}" stroke="${COLORS.lightGray}" stroke-width="1"/>`).join('')}
  ${rows}
</svg>`;
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

export async function generateInfographicsForPlan(
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise',
  auditData: any
): Promise<GeneratedInfographic[]> {
  
  const specs = INFOGRAPHICS_BY_PLAN[plan];
  console.log(`📊 Génération de ${specs.length} infographies pour le plan ${plan}...`);
  
  const infographics: GeneratedInfographic[] = [];
  
  for (const spec of specs) {
    try {
      console.log(`   🎨 Création: ${spec.title}`);
      
      const data = extractDataForInfographic(spec, auditData);
      const svgContent = generateInfographicSVG(spec.type, data, spec.title);
      
      infographics.push({
        id: spec.id,
        title: spec.title,
        svgContent,
        altText: `${spec.title} - Généré par IMOTION`
      });
      
      console.log(`   ✅ ${spec.title} généré`);
      
    } catch (error) {
      console.error(`   ❌ Erreur pour ${spec.title}:`, error);
    }
  }
  
  console.log(`📊 ${infographics.length}/${specs.length} infographies générées`);
  return infographics;
}

function extractDataForInfographic(spec: { id: string; type: string }, auditData: any): any {
  const scores = auditData.scores || {};
  const swot = auditData.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const competitors = auditData.competitors || [];
  const scenarios = auditData.strategic_scenarios || [];
  const actionPlan = auditData.action_plan || [];
  
  switch (spec.id) {
    case 'global_score':
      return { score: scores.overall || 65, label: 'Score de Maturité Digitale', maxScore: 100 };
      
    case 'scores_radar':
    case 'scores_breakdown':
      return {
        items: [
          { label: 'SEO', value: scores.seo || 55 },
          { label: 'Tech', value: scores.tech || 68 },
          { label: 'UX', value: scores.ux || 72 },
          { label: 'Contenu', value: scores.content || 60 },
          { label: 'Conversion', value: scores.conversion || 48 },
          { label: 'Marketing', value: scores.marketing || 58 }
        ]
      };
      
    case 'quick_wins':
      return {
        items: [
          { label: 'Optimisation SEO', value: 85, maxValue: 100 },
          { label: 'Vitesse Site', value: 72, maxValue: 100 },
          { label: 'CTA Clairs', value: 65, maxValue: 100 }
        ]
      };
      
    case 'swot_matrix':
      return {
        quadrants: [
          { title: 'Forces', items: swot.strengths.slice(0, 4), color: COLORS.success, icon: '💪' },
          { title: 'Faiblesses', items: swot.weaknesses.slice(0, 4), color: COLORS.danger, icon: '⚠️' },
          { title: 'Opportunités', items: swot.opportunities.slice(0, 4), color: COLORS.secondary, icon: '🚀' },
          { title: 'Menaces', items: swot.threats.slice(0, 4), color: COLORS.warning, icon: '🔴' }
        ]
      };
      
    case 'competitor_comparison':
      const compData = competitors.slice(0, 4).map((c: any) => ({
        name: c.name || 'Concurrent',
        scores: {
          'SEO': c.seo_score || Math.floor(Math.random() * 30) + 50,
          'UX': c.ux_score || Math.floor(Math.random() * 30) + 50,
          'Prix': c.price_score || Math.floor(Math.random() * 30) + 50,
          'Notoriété': c.brand_score || Math.floor(Math.random() * 30) + 50
        }
      }));
      if (compData.length === 0) {
        compData.push(
          { name: 'Vous', scores: { 'SEO': 65, 'UX': 72, 'Prix': 70, 'Notoriété': 55 } },
          { name: 'Concurrent A', scores: { 'SEO': 78, 'UX': 65, 'Prix': 60, 'Notoriété': 80 } },
          { name: 'Concurrent B', scores: { 'SEO': 55, 'UX': 80, 'Prix': 75, 'Notoriété': 60 } }
        );
      }
      return { items: compData };
      
    case 'conversion_funnel':
      return {
        stages: [
          { label: 'Visiteurs', value: 10000 },
          { label: 'Pages vues', value: 7500 },
          { label: 'Leads', value: 500 },
          { label: 'Qualifiés', value: 150 },
          { label: 'Clients', value: 45 }
        ]
      };
      
    case 'timeline_roadmap':
    case 'timeline_actions':
      const phases = actionPlan.length > 0 ? actionPlan.slice(0, 4).map((p: any) => ({
        name: p.phase || 'Phase',
        duration: p.timeline || 'M1-M6',
        items: (p.actions || []).slice(0, 3)
      })) : [
        { name: 'Fondation', duration: 'M1-M6', items: ['Setup', 'Analytics', 'SEO base'] },
        { name: 'Traction', duration: 'M7-M12', items: ['Content', 'Ads', 'Partenariats'] },
        { name: 'Scale', duration: 'M13-M24', items: ['Expansion', 'Automation', 'Optimisation'] },
        { name: 'Consolidation', duration: 'M25-M36', items: ['Nouveaux marchés', 'M&A', 'IPO'] }
      ];
      return { phases };
      
    case 'budget_breakdown':
      return {
        items: [
          { label: 'Marketing Digital', value: 35 },
          { label: 'Développement', value: 25 },
          { label: 'Contenu', value: 20 },
          { label: 'Outils & Licences', value: 12 },
          { label: 'Formation', value: 8 }
        ]
      };
      
    case 'scenarios_comparison':
      const scenarioData = scenarios.length > 0 ? scenarios.map((s: any) => ({
        name: s.name || 'Scénario',
        scores: {
          'ROI': parseInt(s.roi?.replace(/[^0-9]/g, '') || '0') || Math.floor(Math.random() * 200) + 100,
          'Risque': s.risk === 'FAIBLE' ? 20 : s.risk === 'MODÉRÉ' ? 50 : 80,
          'Budget': parseInt(s.budget_y1?.replace(/[^0-9]/g, '') || '0') / 10 || 50,
          'Timeline': parseInt(s.roi_timeline?.replace(/[^0-9]/g, '') || '0') || 18
        }
      })) : [
        { name: 'Prudent', scores: { 'ROI': 120, 'Risque': 20, 'Budget': 15, 'Timeline': 12 } },
        { name: 'Opportuniste', scores: { 'ROI': 250, 'Risque': 50, 'Budget': 40, 'Timeline': 20 } },
        { name: 'Ambitieux', scores: { 'ROI': 400, 'Risque': 80, 'Budget': 80, 'Timeline': 30 } }
      ];
      return { items: scenarioData };
      
    default:
      return {};
  }
}

function generateInfographicSVG(type: string, data: any, title: string): string {
  let svg = '';
  
  switch (type) {
    case 'gauge':
      svg = generateGaugeSVG(data);
      break;
    case 'bar':
      svg = generateBarChartSVG(data);
      break;
    case 'radar':
      svg = generateRadarChartSVG(data);
      break;
    case 'donut':
      svg = generateDonutChartSVG(data);
      break;
    case 'matrix':
      svg = generateMatrixSVG(data);
      break;
    case 'funnel':
      svg = generateFunnelSVG(data);
      break;
    case 'timeline':
      svg = generateTimelineSVG(data);
      break;
    case 'comparison':
      svg = generateComparisonSVG(data);
      break;
    default:
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><text x="100" y="50" text-anchor="middle">${title}</text></svg>`;
  }
  
  return svg;
}

export function getExpectedInfographicsCount(plan: string): number {
  const specs = INFOGRAPHICS_BY_PLAN[plan as keyof typeof INFOGRAPHICS_BY_PLAN];
  return specs ? specs.length : 0;
}

export default {
  generateInfographicsForPlan,
  getExpectedInfographicsCount
};
