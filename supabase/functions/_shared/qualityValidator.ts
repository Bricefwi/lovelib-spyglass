// ============================================
// QUALITY VALIDATOR - THE "QUALITY GUARDIAN"
// ============================================
// This module implements the 18th agent: the Quality Guardian.
// Its sole purpose is to validate that the output of all other agents
// meets the "McKinsey Quality" standard before final report generation.

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'structure' | 'content' | 'sourcing' | 'quantitative' | 'language';
  description: string;
  location: string; // e.g., "Section 2.3: Market Analysis"
}

// --------------------------------------------
// QUALITY CRITERIA BY PLAN
// --------------------------------------------

const QUALITY_CRITERIA = {
  freemium: {
    minScore: 60,
    requiredElements: ['executive_summary', 'key_findings', 'cta_upgrade'],
    minWordCount: 500,
    maxWordCount: 2000,
    requiredDeliverables: {
      scenarios: 1,
      infographics: 3
    }
  },
  pro: {
    minScore: 75,
    requiredElements: ['executive_summary', 'methodology', 'key_findings', 'recommendations', 'sources'],
    minWordCount: 3000,
    maxWordCount: 8000,
    requiredDeliverables: {
      scenarios: 3,
      infographics: 8,
      pestel: true,
      porter: true
    }
  },
  agency: {
    minScore: 85,
    requiredElements: ['executive_summary', 'methodology', 'market_analysis', 'competitive_landscape', 'swot', 'recommendations', 'sources', 'appendix'],
    minWordCount: 8000,
    maxWordCount: 15000,
    requiredDeliverables: {
      scenarios: 5,
      infographics: 15,
      pestel: true,
      porter: true,
      swot: true
    }
  },
  enterprise: {
    minScore: 90,
    requiredElements: ['executive_summary', 'methodology', 'market_analysis', 'competitive_landscape', 'swot', 'financial_model', 'roadmap', 'migration_plan', 'recommendations', 'sources', 'appendix'],
    minWordCount: 15000,
    maxWordCount: 30000,
    requiredDeliverables: {
      scenarios: 7,
      infographics: 25,
      pestel: true,
      porter: true,
      swot: true,
      pricing_intelligence: true,
      roadmap: true,
      migration_plan: true
    }
  }
};

// --------------------------------------------
// VALIDATION FUNCTIONS
// --------------------------------------------

