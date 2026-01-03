// ============================================
// REPORT LENGTH CONTROLLER
// ============================================
// This module ensures that reports meet the promised page count
// (15-20 pages for Freemium, 35-50 for Pro, 60-80 for Agency, 100-150 for Enterprise)

export interface LengthTarget {
  minPages: number;
  maxPages: number;
  minWords: number;
  maxWords: number;
  targetWords: number;
}

// Define length targets by plan (assuming ~300 words per page)
const LENGTH_TARGETS = {
  freemium: {
    minPages: 15,
    maxPages: 20,
    minWords: 4500,
    maxWords: 6000,
    targetWords: 5250
  },
  pro: {
    minPages: 35,
    maxPages: 50,
    minWords: 10500,
    maxWords: 15000,
    targetWords: 12750
  },
  agency: {
    minPages: 60,
    maxPages: 80,
    minWords: 18000,
    maxWords: 24000,
    targetWords: 21000
  },
  enterprise: {
    minPages: 100,
    maxPages: 150,
    minWords: 30000,
    maxWords: 45000,
    targetWords: 37500
  }
};

/**
 * Get length target for a plan
 */
export function getLengthTarget(plan: string): LengthTarget {
  return LENGTH_TARGETS[plan as keyof typeof LENGTH_TARGETS] || LENGTH_TARGETS.freemium;
}

/**
 * Calculate current report length
 */
export function calculateReportLength(content: string): {
  wordCount: number;
  estimatedPages: number;
  characterCount: number;
} {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = content.length;
  const estimatedPages = Math.ceil(wordCount / 300);
  
  return {
    wordCount,
    estimatedPages,
    characterCount
  };
}

/**
 * Check if report meets length requirements
 */
export function validateReportLength(
  content: string,
  plan: string
): {
  isValid: boolean;
  currentLength: ReturnType<typeof calculateReportLength>;
  target: LengthTarget;
  status: 'too_short' | 'perfect' | 'too_long';
  adjustmentNeeded: number; // Words to add (positive) or remove (negative)
} {
  const target = getLengthTarget(plan);
  const currentLength = calculateReportLength(content);
  
  let status: 'too_short' | 'perfect' | 'too_long';
  let adjustmentNeeded = 0;
  
  if (currentLength.wordCount < target.minWords) {
    status = 'too_short';
    adjustmentNeeded = target.targetWords - currentLength.wordCount;
  } else if (currentLength.wordCount > target.maxWords) {
    status = 'too_long';
    adjustmentNeeded = target.targetWords - currentLength.wordCount; // Negative
  } else {
    status = 'perfect';
    adjustmentNeeded = 0;
  }
  
  return {
    isValid: status === 'perfect',
    currentLength,
    target,
    status,
    adjustmentNeeded
  };
}

/**
 * Generate expansion prompts to increase report length
 */
export function generateExpansionPrompts(
  sectionName: string,
  currentContent: string,
  wordsToAdd: number
): string {
  return `
**Task:** Expand the "${sectionName}" section to add approximately ${wordsToAdd} words while maintaining professional quality.

**Current Content:**
${currentContent.substring(0, 1000)}... [truncated]

**Expansion Guidelines:**
1. Add more **quantitative data** (statistics, percentages, financial metrics).
2. Include **specific examples** and case studies.
3. Provide **deeper analysis** of the implications.
4. Add **actionable recommendations** with implementation steps.
5. Include **risk assessments** and mitigation strategies.
6. Reference **industry benchmarks** and best practices.
7. Maintain the professional, consulting-grade tone.
8. Do NOT add fluff or repetition. Every sentence must add value.

**Output:** The expanded section (approximately ${wordsToAdd} additional words).
`;
}

/**
 * Generate compression prompts to reduce report length
 */
export function generateCompressionPrompts(
  sectionName: string,
  currentContent: string,
  wordsToRemove: number
): string {
  return `
**Task:** Condense the "${sectionName}" section to remove approximately ${Math.abs(wordsToRemove)} words while preserving all key insights.

**Current Content:**
${currentContent.substring(0, 1000)}... [truncated]

**Compression Guidelines:**
1. Remove redundant explanations.
2. Convert verbose sentences into concise bullet points where appropriate.
3. Eliminate generic statements that don't add specific value.
4. Keep all quantitative data and key recommendations.
5. Maintain the executive summary style: high signal, low noise.
6. Ensure the compressed version is still professional and complete.

**Output:** The condensed section (approximately ${Math.abs(wordsToRemove)} fewer words).
`;
}

