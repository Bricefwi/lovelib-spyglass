// ============================================
// INFOGRAPHICS GENERATOR
// ============================================
// This module automatically generates the promised infographics
// based on the subscription plan (3/8/15/25 infographics)

export interface InfographicSpec {
  id: string;
  title: string;
  type: 'chart' | 'diagram' | 'matrix' | 'timeline' | 'comparison';
  data: any;
  description: string;
}

export interface GeneratedInfographic {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
}

// Define which infographics to generate for each plan
const INFOGRAPHICS_BY_PLAN = {
  freemium: [
    { id: 'perf_overview', title: 'Performance Overview', type: 'chart' },
    { id: 'seo_score', title: 'SEO Score Breakdown', type: 'chart' },
    { id: 'quick_wins', title: 'Top 3 Quick Wins', type: 'diagram' }
  ],
  pro: [
    { id: 'perf_overview', title: 'Performance Overview', type: 'chart' },
    { id: 'seo_score', title: 'SEO Score Breakdown', type: 'chart' },
    { id: 'content_analysis', title: 'Content Quality Analysis', type: 'chart' },
    { id: 'competitor_comparison', title: 'Competitor Comparison (3-5 local)', type: 'comparison' },
    { id: 'pestel_diagram', title: 'PESTEL Analysis', type: 'diagram' },
    { id: 'porter_forces', title: "Porter's Five Forces", type: 'diagram' },
    { id: 'conversion_funnel', title: 'Conversion Funnel Analysis', type: 'chart' },
    { id: 'recommendations_priority', title: 'Recommendations Priority Matrix', type: 'matrix' }
  ],
  agency: [
    { id: 'perf_overview', title: 'Performance Overview', type: 'chart' },
    { id: 'seo_score', title: 'SEO Score Breakdown', type: 'chart' },
    { id: 'content_analysis', title: 'Content Quality Analysis', type: 'chart' },
    { id: 'competitor_comparison_national', title: 'National Competitor Landscape (10-15)', type: 'comparison' },
    { id: 'pestel_diagram', title: 'PESTEL Analysis', type: 'diagram' },
    { id: 'porter_forces', title: "Porter's Five Forces", type: 'diagram' },
    { id: 'swot_matrix', title: 'SWOT Analysis Matrix', type: 'matrix' },
    { id: 'conversion_funnel', title: 'Conversion Funnel Analysis', type: 'chart' },
    { id: 'market_positioning', title: 'Market Positioning Map', type: 'diagram' },
    { id: 'brand_consistency', title: 'Brand Consistency Score', type: 'chart' },
    { id: 'social_media_presence', title: 'Social Media Presence Analysis', type: 'chart' },
    { id: 'customer_journey', title: 'Customer Journey Map', type: 'timeline' },
    { id: 'recommendations_roadmap', title: 'Implementation Roadmap', type: 'timeline' },
    { id: 'roi_projection', title: 'ROI Projection (12 months)', type: 'chart' },
    { id: 'risk_assessment', title: 'Risk Assessment Matrix', type: 'matrix' }
  ],
  enterprise: [
    // All agency infographics plus 10 more
    { id: 'perf_overview', title: 'Performance Overview', type: 'chart' },
    { id: 'seo_score', title: 'SEO Score Breakdown', type: 'chart' },
    { id: 'content_analysis', title: 'Content Quality Analysis', type: 'chart' },
    { id: 'competitor_comparison_international', title: 'International Competitor Analysis (20+)', type: 'comparison' },
    { id: 'pestel_diagram', title: 'PESTEL Analysis', type: 'diagram' },
    { id: 'porter_forces', title: "Porter's Five Forces", type: 'diagram' },
    { id: 'swot_matrix', title: 'SWOT Analysis Matrix', type: 'matrix' },
    { id: 'conversion_funnel', title: 'Conversion Funnel Analysis', type: 'chart' },
    { id: 'market_positioning_global', title: 'Global Market Positioning', type: 'diagram' },
    { id: 'brand_consistency', title: 'Brand Consistency Score', type: 'chart' },
    { id: 'social_media_presence', title: 'Social Media Presence Analysis', type: 'chart' },
    { id: 'customer_journey', title: 'Customer Journey Map', type: 'timeline' },
    { id: 'recommendations_roadmap', title: 'Implementation Roadmap (36 months)', type: 'timeline' },
    { id: 'roi_projection', title: 'ROI Projection (3 years)', type: 'chart' },
    { id: 'risk_assessment', title: 'Risk Assessment Matrix', type: 'matrix' },
    { id: 'pricing_intelligence', title: 'Pricing Intelligence Analysis', type: 'comparison' },
    { id: 'market_share_evolution', title: 'Market Share Evolution', type: 'chart' },
    { id: 'technology_stack', title: 'Technology Stack Assessment', type: 'diagram' },
    { id: 'migration_timeline', title: 'Digital Transformation Timeline', type: 'timeline' },
    { id: 'financial_model', title: 'Financial Model (NPV/IRR)', type: 'chart' },
    { id: 'organizational_impact', title: 'Organizational Impact Map', type: 'diagram' },
    { id: 'change_management', title: 'Change Management Plan', type: 'timeline' },
    { id: 'kpi_dashboard', title: 'KPI Dashboard', type: 'chart' },
    { id: 'scenario_comparison', title: 'Strategic Scenarios Comparison', type: 'comparison' },
    { id: 'legal_compliance', title: 'Legal Compliance Matrix', type: 'matrix' }
  ]
};

/**
 * Generate all infographics for a given plan
 */
