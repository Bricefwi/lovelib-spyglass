import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function logStep(
  supabase: any,
  preAuditId: string,
  step: string,
  status: "queued" | "running" | "done" | "error",
  message?: string
) {
  await supabase.from("audit_steps").insert({
    pre_audit_id: preAuditId,
    step,
    status,
    message,
    started_at: new Date().toISOString(),
    ended_at: status === "done" || status === "error" ? new Date().toISOString() : null,
  });
}

async function updatePreAuditStatus(
  supabase: any,
  preAuditId: string,
  status: string,
  lastStep?: string
) {
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (lastStep) updates.last_step = lastStep;

  await supabase.from("pre_audits").update(updates).eq("id", preAuditId);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get auth header for JWT verification (function now requires JWT)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const preAuditId = url.searchParams.get("pre_audit_id");

    if (!preAuditId) {
      return new Response(
        JSON.stringify({ error: "pre_audit_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Récupérer le pré-audit
    const { data: preAudit, error: fetchError } = await supabase
      .from("pre_audits")
      .select("*")
      .eq("id", preAuditId)
      .single();

    if (fetchError || !preAudit) {
      return new Response(
        JSON.stringify({ error: "Pre-audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await logStep(supabase, preAuditId, "Forcer consolidation", "running");
    await updatePreAuditStatus(supabase, preAuditId, "consolidating", "Consolidation forcée");

    // Récupérer toutes les sources
    const { data: sources } = await supabase
      .from("audit_sources")
      .select("*")
      .eq("pre_audit_id", preAuditId);

    // Calculer la confiance moyenne
    let totalReliability = 0;
    let sourceCount = 0;

    if (sources && sources.length > 0) {
      sources.forEach((source: any) => {
        if (source.reliability) {
          totalReliability += source.reliability;
          sourceCount++;
        }
      });
    }

    const averageConfidence = sourceCount > 0 ? totalReliability / sourceCount : 0.5;

    // Mettre à jour le pré-audit
    const consolidatedData = {
      sources: sources || [],
      consolidatedAt: new Date().toISOString(),
      sourceCount: sources?.length || 0,
      averageReliability: averageConfidence,
    };

    await supabase
      .from("pre_audits")
      .update({
        status: "consolidated",
        confidence: averageConfidence,
        consolidated: consolidatedData,
        last_step: "Consolidation terminée",
        updated_at: new Date().toISOString(),
      })
      .eq("id", preAuditId);

    await logStep(
      supabase,
      preAuditId,
      "Forcer consolidation",
      "done",
      `${sources?.length || 0} sources consolidées, confiance: ${Math.round(averageConfidence * 100)}%`
    );

    return new Response(
      JSON.stringify({
        success: true,
        pre_audit_id: preAuditId,
        status: "consolidated",
        confidence: averageConfidence,
        sources_count: sources?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in consolidate:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
