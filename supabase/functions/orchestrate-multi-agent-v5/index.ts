/**
 * Supabase Edge Function: orchestrate-multi-agent-v5
 * 
 * Orchestrates 17 specialized AI agents with intelligent routing to premium models
 * Uses Gemini 3 Pro, Claude Opus 4.5, GPT-5.2, and Perplexity based on subscription plan
 * 
 * Version 5.0 - Premium AI Models Routing
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAIConfigForPlan, getModelForTask, AIModelConfig } from "../_shared/aiModelsConfig.ts";

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

    // Get audit ID from request
    const { audit_id } = await req.json();

    console.log('=== Multi-Agent Orchestration v5.0 Started ===');
    console.log('Audit ID:', audit_id);

    // Get audit details with organization and plan
    const { data: audit, error: auditError } = await supabase
      .from('pre_audits')
      .select(`
        *,
        organizations!inner(
          id,
          subscription_plan,
          name
        )
      `)
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      throw new Error('Audit not found');
    }

    const plan = audit.organizations.subscription_plan || 'freemium';
    console.log(`📊 Plan: ${plan}`);
    console.log(`🏢 Organization: ${audit.organizations.name}`);

    // Get AI configuration for this plan
    const aiConfig = getAIConfigForPlan(plan);
    console.log(`🤖 Primary Model: ${aiConfig.primaryModel.displayName}`);
    console.log(`🔍 Research Model: ${aiConfig.researchModel.displayName}`);
    console.log(`📊 Analysis Model: ${aiConfig.analysisModel.displayName}`);
    console.log(`✍️  Writing Model: ${aiConfig.writingModel.displayName}`);

    // Define phases with task types for intelligent routing
    const AUDIT_PHASES = [
      { id: 1, name: "Initialization", agent: "Coordinator", taskType: "general", minPlan: "freemium" },
      { id: 2, name: "Technical Analysis", agent: "Technical Analyst", taskType: "analysis", minPlan: "freemium" },
      { id: 3, name: "SEO Audit", agent: "SEO Specialist", taskType: "analysis", minPlan: "freemium" },
      { id: 4, name: "Content Analysis", agent: "Content Strategist", taskType: "analysis", minPlan: "freemium" },
      { id: 5, name: "UX/UI Review", agent: "UX Designer", taskType: "analysis", minPlan: "freemium" },
      { id: 6, name: "Performance Check", agent: "Performance Engineer", taskType: "analysis", minPlan: "freemium" },
      { id: 7, name: "Security Scan", agent: "Security Analyst", taskType: "analysis", minPlan: "pro" },
      { id: 8, name: "Accessibility Check", agent: "Accessibility Expert", taskType: "analysis", minPlan: "pro" },
      { id: 9, name: "Mobile Optimization", agent: "Mobile Specialist", taskType: "analysis", minPlan: "pro" },
      { id: 10, name: "Conversion Analysis", agent: "Conversion Optimizer", taskType: "analysis", minPlan: "pro" },
      { id: 11, name: "Competitor Research", agent: "Market Analyst", taskType: "research", minPlan: "pro" },
      { id: 12, name: "Brand Consistency", agent: "Brand Strategist", taskType: "analysis", minPlan: "agency" },
      { id: 13, name: "Social Media Presence", agent: "Social Media Manager", taskType: "research", minPlan: "agency" },
      { id: 14, name: "Analytics Review", agent: "Data Analyst", taskType: "analysis", minPlan: "agency" },
      { id: 15, name: "Legal Compliance", agent: "Legal Advisor", taskType: "analysis", minPlan: "enterprise" },
      { id: 16, name: "Recommendations", agent: "Strategy Consultant", taskType: "writing", minPlan: "freemium" },
      { id: 17, name: "Report Generation", agent: "Report Writer", taskType: "writing", minPlan: "freemium" }
    ];

    // Filter phases based on plan
    const planHierarchy = { freemium: 0, pro: 1, agency: 2, enterprise: 3 };
    const currentPlanLevel = planHierarchy[plan];
    
    const activePhasesIds = AUDIT_PHASES
      .filter(phase => planHierarchy[phase.minPlan] <= currentPlanLevel)
      .map(phase => phase.id);

    const phasesToExecute = AUDIT_PHASES.filter(phase => activePhasesIds.includes(phase.id));

    console.log(`🤖 Agents actifs: ${phasesToExecute.length}/${AUDIT_PHASES.length}`);
    console.log(`🎯 Phases: ${phasesToExecute.map(p => p.name).join(', ')}`);

    // Execute each phase with intelligent model routing
    const results: Record<string, any> = {};
    let totalProgress = 0;

    for (const phase of phasesToExecute) {
      console.log(`\n🔄 Phase ${phase.id}/${phasesToExecute.length}: ${phase.name}`);
      
      // Get the best model for this task type
      const model = getModelForTask(plan, phase.taskType);
      console.log(`   📡 Using: ${model.displayName}`);

      // Update progress
      totalProgress = Math.floor((phase.id / phasesToExecute.length) * 100);
      await supabase
        .from('pre_audits')
        .update({
          status: 'processing',
          progress: totalProgress,
          current_phase: phase.name
        })
        .eq('id', audit_id);

      // Execute AI analysis with the selected model
      try {
        const result = await executeAIAnalysis(
          model,
          phase,
          audit,
          results,
          plan
        );
        
        results[phase.name] = result;
        console.log(`   ✅ ${phase.name} completed`);
        
      } catch (error) {
        console.error(`   ❌ ${phase.name} failed:`, error);
        
        // Try fallback model if available
        if (aiConfig.fallbackModel && model.model !== aiConfig.fallbackModel.model) {
          console.log(`   🔄 Retrying with fallback: ${aiConfig.fallbackModel.displayName}`);
          try {
            const result = await executeAIAnalysis(
              aiConfig.fallbackModel,
              phase,
              audit,
              results,
              plan
            );
            results[phase.name] = result;
            console.log(`   ✅ ${phase.name} completed with fallback`);
          } catch (fallbackError) {
            console.error(`   ❌ Fallback also failed:`, fallbackError);
            results[phase.name] = { error: 'Analysis failed', details: String(fallbackError) };
          }
        } else {
          results[phase.name] = { error: 'Analysis failed', details: String(error) };
        }
      }
    }

    // Generate final report
    const finalReport = generateFinalReport(results, audit, plan, aiConfig);

    // Update audit with results
    await supabase
      .from('pre_audits')
      .update({
        status: 'completed',
        progress: 100,
        results: finalReport,
        completed_at: new Date().toISOString()
      })
      .eq('id', audit_id);

    // Decrement credits for freemium
    if (plan === 'freemium') {
      await supabase.rpc('decrement_organization_credits', {
        org_id: audit.organizations.id
      });
    }

    console.log('=== Orchestration Completed Successfully ===');

    return new Response(
      JSON.stringify({
        success: true,
        audit_id,
        plan,
        agents_used: phasesToExecute.length,
        models_used: {
          primary: aiConfig.primaryModel.displayName,
          research: aiConfig.researchModel.displayName,
          analysis: aiConfig.analysisModel.displayName,
          writing: aiConfig.writingModel.displayName
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Orchestration error:', error);
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
  model: AIModelConfig,
  phase: any,
  audit: any,
  previousResults: Record<string, any>,
  plan: string
): Promise<any> {
  
  const prompt = buildPromptForPhase(phase, audit, previousResults, plan);
  
  // Route to the appropriate API based on provider
  switch (model.provider) {
    case 'Google':
      return await callGeminiAPI(model, prompt);
    case 'Anthropic':
      return await callClaudeAPI(model, prompt);
    case 'OpenAI':
      return await callOpenAIAPI(model, prompt);
    case 'Perplexity':
      return await callPerplexityAPI(model, prompt);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(model: AIModelConfig, prompt: string): Promise<any> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `${model.apiEndpoint}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: model.temperature,
          maxOutputTokens: model.maxTokens
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * Call Anthropic Claude API
 */
