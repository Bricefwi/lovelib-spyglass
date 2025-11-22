import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupérer l'email de l'utilisateur depuis le body
    const { userEmail } = await req.json();
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "Email utilisateur requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🚀 Envoi des rapports de test à ${userEmail}`);

    // Récupérer tous les rapports de l'utilisateur
    const { data: reports, error: reportsError } = await supabase
      .from('audit_reports')
      .select(`
        id,
        title,
        report_type,
        pre_audits!inner(
          company_siret,
          company_guess
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (reportsError || !reports || reports.length === 0) {
      console.error('Erreur récupération rapports:', reportsError);
      return new Response(
        JSON.stringify({ error: 'Aucun rapport trouvé' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 ${reports.length} rapports trouvés`);

    const results = [];

    // Envoyer chaque rapport
    for (const report of reports) {
      console.log(`📧 Envoi du rapport: ${report.title}`);
      
      try {
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-audit-results`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              reportId: report.id,
              recipientEmail: userEmail,
              auditType: report.report_type || 'standard',
            }),
          }
        );

        const result = await response.json();
        
        results.push({
          reportId: report.id,
          title: report.title,
          success: response.ok,
          result,
        });

        console.log(`✅ Email envoyé pour ${report.title}`);
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Erreur inconnue';
        console.error(`❌ Erreur envoi ${report.title}:`, emailError);
        results.push({
          reportId: report.id,
          title: report.title,
          success: false,
          error: errorMessage,
        });
      }

      // Petit délai entre les envois
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(JSON.stringify({ 
      success: true,
      recipientEmail: userEmail,
      reportsSent: results.filter(r => r.success).length,
      totalReports: results.length,
      details: results,
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erreur globale:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur inconnue" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
