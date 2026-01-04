/**
 * Supabase Edge Function: orchestrate-multi-agent-v6
 * 
 * COMPLETE MULTI-AGENT ORCHESTRATION SYSTEM
 * - Real sequential execution of 7/12/15/17 agents
 * - Premium AI prompts (500-1000 words per agent)
 * - Automatic infographics generation (3/8/15/25)
 * - Report length control (15-150 pages)
 * - Quality Guardian validation
 * - Quantitative deliverables guarantee
 * 
 * Version 6.0 - Full Implementation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAIConfigForPlan, getModelForTask, ModelConfig, PlanTier, TaskType, PROVIDER_ENDPOINTS } from "../_shared/aiModelsConfig.ts";
import { getPremiumPrompt } from "../_shared/aiPromptsPremium.ts";
import { validateQuality } from "../_shared/qualityValidator.ts";
import { generateInfographicsForPlan, getExpectedInfographicsCount } from "../_shared/infographicsGenerator.ts";
import { adjustReportLength, validateReportLength, getLengthTarget } from "../_shared/reportLengthController.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { audit_id } = await req.json();

    console.log('=== Multi-Agent Orchestration v6.0 Started ===');
    console.log('🚀 Full Implementation with Quality Guarantees');
    console.log('Audit ID:', audit_id);

    // Get audit details - use LEFT JOIN (no !inner) to allow audits without organizations
    const { data: audit, error: auditError } = await supabase
      .from('pre_audits')
      .select(`
        *,
        organizations(
          id,
          subscription_plan,
          name
        )
      `)
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      console.error('Audit fetch error:', auditError);
      throw new Error(`Audit not found: ${audit_id}`);
    }

    // Get plan from organization OR from audit's subscription_tier field (fallback)
    const plan = (audit.organizations?.subscription_plan || (audit as any).subscription_tier || 'freemium') as PlanTier;
    console.log(`📊 Plan: ${plan}`);
    console.log(`🏢 Organization: ${audit.organizations?.name || 'Unknown'}`);

    // Get AI configuration
    const aiConfig = getAIConfigForPlan(plan);
    console.log(`🤖 AI Models: ${aiConfig.displayModels}`);

    // Get length target
    const lengthTarget = getLengthTarget(plan);
    console.log(`📏 Target Length: ${lengthTarget.minPages}-${lengthTarget.maxPages} pages (${lengthTarget.minWords}-${lengthTarget.maxWords} words)`);

    // Get expected infographics count
    const expectedInfographics = getExpectedInfographicsCount(plan);
    console.log(`📊 Expected Infographics: ${expectedInfographics}`);

    // Define all 17 agents
    const ALL_AGENTS = [
      { id: 1, name: "Coordinator", agent: "Coordinator", taskType: "general", minPlan: "freemium", weight: 2 },
      { id: 2, name: "Technical_Analyst", agent: "Technical Analyst", taskType: "analysis", minPlan: "freemium", weight: 8 },
      { id: 3, name: "SEO_Specialist", agent: "SEO Specialist", taskType: "analysis", minPlan: "freemium", weight: 8 },
      { id: 4, name: "Content_Strategist", agent: "Content Strategist", taskType: "analysis", minPlan: "freemium", weight: 7 },
      { id: 5, name: "UX_Designer", agent: "UX Designer", taskType: "analysis", minPlan: "freemium", weight: 7 },
      { id: 6, name: "Performance_Engineer", agent: "Performance Engineer", taskType: "analysis", minPlan: "freemium", weight: 7 },
      { id: 7, name: "Security_Analyst", agent: "Security Analyst", taskType: "analysis", minPlan: "pro", weight: 8 },
      { id: 8, name: "Accessibility_Expert", agent: "Accessibility Expert", taskType: "analysis", minPlan: "pro", weight: 6 },
      { id: 9, name: "Mobile_Specialist", agent: "Mobile Specialist", taskType: "analysis", minPlan: "pro", weight: 6 },
      { id: 10, name: "Conversion_Optimizer", agent: "Conversion Optimizer", taskType: "analysis", minPlan: "pro", weight: 7 },
      { id: 11, name: "Market_Analyst", agent: "Market Analyst", taskType: "research", minPlan: "pro", weight: 10 },
      { id: 12, name: "Brand_Strategist", agent: "Brand Strategist", taskType: "analysis", minPlan: "agency", weight: 7 },
      { id: 13, name: "Social_Media_Manager", agent: "Social Media Manager", taskType: "research", minPlan: "agency", weight: 6 },
      { id: 14, name: "Data_Analyst", agent: "Data Analyst", taskType: "analysis", minPlan: "agency", weight: 7 },
      { id: 15, name: "Legal_Advisor", agent: "Legal Advisor", taskType: "analysis", minPlan: "enterprise", weight: 6 },
      { id: 16, name: "Strategy_Consultant", agent: "Strategy Consultant", taskType: "writing", minPlan: "freemium", weight: 10 },
      { id: 17, name: "Report_Writer", agent: "Report Writer", taskType: "writing", minPlan: "freemium", weight: 6 }
    ];

    // Filter agents based on plan
    const planHierarchy: Record<PlanTier, number> = { freemium: 0, pro: 1, agency: 2, enterprise: 3 };
    const currentPlanLevel = planHierarchy[plan];
    
    const activeAgents = ALL_AGENTS.filter(agent => planHierarchy[agent.minPlan as PlanTier] <= currentPlanLevel);
    
    console.log(`🤖 Active Agents: ${activeAgents.length}/${ALL_AGENTS.length}`);
    console.log(`🎯 Agents: ${activeAgents.map(a => a.agent).join(', ')}`);

    // Calculate total weight for progress tracking
    const totalWeight = activeAgents.reduce((sum, agent) => sum + agent.weight, 0);
    let completedWeight = 0;

    // Execute each agent sequentially
    const agentResults: Record<string, any> = {};
    const reportSections: Record<string, string> = {};

    for (const agent of activeAgents) {
      console.log(`\n🔄 Agent ${agent.id}/${activeAgents.length}: ${agent.agent}`);
      
      // Map agent taskType to valid TaskType
      const taskTypeMap: Record<string, TaskType> = {
        'general': 'synthesis',
        'analysis': 'analysis',
        'research': 'research',
        'writing': 'writing'
      };
      const taskType = taskTypeMap[agent.taskType] || 'analysis';
      
      // Get the best model for this task
      const model = getModelForTask(plan, taskType);
      console.log(`   📡 Model: ${model.model} (${model.description})`);

      // Build premium prompt (500-1000 words)
      const context = {
        url: audit.url,
        sector: (audit as any).sector || 'general'
      };
      const prompt = getPremiumPrompt(agent.name, plan, context);
      console.log(`   📝 Prompt length: ${prompt.length} characters`);

      // Update progress
      const progress = Math.floor((completedWeight / totalWeight) * 90); // Reserve 10% for final steps
      await supabase
        .from('pre_audits')
        .update({
          status: 'processing',
          progress,
          current_phase: agent.agent
        })
        .eq('id', audit_id);

      // Execute AI analysis
      try {
        const result = await executeAIAnalysis(
          model,
          prompt,
          audit,
          agentResults
        );
        
        agentResults[agent.name] = result;
        reportSections[agent.agent] = result; // Store for length control
        console.log(`   ✅ ${agent.agent} completed (${result.length} chars)`);
        
      } catch (error) {
        console.error(`   ❌ ${agent.agent} failed:`, error);
        
        // Try fallback with freemium model
        console.log(`   🔄 Retrying with fallback model...`);
        try {
          const fallbackModel = getModelForTask('freemium', taskType);
          const result = await executeAIAnalysis(
            fallbackModel,
            prompt,
            audit,
            agentResults
          );
          agentResults[agent.name] = result;
          reportSections[agent.agent] = result;
          console.log(`   ✅ ${agent.agent} completed with fallback`);
        } catch (fallbackError) {
          console.error(`   ❌ Fallback failed:`, fallbackError);
          agentResults[agent.name] = `Error: Analysis failed for ${agent.agent}`;
          reportSections[agent.agent] = '';
        }
      }

      completedWeight += agent.weight;
    }

    // Step 1: Adjust report length
    console.log('\n📏 Step 1: Adjusting Report Length...');
    await supabase.from('pre_audits').update({ progress: 91, current_phase: 'Adjusting report length' }).eq('id', audit_id);
    
    const adjustedSections = await adjustReportLength(
      reportSections,
      plan,
      async (expansionPrompt: string) => {
        const writingModel = getModelForTask(plan, 'writing');
        return await executeAIAnalysis(writingModel, expansionPrompt, audit, {});
      }
    );

    // Step 2: Generate infographics
    console.log('\n📊 Step 2: Generating Infographics...');
    await supabase.from('pre_audits').update({ progress: 93, current_phase: 'Generating infographics' }).eq('id', audit_id);
    
    const infographics = await generateInfographicsForPlan(plan, agentResults, audit);
    console.log(`   ✅ Generated ${infographics.length} infographics`);

    // Step 3: Quality validation
    console.log('\n✅ Step 3: Quality Guardian Validation...');
    await supabase.from('pre_audits').update({ progress: 96, current_phase: 'Quality validation' }).eq('id', audit_id);
    
    const fullReport = Object.values(adjustedSections).join('\n\n');
    const qualityCheck = await validateQuality(
      fullReport,
      plan,
      {
        scenarios: countScenarios(agentResults),
        infographics: infographics.length
      }
    );

    console.log(`   📊 Quality Score: ${qualityCheck.score}/100`);
    console.log(`   ${qualityCheck.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (!qualityCheck.passed) {
      console.warn(`   ⚠️  Quality issues detected:`);
      qualityCheck.issues.forEach(issue => {
        console.warn(`      - [${issue.severity}] ${issue.description}`);
      });
    }

    // Step 4: Generate final report
    console.log('\n📝 Step 4: Generating Final Report...');
    await supabase.from('pre_audits').update({ progress: 98, current_phase: 'Finalizing report' }).eq('id', audit_id);
    
    const finalReport = {
      audit_id: audit.id,
      url: audit.url,
      plan,
      organization: audit.organizations?.name || 'Unknown',
      generated_at: new Date().toISOString(),
      models_used: {
        display: aiConfig.displayModels,
        research: aiConfig.research.model,
        analysis: aiConfig.analysis.model,
        writing: aiConfig.writing.model
      },
      agents_executed: activeAgents.map(a => a.agent),
      sections: adjustedSections,
      infographics,
      quality_check: {
        score: qualityCheck.score,
        passed: qualityCheck.passed,
        issues: qualityCheck.issues
      },
      metrics: {
        word_count: fullReport.split(/\s+/).length,
        estimated_pages: Math.ceil(fullReport.split(/\s+/).length / 300),
        infographics_count: infographics.length,
        scenarios_count: countScenarios(agentResults)
      }
    };

    // Update audit with results
    await supabase
      .from('pre_audits')
      .update({
        status: 'completed',
        consolidated: finalReport,
        updated_at: new Date().toISOString()
      })
      .eq('id', audit_id);

    // Log completion
    console.log('🎉 Audit completed and saved to database');

    console.log('\n=== ✅ Orchestration Completed Successfully ===');
    console.log(`📊 Final Metrics:`);
    console.log(`   - Agents: ${activeAgents.length}`);
    console.log(`   - Words: ${finalReport.metrics.word_count}`);
    console.log(`   - Pages: ${finalReport.metrics.estimated_pages}`);
    console.log(`   - Infographics: ${finalReport.metrics.infographics_count}`);
    console.log(`   - Quality Score: ${qualityCheck.score}/100`);

    return new Response(
      JSON.stringify({
        success: true,
        audit_id,
        metrics: finalReport.metrics,
        quality_score: qualityCheck.score
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Orchestration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Execute AI analysis with the specified model
 */