async function callClaudeAPI(model: AIModelConfig, prompt: string): Promise<any> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch(model.apiEndpoint!, {
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
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(model: AIModelConfig, prompt: string): Promise<any> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch(model.apiEndpoint!, {
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
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Perplexity API
 */
async function callPerplexityAPI(model: AIModelConfig, prompt: string): Promise<any> {
  const apiKey = Deno.env.get('SONAR_API_KEY');
  if (!apiKey) throw new Error('SONAR_API_KEY not configured');

  const response = await fetch(model.apiEndpoint!, {
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
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Build prompt for a specific phase
 */
function buildPromptForPhase(
  phase: any,
  audit: any,
  previousResults: Record<string, any>,
  plan: string
): string {
  // This would contain the actual prompt engineering
  // For now, returning a placeholder
  return `Analyze ${audit.url} for ${phase.name} with ${plan} plan depth.`;
}

/**
 * Generate final report from all phase results
 */
function generateFinalReport(
  results: Record<string, any>,
  audit: any,
  plan: string,
  aiConfig: any
): any {
  return {
    audit_id: audit.id,
    url: audit.url,
    plan,
    models_used: {
      primary: aiConfig.primaryModel.displayName,
      research: aiConfig.researchModel.displayName,
      analysis: aiConfig.analysisModel.displayName,
      writing: aiConfig.writingModel.displayName
    },
    results,
    generated_at: new Date().toISOString()
  };
}