export async function generateInfographicsForPlan(
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise',
  analysisResults: Record<string, any>,
  auditData: any
): Promise<GeneratedInfographic[]> {
  
  const specs = INFOGRAPHICS_BY_PLAN[plan];
  console.log(`📊 Generating ${specs.length} infographics for ${plan} plan...`);
  
  const infographics: GeneratedInfographic[] = [];
  
  for (const spec of specs) {
    try {
      console.log(`   🎨 Creating: ${spec.title}`);
      
      // Extract relevant data for this infographic
      const data = extractDataForInfographic(spec, analysisResults, auditData);
      
      // Generate the infographic image
      const imageUrl = await generateInfographicImage(spec, data);
      
      infographics.push({
        id: spec.id,
        title: spec.title,
        imageUrl,
        altText: `${spec.title} - Visual analysis generated by iMotion`
      });
      
      console.log(`   ✅ ${spec.title} generated`);
      
    } catch (error) {
      console.error(`   ❌ Failed to generate ${spec.title}:`, error);
      // Continue with other infographics even if one fails
    }
  }
  
  console.log(`📊 Generated ${infographics.length}/${specs.length} infographics`);
  return infographics;
}

/**
 * Extract relevant data from analysis results for a specific infographic
 */
function extractDataForInfographic(
  spec: any,
  analysisResults: Record<string, any>,
  auditData: any
): any {
  
  // This function maps each infographic type to its data source
  switch (spec.id) {
    case 'perf_overview':
      return {
        lcp: analysisResults['Performance Check']?.lcp || 2.5,
        fid: analysisResults['Performance Check']?.fid || 100,
        cls: analysisResults['Performance Check']?.cls || 0.1,
        score: analysisResults['Performance Check']?.score || 75
      };
      
    case 'seo_score':
      return {
        onPage: analysisResults['SEO Audit']?.onPageScore || 70,
        offPage: analysisResults['SEO Audit']?.offPageScore || 60,
        technical: analysisResults['SEO Audit']?.technicalScore || 80,
        overall: analysisResults['SEO Audit']?.overallScore || 70
      };
      
    case 'competitor_comparison':
    case 'competitor_comparison_national':
    case 'competitor_comparison_international':
      return analysisResults['Competitor Research']?.competitors || [];
      
    case 'swot_matrix':
      return analysisResults['Recommendations']?.swot || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
      
    // Add more mappings for other infographic types
    default:
      return {};
  }
}

/**
 * Generate the actual infographic image
 * This could use various methods:
 * - Call an image generation API (DALL-E, Midjourney)
 * - Use a charting library (Chart.js, D3.js) and convert to image
 * - Use a template-based system
 */
async function generateInfographicImage(spec: any, data: any): Promise<string> {
  
  // For now, we'll use a placeholder approach
  // In production, this would call your image generation service
  
  // Option 1: Generate with Chart.js/D3.js server-side
  if (spec.type === 'chart') {
    return await generateChartImage(spec, data);
  }
  
  // Option 2: Generate with AI image generation
  if (spec.type === 'diagram' || spec.type === 'matrix') {
    return await generateDiagramWithAI(spec, data);
  }
  
  // Option 3: Use pre-made templates
  return await generateFromTemplate(spec, data);
}

/**
 * Generate a chart image using Chart.js or similar
 */
async function generateChartImage(spec: any, data: any): Promise<string> {
  // This would use a headless browser or server-side canvas
  // to render Chart.js and export as PNG
  
  // Placeholder: return a data URL or upload to S3 and return URL
  return `https://storage.imotion.com/infographics/${spec.id}.png`;
}

/**
 * Generate a diagram using AI image generation
 */
async function generateDiagramWithAI(spec: any, data: any): Promise<string> {
  // This would call DALL-E, Midjourney, or Stable Diffusion
  // with a prompt describing the diagram
  
  const prompt = buildImagePromptForDiagram(spec, data);
  
  // Call image generation API
  // const imageUrl = await callImageGenerationAPI(prompt);
  
  // Placeholder
  return `https://storage.imotion.com/infographics/${spec.id}.png`;
}

/**
 * Generate from a template
 */
async function generateFromTemplate(spec: any, data: any): Promise<string> {
  // This would use pre-designed templates and populate them with data
  
  // Placeholder
  return `https://storage.imotion.com/infographics/${spec.id}.png`;
}

/**
 * Build an AI image generation prompt for a diagram
 */
function buildImagePromptForDiagram(spec: any, data: any): string {
  const basePrompt = `Professional business infographic in iMotion brand style (red #d8232a, modern, clean). `;
  
  switch (spec.id) {
    case 'pestel_diagram':
      return basePrompt + `PESTEL analysis diagram showing Political, Economic, Social, Technological, Environmental, and Legal factors. Each factor should have 2-3 key points. Modern hexagonal layout.`;
      
    case 'porter_forces':
      return basePrompt + `Porter's Five Forces diagram showing: Competitive Rivalry (center), Supplier Power (left), Buyer Power (right), Threat of Substitutes (top), Threat of New Entrants (bottom). Clean arrows and labels.`;
      
    case 'swot_matrix':
      return basePrompt + `SWOT analysis matrix with 4 quadrants: Strengths (top-left, green), Weaknesses (top-right, red), Opportunities (bottom-left, blue), Threats (bottom-right, orange). Each quadrant has 3-4 bullet points.`;
      
    default:
      return basePrompt + `${spec.title} infographic with clean, professional design.`;
  }
}

/**
 * Get the expected number of infographics for a plan
 */
export function getExpectedInfographicsCount(plan: string): number {
  const specs = INFOGRAPHICS_BY_PLAN[plan as keyof typeof INFOGRAPHICS_BY_PLAN];
  return specs ? specs.length : 0;
}
