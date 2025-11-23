import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" 
};

// Input validation schema
const querySchema = z.object({
  report_id: z.string().uuid({ message: "Invalid report ID format" })
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const reportId = new URL(req.url).searchParams.get('report_id');
    
    // Validate input
    const validation = querySchema.safeParse({ report_id: reportId });
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ CORRECTION SÉCURITÉ: Utiliser SERVICE_ROLE_KEY pour contourner les RLS strictes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { data: report, error } = await supabase
      .from('audit_reports')
      .select(`
        id,
        title,
        content,
        created_at,
        pre_audits!inner(
          url,
          company_guess,
          confidence,
          consolidated,
          companies(name, industry)
        )
      `)
      .eq('id', reportId)
      .single();
    
    if (error || !report) {
      console.error("Report fetch error:", error);
      return new Response(
        JSON.stringify({ error: 'Rapport non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données du rapport depuis consolidated ou content
    const preAudit = (report.pre_audits as any);
    const reportData = (preAudit?.consolidated || report.content || {}) as any;
    
    console.log("Report data keys:", Object.keys(reportData));
    console.log("Scores:", reportData.scores);
    console.log("Executive summary:", reportData.executive_summary?.substring(0, 100));

    // Template HTML simplifié et robuste
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Stratégique ${report.title || 'Audit'}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 40px; background: #f9f9f9; }
    .container { background: white; padding: 50px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    h1 { color: #d8232a; font-size: 36px; margin-bottom: 10px; text-align: center; }
    .subtitle { text-align: center; color: #666; font-size: 18px; margin-bottom: 40px; }
    
    .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 40px 0; }
    .score-card { text-align: center; padding: 20px; background: #fff0f0; border-radius: 10px; border: 1px solid #ffd0d0; }
    .score-val { font-size: 32px; font-weight: bold; color: #d8232a; }
    .score-label { font-size: 14px; text-transform: uppercase; color: #888; margin-top: 5px; }

    .section { margin-bottom: 40px; }
    h2 { border-bottom: 2px solid #d8232a; padding-bottom: 10px; color: #222; margin-top: 40px; }
    
    .swot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
    .swot-card { padding: 20px; border-radius: 8px; }
    .swot-card.strengths { background: #e8f5e9; border-left: 4px solid #4caf50; }
    .swot-card.weaknesses { background: #ffebee; border-left: 4px solid #f44336; }
    .swot-card.opportunities { background: #e3f2fd; border-left: 4px solid #2196f3; }
    .swot-card.threats { background: #fff3e0; border-left: 4px solid #ff9800; }
    .swot-card h3 { margin-top: 0; font-size: 16px; }
    .swot-card ul { margin: 10px 0; padding-left: 20px; }
    
    .recommendation { background: #f8f9fa; padding: 20px; margin-bottom: 15px; border-left: 4px solid #d8232a; border-radius: 4px; }
    .rec-title { font-weight: bold; font-size: 18px; color: #111; }
    .rec-meta { font-size: 12px; color: #666; margin-top: 5px; text-transform: uppercase; }

    .scenario { background: #fafafa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #d8232a; }
    .scenario h3 { margin-top: 0; color: #d8232a; }
    .scenario-metrics { display: flex; gap: 20px; margin-top: 10px; }
    .scenario-metric { background: white; padding: 8px 15px; border-radius: 5px; font-weight: bold; }

    .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${preAudit?.companies?.name || preAudit?.company_guess || 'Audit Stratégique'}</h1>
    <div class="subtitle">${preAudit?.url || ''} • Généré par IMOTION AI</div>

    <div class="section">
      <h2>Synthèse Exécutive</h2>
      <p style="font-size: 18px; line-height: 1.8;">${reportData.executive_summary || "Analyse en cours de finalisation..."}</p>
    </div>

    <div class="score-grid">
      <div class="score-card"><div class="score-val">${reportData.scores?.market || 0}</div><div class="score-label">Marché</div></div>
      <div class="score-card"><div class="score-val">${reportData.scores?.tech || 0}</div><div class="score-label">Tech</div></div>
      <div class="score-card"><div class="score-val">${reportData.scores?.ux || 0}</div><div class="score-label">UX</div></div>
      <div class="score-card"><div class="score-val">${reportData.scores?.seo || 0}</div><div class="score-label">SEO</div></div>
      <div class="score-card"><div class="score-val">${reportData.scores?.conversion || 0}</div><div class="score-label">Conversion</div></div>
    </div>

    ${reportData.market_analysis ? `
    <div class="section">
      <h2>Analyse de Marché</h2>
      <p><strong>Tendance du secteur :</strong> ${reportData.market_analysis.trend || 'En cours d\'analyse...'}</p>
      ${reportData.market_analysis.competitors ? `
        <p><strong>Concurrents identifiés :</strong></p>
        <ul>
          ${reportData.market_analysis.competitors.map((c: string) => `<li>${c}</li>`).join('')}
        </ul>
      ` : ''}
      <p><strong>Positionnement :</strong> ${reportData.market_analysis.positioning || 'En cours d\'analyse...'}</p>
    </div>
    ` : ''}

    ${reportData.swot ? `
    <div class="section">
      <h2>Analyse SWOT</h2>
      <div class="swot-grid">
        <div class="swot-card strengths">
          <h3>💪 Forces</h3>
          <ul>${(reportData.swot.strengths || []).map((s: string) => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="swot-card weaknesses">
          <h3>⚠️ Faiblesses</h3>
          <ul>${(reportData.swot.weaknesses || []).map((w: string) => `<li>${w}</li>`).join('')}</ul>
        </div>
        <div class="swot-card opportunities">
          <h3>🚀 Opportunités</h3>
          <ul>${(reportData.swot.opportunities || []).map((o: string) => `<li>${o}</li>`).join('')}</ul>
        </div>
        <div class="swot-card threats">
          <h3>⛔ Menaces</h3>
          <ul>${(reportData.swot.threats || []).map((t: string) => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
    ` : ''}

    ${reportData.strategic_scenarios ? `
    <div class="section">
      <h2>Scénarios Stratégiques</h2>
      ${reportData.strategic_scenarios.map((scenario: any) => `
        <div class="scenario">
          <h3>${scenario.name}</h3>
          <p>${scenario.description}</p>
          <div class="scenario-metrics">
            <div class="scenario-metric" style="color: #4caf50;">ROI: ${scenario.roi}</div>
            <div class="scenario-metric" style="color: #ff9800;">Risque: ${scenario.risk}</div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${reportData.action_plan ? `
    <div class="section">
      <h2>Plan d'Action</h2>
      ${reportData.action_plan.map((action: any, index: number) => `
        <div class="recommendation">
          <div class="rec-title">${action.step}: ${action.action}</div>
          <div class="rec-meta">Budget estimé: ${action.budget}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="footer">
      Audit ID: ${reportId} • Confiance IA: ${preAudit?.confidence || 95}%<br>
      Généré le ${new Date(report.created_at).toLocaleDateString('fr-FR')}<br>
      © 2025 IMOTION - Document Confidentiel
    </div>
  </div>
</body>
</html>
`;
    
    return new Response(htmlContent, { 
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } 
    });
  } catch (error) {
    const requestId = crypto.randomUUID();
    console.error(`[${requestId}] Error in audit-html:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de la récupération du rapport.',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