export async function validateQuality(
  reportContent: string,
  plan: 'freemium' | 'pro' | 'agency' | 'enterprise',
  metadata: { scenarios: number; infographics: number; [key: string]: any }
): Promise<QualityCheckResult> {
  const criteria = QUALITY_CRITERIA[plan];
  const issues: QualityIssue[] = [];
  let score = 100;

  // 1. Check word count
  const wordCount = reportContent.split(/\s+/).length;
  if (wordCount < criteria.minWordCount) {
    issues.push({
      severity: 'critical',
      category: 'content',
      description: `Report is too short. Expected at least ${criteria.minWordCount} words, got ${wordCount}.`,
      location: 'Overall document'
    });
    score -= 20;
  }
  if (wordCount > criteria.maxWordCount) {
    issues.push({
      severity: 'medium',
      category: 'content',
      description: `Report exceeds maximum word count. Expected max ${criteria.maxWordCount} words, got ${wordCount}.`,
      location: 'Overall document'
    });
    score -= 5;
  }

  // 2. Check required structural elements
  for (const element of criteria.requiredElements) {
    const elementRegex = new RegExp(element.replace('_', '\\s+'), 'i');
    if (!elementRegex.test(reportContent)) {
      issues.push({
        severity: 'high',
        category: 'structure',
        description: `Missing required section: ${element.replace('_', ' ')}`,
        location: 'Document structure'
      });
      score -= 10;
    }
  }

  // 3. Check quantitative deliverables
  if (metadata.scenarios < criteria.requiredDeliverables.scenarios) {
    issues.push({
      severity: 'critical',
      category: 'quantitative',
      description: `Insufficient strategic scenarios. Expected ${criteria.requiredDeliverables.scenarios}, got ${metadata.scenarios}.`,
      location: 'Strategic scenarios section'
    });
    score -= 15;
  }

  if (metadata.infographics < criteria.requiredDeliverables.infographics) {
    issues.push({
      severity: 'critical',
      category: 'quantitative',
      description: `Insufficient infographics. Expected ${criteria.requiredDeliverables.infographics}, got ${metadata.infographics}.`,
      location: 'Visual assets'
    });
    score -= 15;
  }

  // 4. Check for sources/citations
  const citationCount = (reportContent.match(/\[Source:/gi) || []).length + (reportContent.match(/\[\d+\]/g) || []).length;
  if (plan !== 'freemium' && citationCount < 5) {
    issues.push({
      severity: 'high',
      category: 'sourcing',
      description: `Insufficient citations. Expected at least 5, found ${citationCount}.`,
      location: 'Throughout document'
    });
    score -= 10;
  }

  // 5. Check for quantitative data
  const numberCount = (reportContent.match(/\d+%/g) || []).length + (reportContent.match(/\$\d+/g) || []).length;
  if (plan !== 'freemium' && numberCount < 10) {
    issues.push({
      severity: 'medium',
      category: 'quantitative',
      description: `Insufficient quantitative data. Expected at least 10 data points, found ${numberCount}.`,
      location: 'Throughout document'
    });
    score -= 5;
  }

  // 6. Check language quality (basic heuristics)
  const avgSentenceLength = wordCount / (reportContent.split(/[.!?]+/).length || 1);
  if (avgSentenceLength > 30) {
    issues.push({
      severity: 'low',
      category: 'language',
      description: `Sentences are too long on average (${avgSentenceLength.toFixed(1)} words). Aim for 15-20 words per sentence for clarity.`,
      location: 'Throughout document'
    });
    score -= 3;
  }

  // 7. Check for generic/vague language
  const vagueTerms = ['very', 'really', 'quite', 'somewhat', 'maybe', 'perhaps'];
  let vagueTermCount = 0;
  vagueTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    vagueTermCount += (reportContent.match(regex) || []).length;
  });
  if (vagueTermCount > 5) {
    issues.push({
      severity: 'medium',
      category: 'language',
      description: `Excessive use of vague terms (${vagueTermCount} instances). Use precise, data-driven language.`,
      location: 'Throughout document'
    });
    score -= 5;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Generate recommendations
  const recommendations: string[] = [];
  if (score < criteria.minScore) {
    recommendations.push(`The report does not meet the minimum quality standard for the ${plan} plan (score: ${score}/${criteria.minScore}).`);
    recommendations.push(`Consider re-generating the report with more detailed prompts or using a higher-tier AI model.`);
  }
  if (issues.some(i => i.severity === 'critical')) {
    recommendations.push(`Critical issues detected. The report should not be delivered to the client until these are resolved.`);
  }
  if (issues.some(i => i.category === 'quantitative')) {
    recommendations.push(`Add more quantitative data, charts, and financial metrics to strengthen the analysis.`);
  }
  if (issues.some(i => i.category === 'sourcing')) {
    recommendations.push(`Increase the number of citations and sources to improve credibility.`);
  }

  return {
    passed: score >= criteria.minScore && !issues.some(i => i.severity === 'critical'),
    score,
    issues,
    recommendations
  };
}

// --------------------------------------------
// AI-POWERED QUALITY CHECK (Optional Enhancement)
// --------------------------------------------

export async function aiQualityCheck(reportContent: string, plan: string): Promise<string> {
  // This function can call an AI model (e.g., Claude Opus) to perform a more sophisticated
  // quality review, acting as a "senior partner" reviewing a junior consultant's work.
  
  const prompt = `
    You are a Senior Partner at McKinsey reviewing a report written by a junior consultant.
    
    **Report Content:**
    ${reportContent.substring(0, 10000)} // Truncate for token limits
    
    **Your Task:**
    Review this report and provide:
    1. An overall quality score (0-100).
    2. A list of 3-5 specific improvements to make the report more impactful.
    3. Identify any factual errors, logical inconsistencies, or unsupported claims.
    
    **Output Format:**
    - Score: [0-100]
    - Improvements:
      1. [Improvement 1]
      2. [Improvement 2]
      ...
    - Errors/Issues:
      - [Issue 1]
      - [Issue 2]
      ...
  `;

  // Call the AI model here (e.g., Claude Opus via Anthropic API)
  // For now, return a placeholder
  return "AI-powered quality check not yet implemented. Use the rule-based validator for now.";
}
