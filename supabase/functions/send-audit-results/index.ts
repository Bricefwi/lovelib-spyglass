import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configuration IMOTION
const IMOTION_BRAND = {
  colors: {
    primary: '#E30613',
    primaryLight: '#ff4d54',
  },
  company: {
    website: 'https://imotion.fr',
    email: 'contact@imotion.fr',
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema - Support tous les tiers
const sendAuditSchema = z.object({
  reportId: z.string().uuid(),
  recipientEmail: z.string().email().optional(),
  auditType: z.enum(['standard', 'premium', 'discovery', 'pro', 'agency', 'enterprise']).optional(),
  subject: z.string().optional(),
});

// Mapping des types vers labels
const TIER_LABELS: Record<string, { label: string; isPremium: boolean }> = {
  'standard': { label: 'Pré-Audit Digital', isPremium: false },
  'discovery': { label: 'Diagnostic Express', isPremium: false },
  'pro': { label: 'Audit Professionnel', isPremium: true },
  'agency': { label: 'Audit Ultra-Premium', isPremium: true },
  'enterprise': { label: 'Expertise Enterprise', isPremium: true },
  'premium': { label: 'Audit Digital Approfondi', isPremium: true },
};

// Génère un email professionnel avec la charte IMOTION
function generateAuditEmailHTML(data: {
  auditType: string;
  websiteUrl: string;
  companyName?: string;
  reportUrl: string;
  recipientName?: string;
}): string {
  const { auditType, websiteUrl, companyName, reportUrl, recipientName } = data;
  const tierConfig = TIER_LABELS[auditType] || TIER_LABELS['standard'];
  const auditTypeLabel = tierConfig.label;
  const isPremium = tierConfig.isPremium;
  const greeting = recipientName ? `Bonjour ${recipientName}` : 'Bonjour';
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${auditTypeLabel} IMOTION</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                🎯 ${auditTypeLabel}
              </h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0; font-size: 16px;">
                ${companyName || websiteUrl}
              </p>
              <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; margin-top: 12px; color: white; text-transform: uppercase;">
                ${auditType.toUpperCase()}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">${greeting},</p>
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Nous avons finalisé votre <strong>${auditTypeLabel}</strong> pour <strong>${websiteUrl}</strong>.
              </p>
              ${isPremium ? `
              <div style="background-color: #fafafa; border-left: 4px solid ${IMOTION_BRAND.colors.primary}; padding: 20px; margin: 30px 0;">
                <h3 style="color: ${IMOTION_BRAND.colors.primary}; margin: 0 0 15px; font-size: 18px; font-weight: 600;">
                  📊 Votre audit ${auditType === 'agency' ? 'Ultra-Premium' : 'Professionnel'} comprend :
                </h3>
                <ul style="color: #1a1a1a; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Analyse SWOT détaillée</strong> de votre positionnement digital</li>
                  <li><strong>Scores de maturité</strong> par domaine (Marketing, Tech, UX, SEO)</li>
                  ${auditType === 'agency' || auditType === 'enterprise' ? `
                  <li><strong>Étude de marché</strong> avec données TAM/SAM et analyse PESTEL</li>
                  <li><strong>Benchmark concurrentiel</strong> détaillé</li>
                  ` : ''}
                  <li><strong>Roadmap stratégique</strong> personnalisée</li>
                  <li><strong>Scénarios d'évolution</strong> avec ROI estimé</li>
                  <li><strong>Plan d'action</strong> priorisé</li>
                </ul>
              </div>
              ` : `
              <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;">
                <h3 style="color: #f57c00; margin: 0 0 10px; font-size: 16px; font-weight: 600;">
                  💡 Version Découverte
                </h3>
                <p style="color: #1a1a1a; font-size: 14px; margin: 0;">
                  Ce diagnostic gratuit identifie vos principaux axes d'amélioration. Pour une analyse complète avec étude de marché et plan d'action détaillé, passez au niveau Pro !
                </p>
              </div>
              `}
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 30px 0 20px;">
                Cliquez sur le bouton ci-dessous pour consulter votre rapport complet :
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(227, 6, 19, 0.3);">
                      📄 Consulter mon ${auditTypeLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
                Cordialement,<br/>
                <strong style="color: ${IMOTION_BRAND.colors.primary};">L'équipe IMOTION</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 15px; font-weight: 600;">IMOTION - AI No-Code Solutions</p>
              <p style="color: #999999; font-size: 13px; margin: 0 0 5px;">
                ${IMOTION_BRAND.company.website} • ${IMOTION_BRAND.company.email}
              </p>
              <p style="color: #666666; font-size: 12px; margin: 15px 0 0;">
                © ${new Date().getFullYear()} IMOTION. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

    const { reportId, recipientEmail, auditType = 'premium', subject: customSubject } = validation.data;
    
    // Default email to patrice.simion@imotion.fr if not provided
    const targetEmail = recipientEmail || "patrice.simion@imotion.fr";

    console.log(`📧 Sending audit report ${reportId} to ${targetEmail} (type: ${auditType})`);

    // Utiliser SERVICE_ROLE pour bypasser RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupérer les infos du rapport
    const { data: report, error: reportError } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle();

    if (reportError || !report) {
      console.error('Report not found:', reportError);
      return new Response(
        JSON.stringify({ error: 'Rapport non trouvé' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Essayer de récupérer les infos du pre_audit si disponible
    let website = 'votre site';
    let companyName = '';
    
    if (report.pre_audit_id) {
      const { data: preAudit } = await supabase
        .from('pre_audits')
        .select('url, company_guess')
        .eq('id', report.pre_audit_id)
        .maybeSingle();
      
      if (preAudit) {
        website = preAudit.url || website;
        companyName = preAudit.company_guess || '';
      }
    }
    
    // Fallback sur le titre du rapport
    if (!companyName && report.title) {
      companyName = report.title.replace(/\[TEST.*?\]\s*/g, '').trim();
    }
    
    // Construire l'URL du rapport
    const reportUrl = `https://7c6553ec-011c-44ef-a323-d4dbfc5215db.lovableproject.com/audit-report/${reportId}`;
    
    console.log('📄 Report URL:', reportUrl);
    console.log('🏢 Company:', companyName);

    // Générer l'email avec la charte IMOTION
    const emailHTML = generateAuditEmailHTML({
      auditType,
      websiteUrl: website,
      companyName,
      reportUrl,
    });

    const tierConfig = TIER_LABELS[auditType] || TIER_LABELS['standard'];
    const subject = customSubject || `🎯 Votre ${tierConfig.label} IMOTION - ${companyName || website}`;
    
    console.log('📨 Sending email with subject:', subject);

    // Envoyer l'email avec le template IMOTION
    const emailResponse = await resend.emails.send({
      from: "IMOTION Conseil <onboarding@resend.dev>",
      to: [targetEmail],
      subject: subject,
      html: emailHTML,
    });

    console.log("✅ Email sent successfully:", emailResponse);

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
    console.error("❌ Error sending email:", error);
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