async function executeAIAnalysis(
  model: ModelConfig,
  prompt: string,
  audit: any,
  previousResults: Record<string, any>
): Promise<string> {
  
  // Add context from previous results
  const contextPrompt = buildContextFromPreviousResults(previousResults);
  const fullPrompt = contextPrompt + '\n\n' + prompt;
  
  // Route to the appropriate API
  switch (model.provider) {
    case 'lovable':
      return await callLovableAPI(model, fullPrompt);
    case 'anthropic':
      return await callClaudeAPI(model, fullPrompt);
    case 'openai':
      return await callOpenAIAPI(model, fullPrompt);
    case 'perplexity':
      return await callPerplexityAPI(model, fullPrompt);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

/**
 * Build context from previous agent results
 */
function buildContextFromPreviousResults(results: Record<string, any>): string {
  if (Object.keys(results).length === 0) {
    return '';
  }
  
  return `**Context from Previous Agents:**\n${Object.entries(results)
    .map(([agent, result]) => `- ${agent}: ${String(result).substring(0, 200)}...`)
    .join('\n')}\n`;
}

/**
 * Count strategic scenarios in results
 */
function countScenarios(results: Record<string, any>): number {
  const strategyResult = results['Strategy_Consultant'] || '';
  const scenarioMatches = String(strategyResult).match(/scenario|strategic initiative/gi);
  return scenarioMatches ? Math.min(scenarioMatches.length, 7) : 1;
}

// API call functions
async function callLovableAPI(model: ModelConfig, prompt: string): Promise<string> {
  const endpoint = PROVIDER_ENDPOINTS.lovable;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callClaudeAPI(model: ModelConfig, prompt: string): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const endpoint = PROVIDER_ENDPOINTS.anthropic;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model.model,
      max_tokens: model.maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callOpenAIAPI(model: ModelConfig, prompt: string): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const endpoint = PROVIDER_ENDPOINTS.openai;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callPerplexityAPI(model: ModelConfig, prompt: string): Promise<string> {
  const apiKey = Deno.env.get('SONAR_API_KEY');
  if (!apiKey) throw new Error('SONAR_API_KEY not configured');

  const endpoint = PROVIDER_ENDPOINTS.perplexity;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
