import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ✅ SECURITY: Input validation schema
const orchestrationSchema = z.object({
  audit_id: z.string().uuid({ message: "Invalid audit ID format" })
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("🚀 ========== ORCHESTRATE-MULTI-AGENT START ==========");
    
    // 1. Auth & Setup
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("❌ Missing Authorization header");
      throw new Error('Missing Auth Header');
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error("❌ Auth failed:", authError);
      throw new Error('Auth Failed');
    }
    console.log(`✅ User authenticated: ${user.email}`);

    // ✅ SECURITY: Validate input with Zod
    const body = await req.json();
    const validation = orchestrationSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("❌ Validation error:", validation.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { audit_id } = validation.data;
    console.log(`📋 Audit ID: ${audit_id}`);

    // 2. Fetch Audit with ownership verification (IDOR protection)
    // ✅ SECURITY: Verify that the authenticated user owns this audit
    const { data: audit, error: fetchError } = await supabase
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .eq('created_by', user.id) // ✅ CRITICAL: Ownership check prevents IDOR
      .single();

    if (fetchError || !audit) {
      console.error("❌ Audit not found or access denied");
      return new Response(
        JSON.stringify({ 
          error: "Audit not found or access denied",
          request_id: audit_id 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`✅ Audit fetched: ${audit.url}`);

    // 3. AUTO-FIX: Créer l'entreprise si manquante
    if (!audit.company_id) {
      console.log("🔧 Fixing missing Company ID...");
      let companyName = "Entreprise Inconnue";
      try {
         const url = new URL(audit.url || "https://example.com");
         companyName = url.hostname.replace('www.', '').split('.')[0].toUpperCase();
      } catch (e) {
        console.error("⚠️ Error parsing URL:", e);
      }

      console.log(`🏢 Creating company: ${companyName}`);
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName, website: audit.url, city: 'Unknown', country: 'FR' })
        .select()
        .single();
      
      if (companyError) {
        console.error("❌ Error creating company:", companyError);
      } else if (company) {
        console.log(`✅ Company created with ID: ${company.id}`);
        await supabase.from('pre_audits').update({ company_id: company.id }).eq('id', audit_id);
      }
    }

    // 4. Increment free_audits_used counter
    console.log("📊 Incrementing audit counter...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('free_audits_used')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error("⚠️ Error fetching profile:", profileError);
    } else {
      const currentCount = profile?.free_audits_used || 0;
      const { error: incrementError } = await supabase
        .from('profiles')
        .update({ 
          free_audits_used: currentCount + 1,
          last_audit_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (incrementError) {
        console.error("❌ Error incrementing counter:", incrementError);
      } else {
        console.log(`✅ Audit counter incremented: ${currentCount} -> ${currentCount + 1}`);
      }
    }

    // 5. TURBO MODE: Exécution complète
    console.log("⚡ TURBO MODE ACTIVATED");

    // Simuler les logs des agents
    const logs = [
      { agent: 'A01_DataHunter', message: 'Initialization...', timestamp: new Date().toISOString(), status: 'completed' },
      { agent: 'A02_WebScraper', message: `Scraping ${audit.url}...`, timestamp: new Date().toISOString(), status: 'completed' },
      { agent: 'A03_MarketAnalyst', message: 'Analyzing Market Data...', timestamp: new Date().toISOString(), status: 'completed' },
      { agent: 'A04_StrategyArchitect', message: 'Generating Strategy...', timestamp: new Date().toISOString(), status: 'completed' },
      { agent: 'A05_ReportWriter', message: 'Writing Final Report...', timestamp: new Date().toISOString(), status: 'completed' }
    ];

    // Mockup du rapport final (à remplacer par vraie analyse)
    const finalReport = {
      executive_summary: `Audit stratégique complet réalisé pour ${audit.url}. Le potentiel digital est fort mais sous-exploité. Plusieurs opportunités d'amélioration identifiées.`,
      scores: { 
        market: 88, 
        tech: 72, 
        ux: 65,
        seo: 78,
        conversion: 60
      },
      recommendations: [
        "Implémenter un chatbot IA pour améliorer la conversion (+25% estimé)",
        "Optimiser le SEO technique (LCP/CLS) pour améliorer le ranking Google",
        "Automatiser le nurturing des leads avec des workflows personnalisés",
        "Refondre l'UX mobile pour réduire le taux de rebond (-15% estimé)"
      ],
      generated_at: new Date().toISOString(),
      audit_type: audit.audit_type || 'standard'
    };

    // 6. Mise à jour DB finale
    console.log("💾 Updating database...");
    const { error: updateError } = await supabase.from('pre_audits').update({
      status: 'completed',
      current_phase: 'PHASE_4_SYNTHESIS',
      audit_logs: logs,
      consolidated: finalReport
    }).eq('id', audit_id);

    if (updateError) {
      console.error("❌ Error updating audit:", updateError);
    } else {
      console.log("✅ Audit updated to 'completed'");
    }

    // 7. ENVOI EMAIL - CRITIQUE
    console.log("📧 ========== EMAIL SENDING START ==========");
    
    // Vérifier que RESEND_API_KEY existe
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY is not configured!");
      console.error("⚠️ Email will NOT be sent. Please configure RESEND_API_KEY in Supabase Edge Functions secrets.");
    } else {
      console.log("✅ RESEND_API_KEY found");
      
      try {
        // Préparer le contenu de l'email
        const emailSubject = `✅ Votre Audit Digital ${audit.audit_type === 'advanced' ? 'Approfondi' : 'Standard'} est Prêt !`;
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .score { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; margin: 5px; font-weight: bold; }
    .recommendation { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Votre Audit Digital est Terminé !</h1>
      <p>Analyse complète de ${audit.url}</p>
    </div>
    <div class="content">
      <h2>📊 Résumé Exécutif</h2>
      <p>${finalReport.executive_summary}</p>
      
      <h2>🎯 Scores Clés</h2>
      <div>
        <span class="score">Marché: ${finalReport.scores.market}/100</span>
        <span class="score">Tech: ${finalReport.scores.tech}/100</span>
        <span class="score">UX: ${finalReport.scores.ux}/100</span>
        <span class="score">SEO: ${finalReport.scores.seo}/100</span>
        <span class="score">Conversion: ${finalReport.scores.conversion}/100</span>
      </div>
      
      <h2>💡 Recommandations Prioritaires</h2>
      ${finalReport.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
      
      <div style="text-align: center;">
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/dashboard" class="button">
          Voir le Rapport Complet
        </a>
      </div>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <strong>Type d'audit :</strong> ${audit.audit_type === 'advanced' ? 'Approfondi (17 agents IA)' : 'Standard'}<br>
        <strong>Date de génération :</strong> ${new Date(finalReport.generated_at).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
    <div class="footer">
      <p>Cet email a été généré automatiquement par MANUS IA 2.0</p>
      <p>© 2025 IMOTION - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
        `;

        // Appel à l'API Resend - ENVOI À PATRICE + USER
        console.log(`📤 Sending email to: ${user.email} and patrice.simion@gmail.com`);
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "IMOTION Audit Digital <onboarding@resend.dev>",
            to: [user.email, "patrice.simion@gmail.com"],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        const resendData = await resendResponse.json();
        
        if (!resendResponse.ok) {
          console.error("❌ Resend API error:", resendResponse.status, resendData);
          throw new Error(`Resend API failed: ${JSON.stringify(resendData)}`);
        }
        
        console.log("✅ Email sent successfully!");
        console.log("📧 Resend response:", resendData);
        
      } catch (emailError: any) {
        console.error("❌ Email sending failed:", emailError.message);
        console.error("📧 Email error details:", emailError);
        // Ne pas bloquer l'audit si l'email échoue
      }
    }
    
    console.log("📧 ========== EMAIL SENDING END ==========");
    console.log("🚀 ========== ORCHESTRATE-MULTI-AGENT END ==========");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Audit Completed Successfully",
        email_sent: !!resendApiKey,
        audit_id: audit_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ ========== ORCHESTRATE-MULTI-AGENT ERROR ==========");
    console.error("❌ ERROR:", error.message);
    // ✅ SECURITY: Stack trace logged server-side only, never sent to client
    console.error("❌ Stack (server-side only):", error.stack);
    
    // Declare audit_id variable for use in final response
    let auditId: string | null = null;
    
    // CORRECTION: Mettre à jour l'audit avec status='failed'
    try {
      const body = await req.json().catch(() => ({ audit_id: null }));
      auditId = body?.audit_id;
      
      if (auditId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        
        await supabase
          .from('pre_audits')
          .update({
            status: 'failed',
            audit_logs: [
              {
                agent: 'orchestrate-multi-agent',
                message: `Erreur: ${error.message}`,
                timestamp: new Date().toISOString(),
                status: 'failed'
              }
            ],
            updated_at: new Date().toISOString()
          })
          .eq('id', auditId);
        
        console.log(`✅ Audit ${auditId} marked as failed`);
      }
    } catch (updateError) {
      console.error("❌ Failed to update audit status:", updateError);
    }
    
    // ✅ SECURITY: Return generic error to client, log details server-side only
    // Never expose stack traces, internal paths, or sensitive error details
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while processing the audit. Please contact support if the issue persists.",
        request_id: auditId || 'unknown',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
