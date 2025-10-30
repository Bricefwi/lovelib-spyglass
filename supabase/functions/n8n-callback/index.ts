import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallbackRequest {
  orchestrationId: string;
  preAuditId: string;
  status: string;
  results: {
    market_research?: any;
    conversational_audits?: any;
    specialized_analysis?: any;
    synthesis?: any;
    allAgentsResults?: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orchestrationId, preAuditId, status, results }: CallbackRequest = await req.json();
    
    console.log(`Received callback for orchestration: ${orchestrationId}`);
    console.log('Results:', JSON.stringify(results, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Mettre à jour l'orchestration avec le statut complété
    const { data: orchestration, error: orchError } = await supabase
      .from('agent_orchestrations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results: {
          phases: results,
          raw_data: results.allAgentsResults
        }
      })
      .eq('id', orchestrationId)
      .select()
      .single();

    if (orchError) {
      console.error('Error updating orchestration:', orchError);
      throw orchError;
    }

    console.log('Orchestration updated:', orchestration);

    // 2. Créer un rapport enrichi basé sur les résultats multi-agent
    const enrichedReport = {
      type: 'deep_audit',
      pre_audit_id: preAuditId,
      orchestration_id: orchestrationId,
      sections: {
        market_research: results.market_research || {},
        conversational_audits: results.conversational_audits || {},
        specialized_analysis: results.specialized_analysis || {},
        synthesis: results.synthesis || {}
      },
      generated_at: new Date().toISOString(),
      status: 'ready'
    };

    // 3. Mettre à jour ou créer le rapport dans Supabase
    const { data: report, error: reportError } = await supabase
      .from('audit_reports')
      .upsert({
        pre_audit_id: preAuditId,
        report_type: 'deep_audit',
        content: enrichedReport,
        status: 'completed'
      }, { onConflict: 'pre_audit_id' })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating/updating report:', reportError);
      throw reportError;
    }

    console.log('Report generated:', report.id);

    return new Response(
      JSON.stringify({
        success: true,
        orchestrationId: orchestrationId,
        reportId: report.id,
        message: 'Callback received and processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in n8n-callback:', error);
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
