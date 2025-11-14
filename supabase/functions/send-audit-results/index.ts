import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const sendAuditSchema = z.object({
  reportId: z.string().uuid(),
  recipientEmail: z.string().email().optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = sendAuditSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: validation.error.format() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reportId, recipientEmail } = validation.data;
    
    // Default email to patrice.simion@imotion.fr if not provided
    const targetEmail = recipientEmail || "patrice.simion@imotion.fr";

    console.log(`Sending audit report ${reportId} to ${targetEmail}`);

    // Utiliser ANON_KEY
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Récupérer le rapport HTML et les infos du pre_audit
    const { data: report, error: reportError } = await supabase
      .from('audit_reports')
      .select(`
        html,
        pre_audit_id,
        pre_audits!inner(url)
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Report not found:', reportError);
      return new Response(
        JSON.stringify({ error: 'Rapport non trouvé' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!report.html) {
      console.error('No HTML content in report');
      return new Response(
        JSON.stringify({ error: 'Rapport sans contenu HTML' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const website = (report.pre_audits as any)?.url || 'votre site';
    const subject = `🎯 Votre Pré-Audit Digital IMOTION - ${website}`;
    
    console.log('HTML report fetched successfully');

    // Envoyer l'email avec le rapport HTML complet
    const emailResponse = await resend.emails.send({
      from: "IMOTION <noreply@imotion.tech>",
      to: [targetEmail],
      subject: subject,
      html: report.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      sentTo: targetEmail 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
