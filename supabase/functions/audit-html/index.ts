import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const reportId = url.searchParams.get('report_id');

    // Connexion Service Role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupération Données
    const { data: report, error } = await supabase
      .from('audit_reports')
      .select('*, pre_audits(consolidated, url, company_guess)')
      .eq('id', reportId)
      .maybeSingle();

    if (error || !report) {
      return new Response("<h1>Erreur : Rapport introuvable</h1>", { 
        headers: { "Content-Type": "text/html", ...corsHeaders } 
      });
    }

    // Sécurisation des données (Valeurs par défaut)
    const preAudit = Array.isArray(report.pre_audits) ? report.pre_audits[0] : report.pre_audits;
    const data = preAudit?.consolidated || {};
    
    // Variables sécurisées
    const companyName = preAudit?.company_guess || data.company?.name || "Entreprise";
    const companyUrl = preAudit?.url || "#";
    const scoreMarket = data.scores?.market ?? 0;
    const scoreTech = data.scores?.tech ?? 0;
    const scoreUx = data.scores?.ux ?? 0;
    const scoreSeo = data.scores?.seo ?? 0;
    const scoreConv = data.scores?.conversion ?? 0;
    
    const summary = data.executive_summary || "Analyse en cours de finalisation...";

    // HTML
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport ${companyName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Manrope', sans-serif; background: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
          .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          
          /* Header Rouge IMOTION */
          .header { background: linear-gradient(135deg, #d8232a 0%, #b91c1c 100%); color: white; padding: 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; letter-spacing: -1px; }
          .header p { opacity: 0.9; margin-top: 10px; font-weight: 300; }
          
          .content { padding: 40px; }
          
          .summary { background: #fff1f2; border-left: 4px solid #d8232a; padding: 20px; border-radius: 8px; font-size: 16px; line-height: 1.6; color: #881337; margin-bottom: 40px; }
          
          /* Grille Scores */
          .scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 40px; }
          .score-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
          .score-val { font-size: 24px; font-weight: 800; color: #d8232a; display: block; }
          .score-lbl { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-top: 5px; }

          h2 { font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 40px; color: #111; }
          
          /* Listes */
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          
          .footer { text-align: center; padding: 30px; background: #f9fafb; border-top: 1px solid #eee; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
            <p>Audit Stratégique • ${companyUrl}</p>
          </div>
          <div class="content">
            <div class="summary">${summary}</div>
            
            <div class="scores">
              <div class="score-box"><span class="score-val">${scoreMarket}</span><span class="score-lbl">Marché</span></div>
              <div class="score-box"><span class="score-val">${scoreTech}</span><span class="score-lbl">Tech</span></div>
              <div class="score-box"><span class="score-val">${scoreUx}</span><span class="score-lbl">UX</span></div>
              <div class="score-box"><span class="score-val">${scoreSeo}</span><span class="score-lbl">SEO</span></div>
              <div class="score-box"><span class="score-val">${scoreConv}</span><span class="score-lbl">Conv.</span></div>
            </div>

            <h2>Plan d'Action Prioritaire</h2>
            <ul>
              ${(data.action_plan || []).map((item: any) => `<li><strong>${item.step || 'Action'} :</strong> ${item.action || item}</li>`).join('')}
              ${(!data.action_plan || data.action_plan.length === 0) ? '<li>Aucune action spécifique identifiée.</li>' : ''}
            </ul>
            
            ${data.strategic_scenarios ? `
              <h2>Scénarios</h2>
              ${data.strategic_scenarios.map((s: any) => `<p><strong>${s.name}</strong> : ${s.description} (ROI: ${s.roi})</p>`).join('')}
            ` : ''}

          </div>
          <div class="footer">Généré par IMOTION MANUS IA 2.0</div>
        </div>
      </body>
      </html>
    `;

    return new Response(html, { 
      headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } 
    });

  } catch (error: any) {
    // En cas de crash total, on renvoie l'erreur en HTML pour la voir à l'écran
    const errorHtml = `<html><body><h1>Erreur Système</h1><pre>${error.message}</pre></body></html>`;
    return new Response(errorHtml, { 
      headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } 
    });
  }
});
