import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface N8NCallbackPayload {
  orchestrationId: string;
  preAuditId: string;
  status: "completed" | "error";
  results?: {
    phases: any[];
    synthesis: any;
    confidence: number;
  };
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: N8NCallbackPayload = await req.json();
    console.log("N8N Callback received:", JSON.stringify(payload, null, 2));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Update orchestration status
    const { error: orchError } = await supabase
      .from('agent_orchestrations')
      .update({
        status: payload.status,
        completed_at: new Date().toISOString(),
        error: payload.error || null,
        progress: payload.status === 'completed' ? 100 : null,
      })
      .eq('id', payload.orchestrationId);

    if (orchError) {
      console.error("Error updating orchestration:", orchError);
      throw orchError;
    }

    if (payload.status === "completed" && payload.results) {
      console.log("Generating advanced audit report...");

      // Generate advanced HTML report using Claude
      const { data: reportData, error: reportError } = await supabase.functions.invoke('audit-html-advanced', {
        body: {
          pre_audit_id: payload.preAuditId,
          orchestration_id: payload.orchestrationId,
          results: payload.results
        }
      });

      if (reportError) {
        console.error("Error generating advanced report:", reportError);
        throw reportError;
      }

      console.log("Advanced report generated, sending email...");

      // Send email with advanced report
      const { error: emailError } = await supabase.functions.invoke('send-audit-results', {
        body: {
          auditResultId: payload.preAuditId,
          website: "Website", // Will be fetched from DB in the function
          reportMarkdown: "Advanced Report",
          scores: {},
          reportId: reportData.report_id
        }
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - report was generated successfully
      }

      console.log("Advanced audit workflow completed successfully");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Callback processed successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in n8n-callback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
