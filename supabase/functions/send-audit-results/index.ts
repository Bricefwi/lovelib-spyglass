import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditResultRequest {
  auditResultId: string;
  website: string;
  reportMarkdown: string;
  scores: any;
  reportId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditResultId, website, reportMarkdown, scores, reportId }: AuditResultRequest = await req.json();

    console.log(`Sending audit results for ${website} - ID: ${auditResultId}, Report ID: ${reportId}`);

    const subject = `🎯 Votre Pré-Audit Digital IMOTION - ${website}`;
    
    // Récupérer le rapport HTML depuis la base de données si un reportId est fourni
    let reportHtml = '';
    if (reportId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: report } = await supabase
        .from('audit_reports')
        .select('html')
        .eq('id', reportId)
        .single();

      if (report?.html) {
        reportHtml = report.html;
        console.log('HTML report fetched successfully');
      }
    }

    // Si on a un rapport HTML complet, l'utiliser directement pour l'email
    if (reportHtml) {
      const emailResponse = await resend.emails.send({
        from: "IMOTION Tests <onboarding@resend.dev>",
        to: ["patrice.simion@gmail.com"],
        subject: subject,
        html: reportHtml,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Sinon, utiliser l'ancien format avec Markdown (fallback)
    const scoresHtml = scores ? `
      <div class="score-card">
        <h3>📊 Scores de Maturité Digitale</h3>
        <div class="metric-row">
          <span>Maturité globale</span>
          <span class="score ${scores.maturite < 50 ? 'danger' : scores.maturite < 70 ? 'warning' : ''}">${scores.maturite || 'N/A'}/100</span>
        </div>
        <div class="metric-row">
          <span>Marketing digital</span>
          <span class="score ${scores.marketing < 50 ? 'danger' : scores.marketing < 70 ? 'warning' : ''}">${scores.marketing || 'N/A'}/100</span>
        </div>
        <div class="metric-row">
          <span>Performance Sales</span>
          <span class="score ${scores.sales < 50 ? 'danger' : scores.sales < 70 ? 'warning' : ''}">${scores.sales || 'N/A'}/100</span>
        </div>
        <div class="metric-row">
          <span>Exploitation Data</span>
          <span class="score ${scores.data < 50 ? 'danger' : scores.data < 70 ? 'warning' : ''}">${scores.data || 'N/A'}/100</span>
        </div>
        <div class="metric-row">
          <span>Intégration IA</span>
          <span class="score ${scores.ia < 50 ? 'danger' : scores.ia < 70 ? 'warning' : ''}">${scores.ia || 'N/A'}/100</span>
        </div>
        <div class="metric-row">
          <span>Stack Technique</span>
          <span class="score ${scores.tech < 50 ? 'danger' : scores.tech < 70 ? 'warning' : ''}">${scores.tech || 'N/A'}/100</span>
        </div>
      </div>
    ` : '';

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
          .container { max-width: 700px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 30px; }
          .score-card { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .metric-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
          .score { font-weight: bold; font-size: 18px; color: #667eea; }
          .score.warning { color: #f59e0b; }
          .score.danger { color: #ef4444; }
          .cta { background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .report-section { background: white; padding: 20px; margin: 15px 0; border: 1px solid #e5e7eb; border-radius: 6px; }
          .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; background: #f9fafb; }
          pre { background: #1f2937; color: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Votre Pré-Audit Digital Personnalisé</h1>
            <p style="font-size: 18px; margin-top: 10px;">Analyse IA complète de ${website}</p>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            <p>Votre pré-audit digital généré par notre IA est maintenant disponible. Voici une synthèse des résultats détectés automatiquement :</p>
            
            ${scoresHtml}

            <div class="report-section">
              <h3>📄 Rapport Complet (Markdown)</h3>
              <p>Consultez le rapport détaillé ci-dessous avec les scénarios d'optimisation et la roadmap recommandée :</p>
              <pre>${reportMarkdown}</pre>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://imotion.tech/contact" class="cta">📞 Discuter de ces résultats</a>
              <p style="margin-top: 15px; color: #6b7280;">Échangeons sur les opportunités prioritaires pour votre entreprise</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>IMOTION</strong> - Transformation Digitale Pilotée par l'IA</p>
            <p>📧 contact@imotion.tech | 🌐 imotion.tech</p>
            <p style="font-size: 12px; margin-top: 15px;">
              Ce pré-audit est généré automatiquement par IA. Pour un audit personnalisé avec recommandations sur-mesure, contactez notre équipe.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "IMOTION Tests <onboarding@resend.dev>",
      to: ["patrice.simion@gmail.com"],
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-audit-results function:", error);
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
