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

    // Marketing agents (Phase 3)
    if (modulesConfig.audit_seo?.enabled) {
      agentsToRun.push({
        name: 'agent-seo',
        depth: modulesConfig.audit_seo.depth,
        dependencies: ['agent-scraper']
      });
    }

    if (modulesConfig.content_marketing?.enabled) {
      agentsToRun.push({
        name: 'agent-content',
        depth: modulesConfig.content_marketing.depth,
        dependencies: ['agent-scraper', 'agent-seo']
      });
    }

    if (modulesConfig.social_media?.enabled) {
      agentsToRun.push({
        name: 'agent-social',
        depth: modulesConfig.social_media.depth,
        dependencies: ['agent-scraper']
      });
    }

    if (modulesConfig.email_marketing?.enabled) {
      agentsToRun.push({
        name: 'agent-email',
        depth: modulesConfig.email_marketing.depth,
        dependencies: ['agent-scraper']
      });
    }

    if (modulesConfig.data_analytics?.enabled) {
      agentsToRun.push({
        name: 'agent-data',
        depth: modulesConfig.data_analytics.depth,
        dependencies: ['agent-scraper']
      });
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
            } else if (agent.name === 'agent-seo') {
              payload.url = audit.url;
              payload.competitors = [];  // Could be populated from scraper data
            } else if (agent.name === 'agent-content') {
              const seoResult = agentResults.find(r => r.agent === 'agent-seo');
              if (seoResult) payload.seo_data = seoResult;
              payload.current_content = { blog_frequency: "weekly" };  // Could be enriched
            } else if (agent.name === 'agent-social') {
              payload.social_accounts = {};  // Could be populated from scraper
            } else if (agent.name === 'agent-email') {
              payload.current_performance = {};  // Could be enriched
            } else if (agent.name === 'agent-data') {
              payload.tech_stack = {};  // Could be enriched
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
        } else if (agent.name === 'agent-seo') {
          payload.url = audit.url;
          payload.competitors = [];
        } else if (agent.name === 'agent-content') {
          payload.seo_data = previousResults['agent-seo'];
          payload.current_content = { blog_frequency: "weekly" };
        } else if (agent.name === 'agent-social') {
          payload.social_accounts = {};
        } else if (agent.name === 'agent-email') {
          payload.current_performance = {};
        } else if (agent.name === 'agent-data') {
          payload.tech_stack = {};
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
      seo_audit: agentResults.find(r => r.agent === 'agent-seo')?.data || null,
      content_strategy: agentResults.find(r => r.agent === 'agent-content')?.data || null,
      social_media_audit: agentResults.find(r => r.agent === 'agent-social')?.data || null,
      email_marketing_audit: agentResults.find(r => r.agent === 'agent-email')?.data || null,
      data_analytics_audit: agentResults.find(r => r.agent === 'agent-data')?.data || null,
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

    // 7.5. Call Senior Writer for narrative synthesis (Phase 4)
    console.log("✍️ Calling Senior Writer for narrative synthesis...");

    let narrativeReport = null;
    try {
      const seniorWriterResult = await callAgent(
        'agent-senior-writer',
        {
          agents_results: {
            company_profile: consolidatedReport.company_profile,
            pestel_analysis: consolidatedReport.pestel_analysis,
            porter_analysis: consolidatedReport.porter_analysis,
            swot_analysis: consolidatedReport.swot_analysis,
            seo_audit: consolidatedReport.seo_audit,
            content_strategy: consolidatedReport.content_strategy,
            social_media_audit: consolidatedReport.social_media_audit,
            email_marketing_audit: consolidatedReport.email_marketing_audit,
            data_analytics_audit: consolidatedReport.data_analytics_audit,
          },
          plan_profile: {
            report_pages: planProfile.report_pages || 50,
            scenarios_count: planProfile.scenarios_count || 3,
            narrative_style: planProfile.narrative_style || 'professionnel',
            quality_level: planProfile.quality_level || 'standard',
          },
          company_data: {
            name: consolidatedReport.company_profile?.company_profile?.name || audit.company_guess || 'Unknown',
            url: audit.url,
          }
        },
        authHeader,
        Deno.env.get("SUPABASE_URL")!
      );

      if (seniorWriterResult.success) {
        narrativeReport = seniorWriterResult.data;
        totalCost += seniorWriterResult.cost_usd;
        console.log(`✅ Senior Writer: OK ($${seniorWriterResult.cost_usd.toFixed(4)})`);
        console.log(`📄 Narrative: ${narrativeReport.total_estimated_pages} pages, ${narrativeReport.sections?.length} sections`);
      } else {
        console.warn("⚠️ Senior Writer failed, using fallback");
      }
    } catch (error: any) {
      console.warn(`⚠️ Senior Writer error: ${error.message}, using fallback`);
    }

    // 8. Generate HTML report (enhanced with Senior Writer narrative)
    const reportTitle = `Rapport Stratégique - ${audit.url}`;
    const reportHtml = narrativeReport
      ? generateNarrativeReport(narrativeReport, consolidatedReport, branding, audit, planProfile)
      : generateSimpleReport(consolidatedReport, branding, audit);

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

/**
 * Simple Markdown to HTML converter
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Headers (###, ##, #)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Line breaks (double newlines become paragraphs)
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.startsWith('<')) {
      return `<p>${para.trim()}</p>`;
    }
    return para;
  }).join('\n');

  return html;
}

/**
 * Generate professional narrative HTML report from Senior Writer output
 */
function generateNarrativeReport(
  narrativeData: any,
  consolidatedData: any,
  branding: any,
  audit: any,
  planProfile: any
): string {
  const primaryColor = branding.primary_color || '#1e3a8a';
  const secondaryColor = branding.secondary_color || '#3b82f6';
  const companyName = branding.company_name || 'IMOTION Consulting';
  const logoUrl = branding.logo_url || '';

  const sections = narrativeData.sections || [];
  const execSummary = narrativeData.executive_summary_one_page || '';
  const keyRecs = narrativeData.key_recommendations_summary || [];
  const totalPages = narrativeData.total_estimated_pages || 50;
  const qualityScore = narrativeData.narrative_quality_score || 0;
  const clarityScore = narrativeData.strategic_clarity_score || 0;

  // Generate Table of Contents
  const tocHtml = sections.map((section: any, idx: number) => {
    const anchor = `section-${idx}`;
    return `<li><a href="#${anchor}" class="toc-link">${section.title}</a> <span class="toc-pages">(${section.estimated_pages || 0} pages)</span></li>`;
  }).join('\n');

  // Generate Sections HTML
  const sectionsHtml = sections.map((section: any, idx: number) => {
    const anchor = `section-${idx}`;
    const contentHtml = markdownToHtml(section.content || '');
    const insights = section.key_insights || [];

    const insightsHtml = insights.length > 0 ? `
      <div class="insights-box">
        <h4>💡 Insights Clés</h4>
        <ul>
          ${insights.map((insight: string) => `<li>${insight}</li>`).join('\n')}
        </ul>
      </div>
    ` : '';

    return `
      <section id="${anchor}" class="report-section">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-content">
          ${contentHtml}
          ${insightsHtml}
        </div>
        <div class="section-footer">
          <span>Estimation: ${section.estimated_pages || 0} pages</span>
        </div>
      </section>
    `;
  }).join('\n');

  // Generate Key Recommendations HTML
  const recsHtml = keyRecs.map((rec: any, idx: number) => {
    return `
      <div class="recommendation-card priority-${rec.priority || idx + 1}">
        <div class="rec-header">
          <span class="rec-priority">Priorité ${rec.priority || idx + 1}</span>
          <span class="rec-timeline">${rec.timeline || 'N/A'}</span>
        </div>
        <h4>${rec.recommendation || 'Recommandation'}</h4>
        <p class="rec-rationale"><strong>Rationale:</strong> ${rec.rationale || ''}</p>
        <p class="rec-impact"><strong>Impact:</strong> ${rec.impact || ''}</p>
        <p class="rec-budget"><strong>Budget:</strong> ${rec.budget || ''}</p>
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Stratégique - ${audit.url}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      color: #2d3748;
      background: #f7fafc;
      padding: 0;
      margin: 0;
    }

    /* Header */
    .report-header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .report-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .report-header .subtitle {
      font-size: 1.3rem;
      opacity: 0.95;
      margin-bottom: 5px;
    }

    .report-header .company {
      font-size: 1rem;
      opacity: 0.85;
      margin-top: 20px;
    }

    .report-header .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }

    .report-header .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 30px;
      flex-wrap: wrap;
    }

    .report-header .meta-item {
      background: rgba(255,255,255,0.2);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    /* Executive Summary Box */
    .exec-summary-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 6px solid #f59e0b;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 50px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .exec-summary-box h3 {
      color: #92400e;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }

    .exec-summary-box p {
      color: #78350f;
      font-size: 1.05rem;
      line-height: 1.8;
    }

    /* Key Recommendations */
    .recommendations-section {
      background: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 50px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .recommendations-section h3 {
      color: ${primaryColor};
      margin-bottom: 25px;
      font-size: 1.8rem;
      border-bottom: 3px solid ${secondaryColor};
      padding-bottom: 10px;
    }

    .recommendation-card {
      background: #f8fafc;
      border-left: 5px solid ${primaryColor};
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      transition: transform 0.2s;
    }

    .recommendation-card:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .recommendation-card.priority-1 { border-left-color: #dc2626; }
    .recommendation-card.priority-2 { border-left-color: #ea580c; }
    .recommendation-card.priority-3 { border-left-color: #f59e0b; }

    .rec-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      align-items: center;
    }

    .rec-priority {
      background: ${primaryColor};
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .rec-timeline {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .recommendation-card h4 {
      color: ${primaryColor};
      font-size: 1.25rem;
      margin-bottom: 12px;
    }

    .rec-rationale, .rec-impact, .rec-budget {
      margin: 8px 0;
      font-size: 0.95rem;
      color: #475569;
    }

    /* Table of Contents */
    .toc-section {
      background: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 50px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .toc-section h3 {
      color: ${primaryColor};
      margin-bottom: 20px;
      font-size: 1.8rem;
      border-bottom: 3px solid ${secondaryColor};
      padding-bottom: 10px;
    }

    .toc-section ul {
      list-style: none;
      padding-left: 0;
    }

    .toc-section li {
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toc-link {
      color: ${secondaryColor};
      text-decoration: none;
      font-size: 1.05rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .toc-link:hover {
      color: ${primaryColor};
      text-decoration: underline;
    }

    .toc-pages {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    /* Report Sections */
    .report-section {
      background: white;
      padding: 50px;
      margin-bottom: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      page-break-inside: avoid;
    }

    .section-title {
      color: ${primaryColor};
      font-size: 2rem;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 4px solid ${secondaryColor};
    }

    .section-content {
      color: #334155;
      font-size: 1.05rem;
      line-height: 1.9;
    }

    .section-content h1 {
      color: ${primaryColor};
      font-size: 1.8rem;
      margin: 30px 0 15px 0;
    }

    .section-content h2 {
      color: ${secondaryColor};
      font-size: 1.5rem;
      margin: 25px 0 12px 0;
    }

    .section-content h3 {
      color: #475569;
      font-size: 1.3rem;
      margin: 20px 0 10px 0;
    }

    .section-content p {
      margin: 15px 0;
    }

    .section-content ul, .section-content ol {
      margin: 15px 0 15px 30px;
    }

    .section-content li {
      margin: 8px 0;
    }

    .section-content strong {
      color: #1e293b;
      font-weight: 600;
    }

    .section-content code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #dc2626;
    }

    .section-content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;
    }

    .section-content pre code {
      background: none;
      color: inherit;
      padding: 0;
    }

    .section-content a {
      color: ${secondaryColor};
      text-decoration: none;
      font-weight: 500;
    }

    .section-content a:hover {
      text-decoration: underline;
    }

    /* Insights Box */
    .insights-box {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-left: 5px solid ${secondaryColor};
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }

    .insights-box h4 {
      color: #1e40af;
      margin-bottom: 15px;
      font-size: 1.2rem;
    }

    .insights-box ul {
      list-style: none;
      padding-left: 0;
    }

    .insights-box li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
      color: #1e3a8a;
    }

    .insights-box li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: ${secondaryColor};
      font-weight: bold;
    }

    .section-footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      color: #94a3b8;
      font-size: 0.9rem;
      text-align: right;
    }

    /* Footer */
    .report-footer {
      background: ${primaryColor};
      color: white;
      padding: 40px;
      text-align: center;
      margin-top: 60px;
    }

    .report-footer .scores {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .report-footer .score-item {
      background: rgba(255,255,255,0.2);
      padding: 15px 30px;
      border-radius: 10px;
    }

    .report-footer .score-value {
      font-size: 2rem;
      font-weight: 700;
      display: block;
    }

    .report-footer .score-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    /* Print Styles */
    @media print {
      body { background: white; }
      .report-section { page-break-inside: avoid; }
      .report-header { page-break-after: always; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="report-header">
    ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo">` : ''}
    <h1>📊 Rapport Stratégique Consolidé</h1>
    <p class="subtitle">Analyse Multi-Agents Approfondie</p>
    <p class="subtitle"><strong>${audit.url}</strong></p>
    <p class="company">Généré par ${companyName}</p>
    <div class="meta">
      <div class="meta-item">📄 ${totalPages} pages estimées</div>
      <div class="meta-item">📅 ${new Date().toLocaleDateString('fr-FR')}</div>
      <div class="meta-item">🎯 Qualité: ${planProfile.quality_level}</div>
      <div class="meta-item">🎨 Style: ${planProfile.narrative_style}</div>
    </div>
  </div>

  <div class="container">
    <!-- Executive Summary -->
    ${execSummary ? `
    <div class="exec-summary-box">
      <h3>📋 Executive Summary (1 page)</h3>
      ${markdownToHtml(execSummary)}
    </div>
    ` : ''}

    <!-- Key Recommendations -->
    ${keyRecs.length > 0 ? `
    <div class="recommendations-section">
      <h3>🎯 Recommandations Stratégiques Prioritaires</h3>
      ${recsHtml}
    </div>
    ` : ''}

    <!-- Table of Contents -->
    <div class="toc-section">
      <h3>📑 Table des Matières</h3>
      <ul>
        ${tocHtml}
      </ul>
    </div>

    <!-- Report Sections -->
    ${sectionsHtml}
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <div class="scores">
      <div class="score-item">
        <span class="score-value">${qualityScore.toFixed(1)}/10</span>
        <span class="score-label">Qualité Narrative</span>
      </div>
      <div class="score-item">
        <span class="score-value">${clarityScore.toFixed(1)}/10</span>
        <span class="score-label">Clarté Stratégique</span>
      </div>
      <div class="score-item">
        <span class="score-value">${sections.length}</span>
        <span class="score-label">Sections</span>
      </div>
    </div>
    <p style="opacity: 0.9; margin-top: 20px;">
      © ${new Date().getFullYear()} ${companyName}<br>
      Powered by Multi-Agent Orchestration V2 with Senior Writer AI
    </p>
  </div>
</body>
</html>`;
}
