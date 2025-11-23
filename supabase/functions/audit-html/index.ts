import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Gestion CORS
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const reportId = url.searchParams.get('report_id');

    if (!reportId) throw new Error("Report ID missing");

    // 2. Connexion Admin (Service Role) pour lire les données brutes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Récupération des DONNÉES (JSON) et non du vieux HTML
    const { data: report, error } = await supabase
      .from('audit_reports')
      .select('created_at, pre_audits(consolidated, url, company_guess)')
      .eq('id', reportId)
      .maybeSingle();

    if (error || !report) return new Response("Rapport introuvable", { status: 404 });

    // 4. Extraction des données (pre_audits est un tableau, on prend le premier)
    const preAudit = Array.isArray(report.pre_audits) ? report.pre_audits[0] : report.pre_audits;
    const data = preAudit?.consolidated || {};
    const companyName = preAudit?.company_guess || data.company?.name || "Entreprise";
    const companyUrl = preAudit?.url || "";
    const dateGen = new Date(report.created_at).toLocaleDateString('fr-FR');

    // 5. CONSTRUCTION DU DESIGN PREMIUM (CSS INJECTÉ)
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Audit Stratégique - ${companyName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;800&display=swap" rel="stylesheet">
      <style>
        :root { --brand: #d8232a; --dark: #0f172a; --gray: #f1f5f9; --white: #ffffff; }
        body { font-family: 'Manrope', sans-serif; background-color: #e2e8f0; margin: 0; padding: 40px; color: #334155; }
        
        .page {
            max-width: 900px; margin: 0 auto; background: var(--white); 
            border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); overflow: hidden;
        }
        
        /* HEADER PREMIUM */
        .header {
            background: linear-gradient(135deg, #d8232a 0%, #991b1b 100%);
            color: white; padding: 60px 50px; text-align: center; position: relative;
        }
        .header::after {
            content: "IMOTION INTELLIGENCE"; position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
            font-size: 10px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7; font-weight: 800;
        }
        .header h1 { margin: 10px 0; font-size: 36px; font-weight: 800; letter-spacing: -1px; }
        .header .meta { font-size: 14px; opacity: 0.9; font-weight: 300; margin-top: 10px; }
        .score-badge {
            background: white; color: var(--brand); padding: 5px 15px; border-radius: 20px; 
            font-weight: 800; font-size: 12px; display: inline-block; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        /* CONTENT */
        .content { padding: 60px; }

        /* EXECUTIVE SUMMARY */
        .exec-summary {
            background: #fff1f2; border-left: 4px solid var(--brand); padding: 25px; 
            border-radius: 0 8px 8px 0; font-size: 16px; line-height: 1.7; color: #881337; margin-bottom: 50px;
        }
        .exec-summary h3 { margin-top: 0; color: var(--brand); font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }

        /* GRID SCORES */
        .grid-scores { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 50px; }
        .score-card { text-align: center; padding: 15px 5px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
        .score-val { display: block; font-size: 28px; font-weight: 800; color: var(--dark); }
        .score-name { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 5px; }

        /* TITLES */
        h2 { font-size: 22px; color: var(--dark); border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-top: 60px; margin-bottom: 30px; }

        /* SWOT */
        .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .swot-item { padding: 25px; border-radius: 12px; }
        .swot-item h4 { margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .swot-item ul { padding-left: 20px; margin-bottom: 0; font-size: 14px; }
        .swot-item li { margin-bottom: 5px; }
        
        .bg-green { background: #f0fdf4; color: #166534; }
        .bg-red { background: #fef2f2; color: #991b1b; }
        .bg-blue { background: #eff6ff; color: #1e40af; }
        .bg-orange { background: #fff7ed; color: #9a3412; }

        /* SCENARIOS */
        .scenario { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin-bottom: 20px; position: relative; transition: transform 0.2s; }
        .scenario:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-color: var(--brand); }
        .scenario h3 { margin-top: 0; font-size: 18px; color: var(--dark); }
        .tag { position: absolute; top: 30px; right: 30px; background: #ecfdf5; color: #059669; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }

        /* FOOTER */
        .footer { text-align: center; margin-top: 80px; padding-top: 30px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>${companyName}</h1>
          <div class="meta">Audit Stratégique Digital • ${companyUrl}</div>
          <div class="score-badge">CONFIANCE IA 95%</div>
        </div>

        <div class="content">
          
          <div class="exec-summary">
            <h3>Synthèse Exécutive</h3>
            ${data.executive_summary || "Analyse en cours de consolidation..."}
          </div>

          <div class="grid-scores">
            <div class="score-card"><span class="score-val">${data.scores?.market || 0}</span><span class="score-name">Marché</span></div>
            <div class="score-card"><span class="score-val">${data.scores?.tech || 0}</span><span class="score-name">Tech</span></div>
            <div class="score-card"><span class="score-val">${data.scores?.ux || 0}</span><span class="score-name">UX</span></div>
            <div class="score-card"><span class="score-val">${data.scores?.seo || 0}</span><span class="score-name">SEO</span></div>
            <div class="score-card"><span class="score-val">${data.scores?.conversion || 0}</span><span class="score-name">Conv.</span></div>
          </div>

          <h2>Matrice Stratégique (SWOT)</h2>
          <div class="swot-grid">
            <div class="swot-item bg-green">
              <h4>Forces</h4>
              <ul>${(data.swot?.strengths || []).map((s:any) => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="swot-item bg-orange">
              <h4>Faiblesses</h4>
              <ul>${(data.swot?.weaknesses || []).map((s:any) => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="swot-item bg-blue">
              <h4>Opportunités</h4>
              <ul>${(data.swot?.opportunities || []).map((s:any) => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="swot-item bg-red">
              <h4>Menaces</h4>
              <ul>${(data.swot?.threats || []).map((s:any) => `<li>${s}</li>`).join('')}</ul>
            </div>
          </div>

          <h2>Scénarios de Croissance</h2>
          ${(data.strategic_scenarios || []).map((s:any) => `
            <div class="scenario">
              <span class="tag">ROI: ${s.roi}</span>
              <h3>${s.name}</h3>
              <p>${s.description}</p>
            </div>
          `).join('')}

          <div class="footer">
            Rapport généré le ${dateGen} par l'architecture Multi-Agents IMOTION.<br>
            Document confidentiel.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    return new Response(htmlContent, {
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        ...corsHeaders 
      }
    });

  } catch (error: any) {
    return new Response(`Erreur Génération: ${error.message}`, { status: 500 });
  }
});
