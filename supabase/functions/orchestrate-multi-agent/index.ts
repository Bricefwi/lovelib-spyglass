import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { audit_id, action } = body;
    console.log(`🤖 ORCHESTRATOR HIT - ID: ${audit_id}`);

    // Init Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch Audit
    const { data: audit, error: fetchError } = await supabase
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .single();

    if (fetchError || !audit) {
      console.error("❌ Audit fetch error:", fetchError);
      throw new Error("Impossible de trouver l'audit ou erreur DB");
    }

    // Logic
    let updates = {};
    let responsePayload = {};

    // Simple State Machine for Phase 0 -> 1
    if (audit.current_phase === 'PHASE_0_INIT' || !audit.current_phase) {
        console.log("🚀 Triggering Phase 1");
        updates = {
          status: 'running',
          current_phase: 'PHASE_1_MARKET_STUDY',
          audit_logs: [
             { agent: 'A01', message: 'Starting Market Analysis', timestamp: new Date().toISOString() }
          ]
        };
        responsePayload = { message: "Phase 1 Started", active_agents: ["A02", "A03"] };
    } else {
        responsePayload = { message: "Already running", phase: audit.current_phase };
    }

    // Update DB
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('pre_audits')
        .update(updates)
        .eq('id', audit_id);
      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, data: responsePayload }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error), details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
