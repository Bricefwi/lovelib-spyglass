import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { audit_id, action } = await req.json();
    console.log(`🤖 MANUS IA ORCHESTRATOR - Audit: ${audit_id} | Action: ${action}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: audit, error: fetchError } = await supabase
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .single();

    if (fetchError || !audit) throw new Error("Audit introuvable");

    let updates = {};
    let responsePayload = {};

    switch (audit.current_phase) {
      case 'PHASE_0_INIT':
        console.log("🚀 Starting Phase 1: Market Study Initialization");
        
        const initialReportStructure = {
          meta: { started_at: new Date().toISOString() },
          facts: [], hypotheses: [], recommendations: []
        };

        const newLogs = [
          { agent: 'A01_ORCHESTRATOR', message: 'Triggering Market Agents.', timestamp: new Date().toISOString() },
          { agent: 'A02_SCRAPER', status: 'pending', target: audit.target_url || "URL missing" },
          { agent: 'A03_PESTEL', status: 'pending' },
          { agent: 'A04_PORTER', status: 'pending' }
        ];

        updates = {
          status: 'running',
          current_phase: 'PHASE_1_MARKET_STUDY',
          consolidated_report: initialReportStructure,
          audit_logs: newLogs
        };

        responsePayload = {
          message: "Phase 1 Initiated",
          active_agents: ["A02", "A03", "A04"]
        };
        break;

      case 'PHASE_1_MARKET_STUDY':
        responsePayload = { message: "Phase 1 in progress", progress: "33%" };
        break;

      default:
        responsePayload = { message: "Phase unknown", phase: audit.current_phase };
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('pre_audits').update(updates).eq('id', audit_id);
    }

    return new Response(
      JSON.stringify({ success: true, data: responsePayload }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
