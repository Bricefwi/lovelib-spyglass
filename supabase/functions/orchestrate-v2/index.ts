import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * ORCHESTRATEUR MODULAIRE V2
 * Phase 2 - Coordination agents spécialisés avec exécution plan-aware
 * Style: Laboratoire Perplexity - Narrative riche, zéro hallucination
 */

const requestSchema = z.object({
  audit_id: z.string().uuid(),
  tier: z.enum(['starter', 'agency', 'enterprise', 'one_shot']).optional(),
  organization_id: z.string().uuid().optional()
});

interface AgentResult {
  agent: string;
  success: boolean;
  data: any;
  metadata: any;
  duration_ms: number;
  cost_usd: number;
}

/**
 * Calculate LLM cost based on tokens
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'perplexity/sonar-pro': { input: 3.00, output: 15.00 },
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
  };

  const rates = pricing[model] || { input: 2.00, output: 8.00 };
  return (inputTokens / 1_000_000 * rates.input) + (outputTokens / 1_000_000 * rates.output);
}

/**
 * Call an agent edge function
 */
async function callAgent(
  agentName: string,
  payload: any,
  authHeader: string,
  supabaseUrl: string
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/${agentName}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const duration_ms = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Agent ${agentName} failed: ${response.status}`);
    }

    const result = await response.json();

    // Calculate cost from metadata
    const cost_usd = result.metadata?.tokens
      ? calculateCost(
          result.metadata.model_used,
          result.metadata.tokens.input || 0,
          result.metadata.tokens.output || 0
        )
      : 0;

    return {
      agent: agentName,
      success: result.success,
      data: result.data,
      metadata: result.metadata,
      duration_ms,
      cost_usd
    };
  } catch (error: any) {
    console.error(`❌ Agent ${agentName} failed:`, error.message);
    return {
      agent: agentName,
      success: false,
      data: null,
      metadata: { error: error.message },
      duration_ms: Date.now() - startTime,
      cost_usd: 0
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🚀 ========== ORCHESTRATION V2 START ==========");

    // 1. Auth & Validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Auth failed');

    console.log(`✅ User: ${user.email}`);

    // Parse request
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { audit_id, tier: requestedTier, organization_id } = validation.data;
    console.log(`📋 Audit: ${audit_id}`);

    // 2. Fetch audit
    const { data: audit, error: auditError } = await supabase
      .from('pre_audits')
      .select('*, organizations(id, subscription_plan)')
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: "Audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Audit URL: ${audit.url}`);

    // 3. Load plan profile
    const effectiveTier = requestedTier || audit.organizations?.subscription_plan || 'starter';
    const effectiveOrgId = organization_id || audit.organization_id;

    console.log(`📋 Loading plan: ${effectiveTier}`);

    const planResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/load-plan-profile`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier: effectiveTier, organization_id: effectiveOrgId }),
    });

    if (!planResponse.ok) throw new Error('Failed to load plan profile');

    const planData = await planResponse.json();
    const planProfile = planData.plan_profile;
    const branding = planData.branding;
    const orchestrationConfig = planData.orchestration_config;

    console.log(`✅ Plan: ${planProfile.display_name}`);
    console.log(`⚙️ Config: max_agents=${orchestrationConfig.max_agents}, parallel=${orchestrationConfig.parallel_execution}`);
    console.log(`💰 Budget: $${planProfile.llm_budget_per_audit}`);

    // 4. Determine which agents to run based on modules_config
    const modulesConfig = planProfile.modules_config;
    const agentsToRun: Array<{ name: string; depth: string; dependencies: string[] }> = [];

    // Core strategic agents (always run if enabled)
    if (modulesConfig.analyse_strategique?.enabled) {
      const depth = modulesConfig.analyse_strategique.depth;
      agentsToRun.push(
        { name: 'agent-scraper', depth, dependencies: [] },
        { name: 'agent-pestel', depth, dependencies: ['agent-scraper'] },
        { name: 'agent-porter', depth, dependencies: ['agent-scraper', 'agent-pestel'] },
        { name: 'agent-swot', depth, dependencies: ['agent-scraper', 'agent-pestel', 'agent-porter'] }
      );
    }

    console.log(`📊 Agents to run: ${agentsToRun.length}`);
    agentsToRun.forEach(a => console.log(`  - ${a.name} (${a.depth})`));

    // 5. Execute agents (parallel or sequential based on tier)
    const agentResults: AgentResult[] = [];
    let totalCost = 0;

    if (orchestrationConfig.parallel_execution && agentsToRun.length > 1) {
      console.log("⚡ Executing agents in PARALLEL");

      // For simplicity, run scraper first, then others in parallel
      const scraperAgent = agentsToRun.find(a => a.name === 'agent-scraper');
      if (scraperAgent) {
        const scraperResult = await callAgent(
          scraperAgent.name,
          { url: audit.url, company_name: audit.company_guess, depth: scraperAgent.depth },
          authHeader,
          Deno.env.get("SUPABASE_URL")!
        );
        agentResults.push(scraperResult);
        totalCost += scraperResult.cost_usd;
        console.log(`✅ ${scraperAgent.name}: ${scraperResult.success ? 'OK' : 'FAILED'} ($${scraperResult.cost_usd.toFixed(4)})`);

        // Then run others in parallel
        const remainingAgents = agentsToRun.filter(a => a.name !== 'agent-scraper');
        const parallelResults = await Promise.all(
          remainingAgents.map(agent => {
            const payload: any = {
              company_data: {
                name: scraperResult.data?.company_profile?.name || audit.company_guess || 'Unknown',
                industry: scraperResult.data?.company_profile?.industry || 'Unknown',
                market_position: scraperResult.data?.company_profile?.description || ''
              },
              depth: agent.depth
            };

            // Add dependencies data
            if (agent.name === 'agent-pestel') {
              payload.scraper_data = scraperResult;
            } else if (agent.name === 'agent-porter') {
              payload.scraper_data = scraperResult;
              const pestelResult = agentResults.find(r => r.agent === 'agent-pestel');
              if (pestelResult) payload.pestel_context = pestelResult;
            } else if (agent.name === 'agent-swot') {
              payload.scraper_data = scraperResult;
              const pestelResult = agentResults.find(r => r.agent === 'agent-pestel');
              const porterResult = agentResults.find(r => r.agent === 'agent-porter');
              if (pestelResult) payload.pestel_data = pestelResult;
              if (porterResult) payload.porter_data = porterResult;
            }

            return callAgent(agent.name, payload, authHeader, Deno.env.get("SUPABASE_URL")!);
          })
        );

        parallelResults.forEach(result => {
          agentResults.push(result);
          totalCost += result.cost_usd;
          console.log(`✅ ${result.agent}: ${result.success ? 'OK' : 'FAILED'} ($${result.cost_usd.toFixed(4)})`);
        });
      }
    } else {
      console.log("🐌 Executing agents SEQUENTIALLY");

      // Sequential execution for starter tier or single agent
      for (const agent of agentsToRun) {
        const previousResults: Record<string, AgentResult> = {};
        agentResults.forEach(r => { previousResults[r.agent] = r; });

        const scraperResult = previousResults['agent-scraper'];

        const payload: any = {
          company_data: {
            name: scraperResult?.data?.company_profile?.name || audit.company_guess || 'Unknown',
            industry: scraperResult?.data?.company_profile?.industry || 'Unknown',
          },
          depth: agent.depth
        };

        if (agent.name === 'agent-scraper') {
          payload.url = audit.url;
          payload.company_name = audit.company_guess;
          delete payload.company_data;
        } else if (agent.name === 'agent-pestel' && scraperResult) {
          payload.scraper_data = scraperResult;
        } else if (agent.name === 'agent-porter') {
          payload.scraper_data = scraperResult;
          payload.pestel_context = previousResults['agent-pestel'];
        } else if (agent.name === 'agent-swot') {
          payload.scraper_data = scraperResult;
          payload.pestel_data = previousResults['agent-pestel'];
          payload.porter_data = previousResults['agent-porter'];
        }

        const result = await callAgent(agent.name, payload, authHeader, Deno.env.get("SUPABASE_URL")!);
        agentResults.push(result);
        totalCost += result.cost_usd;
        console.log(`✅ ${result.agent}: ${result.success ? 'OK' : 'FAILED'} ($${result.cost_usd.toFixed(4)})`);

        // Check budget
        if (totalCost > planProfile.llm_budget_per_audit) {
          console.warn(`⚠️ Budget exceeded! $${totalCost.toFixed(4)} > $${planProfile.llm_budget_per_audit}`);
          break;
        }
      }
    }

    console.log(`💰 Total cost: $${totalCost.toFixed(4)} / $${planProfile.llm_budget_per_audit}`);

    // 6. Aggregate results
    const consolidatedReport = {
      company_profile: agentResults.find(r => r.agent === 'agent-scraper')?.data || {},
      pestel_analysis: agentResults.find(r => r.agent === 'agent-pestel')?.data || {},
      porter_analysis: agentResults.find(r => r.agent === 'agent-porter')?.data || {},
      swot_analysis: agentResults.find(r => r.agent === 'agent-swot')?.data || {},
      metadata: {
        plan_tier: effectiveTier,
        quality_level: planProfile.quality_level,
        narrative_style: planProfile.narrative_style,
        agents_executed: agentResults.map(r => r.agent),
        total_cost_usd: totalCost,
        execution_time_ms: agentResults.reduce((sum, r) => sum + r.duration_ms, 0),
        timestamp: new Date().toISOString()
      }
    };

    // 7. Update audit in database
    await supabase.from('pre_audits').update({
      status: 'consolidated',
      current_phase: 'COMPLETED',
      consolidated: consolidatedReport,
      plan_tier: effectiveTier,
      quality_level: planProfile.quality_level,
      llm_budget_used: totalCost,
      confidence: 95 // Will be calculated based on agent results
    }).eq('id', audit_id);

    console.log("✅ Audit updated");

    // 8. Generate HTML report (simplified for now - will enhance with Senior Writer later)
    const reportTitle = `Rapport Stratégique - ${audit.url}`;
    const reportHtml = generateSimpleReport(consolidatedReport, branding, audit);

    const { data: report } = await supabase.from('audit_reports').insert({
      pre_audit_id: audit_id,
      title: reportTitle,
      html: reportHtml,
      status: 'completed',
      created_by: user.id
    }).select().single();

    console.log(`✅ Report created: ${report?.id}`);
    console.log("🚀 ========== ORCHESTRATION V2 END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report?.id,
        audit_id: audit_id,
        agents_executed: agentResults.length,
        agents_successful: agentResults.filter(r => r.success).length,
        total_cost_usd: totalCost,
        budget_remaining: planProfile.llm_budget_per_audit - totalCost,
        plan_tier: effectiveTier,
        quality_level: planProfile.quality_level,
        execution_mode: orchestrationConfig.parallel_execution ? 'parallel' : 'sequential'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ ORCHESTRATION ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate simplified HTML report (placeholder for Senior Writer integration)
 */
function generateSimpleReport(data: any, branding: any, audit: any): string {
  const primaryColor = branding.primary_color || '#1e3a8a';
  const companyName = branding.company_name || 'IMOTION Consulting';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Stratégique V2 - ${audit.url}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 20px; }
    .header { background: ${primaryColor}; color: white; padding: 40px; border-radius: 8px; margin-bottom: 30px; }
    .section { margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    h1 { margin: 0 0 10px 0; }
    h2 { color: ${primaryColor}; }
    pre { background: white; padding: 15px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Rapport Stratégique Multi-Agents V2</h1>
    <p>Analyse complète pour ${audit.url}</p>
    <p>Généré par ${companyName}</p>
  </div>

  <div class="section">
    <h2>🏢 Profil Entreprise</h2>
    <pre>${JSON.stringify(data.company_profile, null, 2)}</pre>
  </div>

  <div class="section">
    <h2>📊 Analyse PESTEL</h2>
    <pre>${JSON.stringify(data.pestel_analysis, null, 2)}</pre>
  </div>

  <div class="section">
    <h2>⚔️ Analyse Porter 5 Forces</h2>
    <pre>${JSON.stringify(data.porter_analysis, null, 2)}</pre>
  </div>

  <div class="section">
    <h2>🎯 Analyse SWOT</h2>
    <pre>${JSON.stringify(data.swot_analysis, null, 2)}</pre>
  </div>

  <div class="section">
    <h2>📈 Métadonnées</h2>
    <pre>${JSON.stringify(data.metadata, null, 2)}</pre>
  </div>

  <p style="text-align: center; margin-top: 40px; color: #666;">
    © ${new Date().getFullYear()} ${companyName} - Powered by Multi-Agent Orchestration V2
  </p>
</body>
</html>`;
}
