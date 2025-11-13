/**
 * Supabase Edge Function: manus-callback (Version Corrigée)
 * 
 * Reçoit les résultats du backend MANUS IA Railway et :
 * 1. Met à jour l'orchestration dans la BDD
 * 2. Sauvegarde le rapport brut
 * 3. Génère le HTML professionnel avec le template IMOTION
 * 
 * Changements vs n8n-callback:
 * - ✅ Renommage n8n → manus
 * - ✅ Ajout génération HTML professionnel
 * - ✅ Meilleure validation des données
 * - ✅ Logs plus clairs
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validation pour le callback MANUS IA
const callbackSchema = z.object({
  orchestrationId: z.string().uuid({ message: "Invalid orchestration ID" }),
  preAuditId: z.string().uuid({ message: "Invalid pre-audit ID" }),
  status: z.enum(['completed', 'failed', 'error']),
  progress: z.number().min(0).max(100).default(100),
  current_phase: z.string().optional(),
  results: z.object({
    company_name: z.string().optional(),
    report: z.object({
      html: z.string().optional(),
      markdown: z.string(),
      confidence_score: z.number().min(0).max(1).default(0.85),
    }),
    metadata: z.object({
      execution_time: z.number().optional(),
      agents_used: z.array(z.string()).optional(),
      quality_score: z.number().optional(),
    }).optional(),
    phases: z.record(z.any()).optional(),
  }).optional(),
  error: z.string().optional(),
});

/**
 * Génère le HTML professionnel avec la charte IMOTION
 */
function generateProfessionalHTML(data: {
  company: { name: string; url?: string };
  content: string;
  confidence_score: number;
  generated_at: string;
}): string {
  const { company, content, confidence_score, generated_at } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Digital - ${company.name} | IMOTION</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      text-align: center;
      padding: 60px 40px 40px;
      position: relative;
    }

    .logo {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }

    .title {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 15px;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 20px;
      font-weight: 500;
      opacity: 0.9;
      margin-bottom: 25px;
    }

    .company-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .confidence-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 8px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    /* Content */
    .content {
      padding: 40px;
    }

    .section {
      margin-bottom: 40px;
      padding-bottom: 40px;
      border-bottom: 1px solid #e2e8f0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3b82f6;
    }

    .section-content {
      font-size: 16px;
      line-height: 1.8;
      color: #475569;
    }

    .section-content h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin: 20px 0 10px 0;
    }

    .section-content h4 {
      font-size: 18px;
      font-weight: 600;
      color: #334155;
      margin: 15px 0 8px 0;
    }

    .section-content ul {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }

    .section-content li {
      padding: 8px 0 8px 25px;
      position: relative;
      color: #475569;
    }

    .section-content li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: 700;
    }

    .section-content strong {
      color: #1e293b;
      font-weight: 600;
    }

    .section-content p {
      margin: 12px 0;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th {
      background: #f1f5f9;
      color: #1e3a8a;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #3b82f6;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #475569;
    }

    tr:hover {
      background: #f8fafc;
    }

    /* Highlight boxes */
    .highlight-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }

    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }

    .success-box {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }

    /* Footer */
    .footer {
      background: #f1f5f9;
      padding: 30px 40px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }

    .footer-logo {
      font-size: 24px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 10px;
    }

    /* Print */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
      .confidence-badge {
        position: static;
        display: block;
        margin: 20px auto;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header {
        padding: 40px 20px 30px;
      }
      .title {
        font-size: 28px;
      }
      .subtitle {
        font-size: 16px;
      }
      .content {
        padding: 30px 20px;
      }
      .section-title {
        font-size: 24px;
      }
      .confidence-badge {
        position: static;
        display: block;
        margin: 20px auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="confidence-badge">
      Confiance: ${Math.round(confidence_score * 100)}%
    </div>

    <div class="header">
      <div class="logo">IMOTION</div>
      <div class="title">Rapport d'Audit Digital</div>
      <div class="subtitle">Analyse approfondie par 17 agents IA spécialisés MANUS IA 2.0</div>
      <div class="company-badge">${company.name}</div>
      ${company.url ? `<div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">${company.url}</div>` : ''}
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <div class="footer-logo">IMOTION</div>
      <div>Rapport généré par MANUS IA 2.0 • ${new Date(generated_at).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</div>
      <div style="margin-top: 10px;">
        Ce rapport est confidentiel et destiné uniquement à ${company.name}
      </div>
      <div style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
        IMOTION Conseil • Expert en Transformation Digitale B2B
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    console.log("=== MANUS IA Callback Received ===");
    console.log("Body:", JSON.stringify(body, null, 2));
    
    // Validate input
    const validation = callbackSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Invalid input: " + validation.error.errors[0].message 
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { orchestrationId, preAuditId, status, progress, current_phase, results, error } = validation.data;
    
    console.log(`✅ Callback validated for orchestration: ${orchestrationId}`);
    console.log(`Status: ${status}, Progress: ${progress}%`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Mettre à jour l'orchestration
    const updateData: any = {
      status: status === 'completed' ? 'completed' : 'error',
      progress,
      current_phase,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (results) {
        updateData.results = {
          phases: results.phases || {},
          metadata: results.metadata || {},
        };
      }
    }

    if (error) {
      updateData.error = error;
    }

    const { data: orchestration, error: orchError } = await supabase
      .from('agent_orchestrations')
      .update(updateData)
      .eq('id', orchestrationId)
      .select()
      .single();

    if (orchError) {
      console.error('❌ Error updating orchestration:', orchError);
      throw orchError;
    }

    console.log('✅ Orchestration updated:', orchestration.id);

    // 2. Si le rapport est disponible, le sauvegarder et générer le HTML professionnel
    if (status === 'completed' && results?.report) {
      console.log("📄 Generating professional HTML report...");

      // Récupérer les infos du pre_audit pour le nom de l'entreprise
      const { data: preAudit } = await supabase
        .from('pre_audits')
        .select('url, company_guess')
        .eq('id', preAuditId)
        .single();

      const companyName = results.company_name || preAudit?.company_guess || "Entreprise";
      const companyUrl = preAudit?.url || "";

      // Générer le HTML professionnel
      const professionalHTML = generateProfessionalHTML({
        company: {
          name: companyName,
          url: companyUrl,
        },
        content: results.report.markdown || results.report.html || "Contenu non disponible",
        confidence_score: results.report.confidence_score,
        generated_at: new Date().toISOString(),
      });

      // Sauvegarder le rapport avec le HTML professionnel
      const { data: report, error: reportError } = await supabase
        .from('audit_reports')
        .insert({
          pre_audit_id: preAuditId,
          report_type: 'deep_audit',
          status: 'completed',
          html: professionalHTML,
          markdown: results.report.markdown,
          confidence_score: results.report.confidence_score,
          metadata: results.metadata,
        })
        .select()
        .single();

      if (reportError) {
        console.error('❌ Error creating report:', reportError);
        throw reportError;
      }

      console.log('✅ Professional HTML report generated:', report.id);

      return new Response(
        JSON.stringify({
          success: true,
          orchestrationId: orchestrationId,
          reportId: report.id,
          message: 'Callback received, orchestration updated, and professional report generated'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // 3. Si erreur ou pas de rapport
    return new Response(
      JSON.stringify({
        success: status === 'completed',
        orchestrationId: orchestrationId,
        message: status === 'completed' 
          ? 'Callback received and orchestration updated' 
          : 'Orchestration failed: ' + (error || 'Unknown error')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error in manus-callback:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
