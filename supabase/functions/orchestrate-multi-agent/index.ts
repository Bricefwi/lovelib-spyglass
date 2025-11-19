/**
 * Supabase Edge Function: orchestrate-multi-agent
 * Router pour orchestrer les 17 agents IA du système MANUS IA 2.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation du payload d'entrée
const orchestrationSchema = z.object({
  audit_id: z.string().uuid({ message: "audit_id must be a valid UUID" }),
  action: z.enum(['start', 'continue', 'retry', 'cancel']).optional().default('start'),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== MANUS IA 2.0 Orchestrator ===");
    
    // Parse et valide le body
    const body = await req.json();
    const validation = orchestrationSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request", 
          details: validation.error.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { audit_id, action } = validation.data;
    console.log(`Orchestration request - Audit: ${audit_id}, Action: ${action}`);

    // Initialise le client Supabase (Service Role pour bypass RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Récupère l'audit depuis la base
    const { data: audit, error: auditError } = await supabase
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .maybeSingle();

    if (auditError || !audit) {
      console.error("Audit not found:", auditError);
      return new Response(
        JSON.stringify({ error: "Audit not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Audit found: ${audit.url} - Status: ${audit.status}`);

    // Pour l'instant, router factice qui retourne un succès
    // Dans une version complète, ici on appellerait les 17 agents via MANUS IA
    
    const orchestrationResult = {
      status: "Orchestrator ready",
      audit_id: audit_id,
      current_phase: audit.current_phase || "PHASE_0_INIT",
      next_phase: "PHASE_1",
      action_requested: action,
      timestamp: new Date().toISOString(),
      message: "MANUS IA 2.0 orchestration system initialized. Ready to route to 17 specialized agents.",
    };

    // Met à jour le statut de l'audit
    const { error: updateError } = await supabase
      .from('pre_audits')
      .update({
        status: 'running',
        current_phase: 'PHASE_1',
        updated_at: new Date().toISOString(),
      })
      .eq('id', audit_id);

    if (updateError) {
      console.error("Error updating audit status:", updateError);
    } else {
      console.log("Audit status updated to 'running'");
    }

    return new Response(
      JSON.stringify(orchestrationResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Orchestration error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
