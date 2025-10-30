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
    
    console.log('=== N8N Configuration Check ===');
    console.log('N8N_WEBHOOK_URL from env:', n8nWebhookUrl);
    console.log('N8N_WEBHOOK_URL is defined:', !!n8nWebhookUrl);

    if (!n8nWebhookUrl) {
      console.error('CRITICAL: N8N_WEBHOOK_URL not configured in secrets');
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

    // Payload pour n8n avec 12 agents répartis en 4 phases
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
          agents: [
            { name: 'market_researcher', role: 'Analyste de marché principal' },
            { name: 'competitor_analyst', role: 'Analyste concurrentiel' },
            { name: 'trend_analyzer', role: 'Analyste des tendances sectorielles' }
          ]
        },
        {
          name: 'conversational_audits',
          order: 2,
          agents: [
            { name: 'marketing_auditor', role: 'Auditeur marketing digital' },
            { name: 'sales_auditor', role: 'Auditeur commercial' },
            { name: 'tech_auditor', role: 'Auditeur technique' },
            { name: 'strategy_auditor', role: 'Auditeur stratégique' }
          ]
        },
        {
          name: 'specialized_analysis',
          order: 3,
          agents: [
            { name: 'seo_specialist', role: 'Spécialiste SEO' },
            { name: 'content_analyzer', role: 'Analyste de contenu' },
            { name: 'ux_auditor', role: 'Auditeur UX/UI' },
            { name: 'conversion_optimizer', role: 'Optimiseur de conversion' }
          ]
        },
        {
          name: 'synthesis',
          order: 4,
          agents: [
            { name: 'synthesizer', role: 'Synthétiseur principal' }
          ]
        }
      ]
    };

    console.log('=== Starting N8N Webhook Call ===');
    console.log('N8N Webhook URL:', n8nWebhookUrl);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Payload size:', JSON.stringify(n8nPayload).length, 'bytes');
    console.log('Full payload:', JSON.stringify(n8nPayload, null, 2));

    // Appel asynchrone à n8n - ne pas attendre la réponse
    console.log('Initiating fetch to N8N...');
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    })
      .then(async (response) => {
        console.log('=== N8N Response Received ===');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
        
        const responseText = await response.text();
        console.log('Response body length:', responseText.length);
        console.log('Response body:', responseText);

        if (!response.ok) {
          console.error('n8n webhook error:', responseText);
          
          // Update orchestration status to error
          await supabase
            .from('agent_orchestrations')
            .update({
              status: 'error',
              error: `n8n webhook failed (${response.status}): ${responseText}`,
              completed_at: new Date().toISOString()
            })
            .eq('id', orchestration.id);
        } else {
          let n8nResult;
          try {
            n8nResult = JSON.parse(responseText);
          } catch (e) {
            n8nResult = { raw: responseText };
          }
          
          console.log('n8n webhook response:', n8nResult);

          // Update orchestration with n8n execution ID
          await supabase
            .from('agent_orchestrations')
            .update({
              n8n_execution_id: n8nResult.executionId || n8nResult.id || 'pending'
            })
            .eq('id', orchestration.id);
        }
      })
      .catch(async (error) => {
        console.error('=== N8N Fetch Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        await supabase
          .from('agent_orchestrations')
          .update({
            status: 'error',
            error: `n8n webhook unreachable: ${error.message}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', orchestration.id);
      });

    // Répondre immédiatement au client
    return new Response(
      JSON.stringify({
        success: true,
        orchestrationId: orchestration.id,
        message: 'Multi-agent orchestration started successfully. n8n is processing asynchronously.',
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
