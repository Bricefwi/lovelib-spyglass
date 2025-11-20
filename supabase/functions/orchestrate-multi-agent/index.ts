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
        
        // Récupérer l'email de l'utilisateur
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, firstname')
          .eq('user_id', audit.created_by)
          .single();
        
        if (profile?.email) {
          // Envoyer l'email via Resend
          const resendApiKey = Deno.env.get('RESEND_API_KEY');
          
          if (resendApiKey) {
            try {
              const emailHtml = `
                <h1>Bonjour ${profile.firstname || 'cher utilisateur'},</h1>
                <p>Votre <strong>Audit Stratégique</strong> est prêt ! 🎉</p>
                <p><strong>Résumé:</strong> ${mockReport.executive_summary}</p>
                <p><strong>Scores:</strong></p>
                <ul>
                  <li>Market: ${mockReport.scores.market}/100</li>
                  <li>Tech: ${mockReport.scores.tech}/100</li>
                </ul>
                <p>Consultez votre dashboard pour voir le rapport complet.</p>
                <p><em>Ceci est un email de test en mode Turbo.</em></p>
              `;
              
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'IMOTION Audit <onboarding@resend.dev>',
                  to: ['patrice.simion@gmail.com'],
                  subject: `Rapport Audit (REDIRECTION TEST) : ${profile.firstname || 'Client'} ${audit.company_guess || ''}`,
                  html: emailHtml,
                }),
              });
              
              const emailResult = await emailResponse.json();
              console.log('✅ Email sent:', emailResult);
            } catch (emailError) {
              console.error('❌ Email error:', emailError);
              // Ne pas bloquer l'audit si l'email échoue
            }
          } else {
            console.warn('⚠️ RESEND_API_KEY not configured, skipping email');
          }
        }
        
        responsePayload = { message: "Audit Completed (Turbo Mode)", report: mockReport };
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