/**
 * Intelligently adjust report length by expanding or compressing sections
 */
export async function adjustReportLength(
  reportSections: Record<string, string>,
  plan: string,
  aiCallFunction: (prompt: string) => Promise<string>
): Promise<Record<string, string>> {
  
  // Combine all sections to check total length
  const fullReport = Object.values(reportSections).join('\n\n');
  const validation = validateReportLength(fullReport, plan);
  
  console.log(`📏 Report Length Check:`);
  console.log(`   Current: ${validation.currentLength.wordCount} words (${validation.currentLength.estimatedPages} pages)`);
  console.log(`   Target: ${validation.target.minWords}-${validation.target.maxWords} words (${validation.target.minPages}-${validation.target.maxPages} pages)`);
  console.log(`   Status: ${validation.status}`);
  
  if (validation.isValid) {
    console.log(`   ✅ Report length is perfect!`);
    return reportSections;
  }
  
  // Determine which sections to adjust
  // Priority: Expand/compress the largest sections first
  const sectionsBySize = Object.entries(reportSections)
    .map(([name, content]) => ({
      name,
      content,
      wordCount: content.split(/\s+/).length
    }))
    .sort((a, b) => b.wordCount - a.wordCount);
  
  const adjustedSections = { ...reportSections };
  let remainingAdjustment = validation.adjustmentNeeded;
  
  for (const section of sectionsBySize) {
    if (Math.abs(remainingAdjustment) < 100) break; // Close enough
    
    // Adjust this section
    const adjustmentForSection = Math.min(
      Math.abs(remainingAdjustment),
      Math.floor(section.wordCount * 0.3) // Max 30% change per section
    );
    
    if (validation.status === 'too_short') {
      console.log(`   📝 Expanding "${section.name}" by ~${adjustmentForSection} words...`);
      const prompt = generateExpansionPrompts(section.name, section.content, adjustmentForSection);
      const expandedContent = await aiCallFunction(prompt);
      adjustedSections[section.name] = expandedContent;
      remainingAdjustment -= adjustmentForSection;
      
    } else if (validation.status === 'too_long') {
      console.log(`   ✂️  Compressing "${section.name}" by ~${adjustmentForSection} words...`);
      const prompt = generateCompressionPrompts(section.name, section.content, -adjustmentForSection);
      const compressedContent = await aiCallFunction(prompt);
      adjustedSections[section.name] = compressedContent;
      remainingAdjustment += adjustmentForSection;
    }
  }
  
  // Re-validate
  const finalReport = Object.values(adjustedSections).join('\n\n');
  const finalValidation = validateReportLength(finalReport, plan);
  console.log(`📏 Final Length: ${finalValidation.currentLength.wordCount} words (${finalValidation.currentLength.estimatedPages} pages)`);
  console.log(`   Status: ${finalValidation.status}`);
  
  return adjustedSections;
}

/**
 * Get section-level length targets
 * This helps distribute the word count across sections
 */
export function getSectionLengthTargets(plan: string): Record<string, number> {
  const target = getLengthTarget(plan);
  const totalWords = target.targetWords;
  
  // Define percentage allocation for each section
  const allocation = {
    'Executive Summary': 0.05,
    'Methodology': 0.03,
    'Technical Analysis': 0.15,
    'SEO Audit': 0.12,
    'Content Analysis': 0.10,
    'UX/UI Review': 0.08,
    'Performance Check': 0.08,
    'Market Analysis': 0.12,
    'Competitive Landscape': 0.10,
    'Strategic Recommendations': 0.12,
    'Implementation Roadmap': 0.05
  };
  
  const sectionTargets: Record<string, number> = {};
  for (const [section, percentage] of Object.entries(allocation)) {
    sectionTargets[section] = Math.floor(totalWords * percentage);
  }
  
  return sectionTargets;
}
