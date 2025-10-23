import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const preAuditId = url.searchParams.get("pre_audit_id");
    const auditResultId = url.searchParams.get("audit_result_id");

    if (!preAuditId && !auditResultId) {
      return new Response(
        JSON.stringify({ error: "pre_audit_id or audit_result_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let auditData;
    if (auditResultId) {
      const { data, error } = await supabase
        .from("audit_results")
        .select("report_md, pre_audit_id")
        .eq("id", auditResultId)
        .single();
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Audit result not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      auditData = data;
    } else {
      const { data, error } = await supabase
        .from("audit_results")
        .select("report_md, pre_audit_id")
        .eq("pre_audit_id", preAuditId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "No audit found for this pre_audit_id" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      auditData = data;
    }

    // Retourner le HTML du rapport
    return new Response(auditData.report_md, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    console.error("Error in audit-html:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
