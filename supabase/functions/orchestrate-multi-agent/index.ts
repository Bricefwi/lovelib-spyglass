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
    // 🔒 SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create authenticated Supabase client to verify user
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    const body = await req.json();
    const { audit_id, action } = body;
    console.log(`🤖 ORCHESTRATOR HIT - ID: ${audit_id}, User: ${user.id}`);

    // Init Supabase with service role for privileged operations
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

    // 🔒 SECURITY: Verify audit ownership
    if (audit.created_by !== user.id) {
      console.error(`❌ Unauthorized: User ${user.id} attempted to access audit ${audit_id} owned by ${audit.created_by}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this audit' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Ownership verified: User ${user.id} owns audit ${audit_id}`);

    // Logic
    let updates = {};
    let responsePayload = {};

    // Simple State Machine for Phase 0 -> 1 -> Completed (Turbo Mode)
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
    } else if (audit.current_phase === 'PHASE_1_MARKET_STUDY') {
        console.log("⚡ TURBO MODE: Completing Phase 1");
        
        // Simuler une attente de 2 secondes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Générer un rapport mockup
        const mockReport = {
          executive_summary: "Audit Stratégique réalisé avec succès.",
          scores: { market: 85, tech: 92 },
          recommendations: [
            "Optimiser la présence digitale",
            "Renforcer la stratégie SEO",
            "Développer l'approche multi-canal"
          ],
          generated_at: new Date().toISOString()
        };
        
        updates = {
          status: 'completed',
          current_phase: 'PHASE_4_SYNTHESIS',
          consolidated: mockReport,
          audit_logs: [
            ...(audit.audit_logs || []),
            { agent: 'A02', message: 'Market analysis completed', timestamp: new Date().toISOString() },
            { agent: 'A03', message: 'PESTEL analysis completed', timestamp: new Date().toISOString() },
            { agent: 'A04', message: 'Synthesis generated', timestamp: new Date().toISOString(), status: 'completed' }
          ]
        };
        
        // 📧 DEBUG EMAIL - Envoi avec traces complètes
        console.log("📧 DEBUT ENVOI EMAIL DEBUG...");
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        
        if (!resendApiKey) {
          throw new Error("Configuration Error: RESEND_API_KEY is missing");
        }
        
        // Payload email simplifié (hardcodé pour test)
        const emailPayload = {
          from: 'onboarding@resend.dev', 
          to: ['patrice.simion@gmail.com'],
          subject: `Rapport Audit Debug [${new Date().toLocaleTimeString()}]`,
          html: `<p>Ceci est un test de débogage. Si vous lisez ceci, le pipeline fonctionne.</p>`
        };

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });

        const resendData = await resendRes.text(); 
        console.log(`📧 Resend Status: ${resendRes.status}`);
        console.log(`📧 Resend Body: ${resendData}`);

        if (!resendRes.ok) {
          throw new Error(`Resend API Failed (${resendRes.status}): ${resendData}`);
        }
        
        responsePayload = { 
          message: "Audit Completed (Turbo Mode)", 
          report: mockReport,
          email_debug: { status: resendRes.status, body: resendData }
        };
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
