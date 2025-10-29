import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestrationRequest {
  preAuditId: string;
  url: string;
  companyInfo?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preAuditId, url, companyInfo }: OrchestrationRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');

    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting multi-agent orchestration for pre-audit: ${preAuditId}`);

    // Create orchestration record
    const { data: orchestration, error: orchError } = await supabase
      .from('agent_orchestrations')
      .insert({
        pre_audit_id: preAuditId,
        status: 'running',
        started_at: new Date().toISOString(),
        current_phase: 'market_research',
        progress: 0,
        phases: [
          { name: 'market_research', order: 1, status: 'pending' },
          { name: 'conversational_audits', order: 2, status: 'pending' },
          { name: 'specialized_analysis', order: 3, status: 'pending' },
          { name: 'synthesis', order: 4, status: 'pending' }
        ]
      })
      .select()
      .single();

    if (orchError) {
      console.error('Error creating orchestration:', orchError);
      throw orchError;
    }

    console.log('Orchestration created:', orchestration.id);

    // Call n8n webhook
    const n8nPayload = {
      orchestrationId: orchestration.id,
      preAuditId,
      url,
      companyInfo: companyInfo || {},
      supabaseUrl,
      supabaseKey,
      phases: [
        {
          name: 'market_research',
          order: 1,
          agents: ['market_researcher', 'competitor_analyst', 'trend_analyzer']
        },
        {
          name: 'conversational_audits',
          order: 2,
          agents: ['marketing_auditor', 'sales_auditor', 'tech_auditor', 'strategy_auditor']
        },
        {
          name: 'specialized_analysis',
          order: 3,
          agents: ['seo_specialist', 'content_analyzer', 'ux_auditor', 'conversion_optimizer']
        },
        {
          name: 'synthesis',
          order: 4,
          agents: ['synthesizer', 'validator', 'report_generator']
        }
      ]
    };

    console.log('Calling n8n webhook:', n8nWebhookUrl);

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', errorText);
      
      // Update orchestration status to error
      await supabase
        .from('agent_orchestrations')
        .update({
          status: 'error',
          error: `n8n webhook failed: ${errorText}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', orchestration.id);

      throw new Error(`n8n webhook failed: ${errorText}`);
    }

    const n8nResult = await n8nResponse.json();
    console.log('n8n webhook response:', n8nResult);

    // Update orchestration with n8n execution ID
    await supabase
      .from('agent_orchestrations')
      .update({
        n8n_execution_id: n8nResult.executionId || n8nResult.id
      })
      .eq('id', orchestration.id);

    return new Response(
      JSON.stringify({
        success: true,
        orchestrationId: orchestration.id,
        n8nExecutionId: n8nResult.executionId || n8nResult.id,
        message: 'Multi-agent orchestration started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in orchestrate-multi-agent:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
