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
    if (!reportId) throw new Error("Report ID missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupérer le rapport ET le profil du créateur (pour le branding)
    const { data: report, error } = await supabase
      .from('audit_reports')
      .select(`
        *,
        pre_audits (
          consolidated,
          url,
          company_guess,
          created_by
        )
      `)
      .eq('id', reportId)
      .maybeSingle();

    if (error || !report) {
      console.error("Rapport introuvable:", error);
      return new Response("<h1>Erreur : Rapport introuvable</h1>", { 
        headers: { "Content-Type": "text/html", ...corsHeaders },
        status: 404
      });
    }

    // Récupérer le profil du créateur pour le branding
    let creatorProfile = null;
    if (report.pre_audits?.created_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('branding_config, subscription_plan, company_legal_name')
        .eq('user_id', report.pre_audits.created_by)
        .maybeSingle();
      creatorProfile = profile;
    }

    // Logique Marque Blanche (Caméléon)
    const branding = creatorProfile?.branding_config || {};
    const plan = creatorProfile?.subscription_plan || 'discovery';

    // Par défaut : Branding IMOTION
    let brandColor = "#d8232a";
    let brandColorDark = "#b01d23";
    let agencyName = "IMOTION AI";
    let logoHtml = `<div style="font-weight:900; font-size:28px; letter-spacing:-1px; color: white;">IMOTION</div>`;

    // Si Plan Payant (Pro ou Agency) : Branding Client
    if (plan === 'pro' || plan === 'agency' || plan === 'enterprise') {
      if (branding.primary_color) {
        brandColor = branding.primary_color;
        // Générer une version plus foncée pour le gradient
        brandColorDark = adjustColor(branding.primary_color, -20);
      }
      if (branding.company_name) agencyName = branding.company_name;
      if (branding.logo_url) {
        logoHtml = `<img src="${branding.logo_url}" alt="${agencyName}" style="height:50px; display:block; margin:0 auto;">`;
      } else {
        logoHtml = `<div style="font-weight:900; font-size:28px; letter-spacing:-1px; color: white;">${agencyName.toUpperCase()}</div>`;
      }
    }

    // Données de l'audit - Support pre_audits OU content direct
    const preAudit = report.pre_audits;
    // Priorité: pre_audits.consolidated > report.content > {}
    const data = preAudit?.consolidated || report.content || {};
    const clientCompany = preAudit?.company_guess || data.company?.name || report.title?.replace(/\[TEST.*?\]\s*/g, '') || "Entreprise";
    const clientUrl = preAudit?.url || data.url || "#";
    const dateGen = new Date(report.created_at).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    console.log('📊 Data source:', preAudit?.consolidated ? 'pre_audits.consolidated' : report.content ? 'report.content' : 'empty');
    console.log('📊 Scores:', JSON.stringify(data.scores));

    // Scores sécurisés
    const scoreMarket = data.scores?.market ?? data.scores?.global ?? 0;
    const scoreTech = data.scores?.tech ?? 0;
    const scoreUx = data.scores?.ux ?? 0;
    const scoreSeo = data.scores?.seo ?? 0;
    const scoreConv = data.scores?.conversion ?? data.scores?.marketing ?? 0;
    const summary = data.executive_summary || "Analyse en cours de finalisation...";

    // Génération HTML avec CSS Dynamique
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Stratégique - ${clientCompany}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${brandColor};
      --primary-dark: ${brandColorDark};
      --text: #1e293b;
      --text-light: #64748b;
      --bg: #f8fafc;
      --white: #ffffff;
      --border: #e2e8f0;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    .page {
      max-width: 900px;
      margin: 0 auto;
      background: var(--white);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    }
    
    /* HEADER DYNAMIQUE */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      padding: 50px 40px;
      text-align: center;
    }
    
    .header h1 {
      margin: 25px 0 10px;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    
    .header .meta {
      opacity: 0.9;
      font-size: 14px;
      font-weight: 500;
    }
    
    .header .url {
      opacity: 0.8;
      font-size: 13px;
      margin-top: 5px;
    }
    
    /* CONTENT */
    .content {
      padding: 50px 40px;
    }
    
    h2 {
      color: var(--text);
      font-size: 20px;
      font-weight: 700;
      border-bottom: 2px solid var(--border);
      padding-bottom: 12px;
      margin: 40px 0 20px;
    }
    
    h2:first-child {
      margin-top: 0;
    }
    
    .summary {
      background: linear-gradient(135deg, rgba(${hexToRgb(brandColor)}, 0.08) 0%, rgba(${hexToRgb(brandColor)}, 0.03) 100%);
      border-left: 4px solid var(--primary);
      padding: 25px;
      border-radius: 0 12px 12px 0;
      font-size: 16px;
      line-height: 1.7;
      color: var(--text);
      margin-bottom: 40px;
    }
    
    /* SCORES GRID */
    .scores {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 40px;
    }
    
    .score-box {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 15px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .score-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .score-val {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      display: block;
      line-height: 1;
    }
    
    .score-lbl {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--text-light);
      font-weight: 600;
      margin-top: 8px;
      letter-spacing: 0.5px;
    }
    
    /* LISTS */
    ul {
      padding-left: 20px;
      margin: 15px 0;
    }
    
    li {
      margin-bottom: 12px;
      color: var(--text);
    }
    
    li strong {
      color: var(--primary);
    }
    
    /* SCENARIOS */
    .scenario {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
    }
    
    .scenario-name {
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }
    
    .scenario-roi {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
    
    /* TEASER SECTIONS (Freemium) */
    .teaser-section {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border: 2px dashed var(--border);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 20px 0;
    }
    
    .teaser-section .lock-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .teaser-section h3 {
      color: var(--text-light);
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    .teaser-section p {
      color: var(--text-light);
      font-size: 14px;
    }
    
    .upgrade-cta {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 10px 25px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 15px;
      transition: opacity 0.2s;
    }
    
    .upgrade-cta:hover {
      opacity: 0.9;
    }
    
    /* FOOTER */
    .footer {
      text-align: center;
      padding: 30px 40px;
      background: var(--bg);
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-light);
    }
    
    .footer strong {
      color: var(--primary);
    }
    
    @media (max-width: 600px) {
      .scores {
        grid-template-columns: repeat(2, 1fr);
      }
      .content, .header {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      ${logoHtml}
      <h1>${clientCompany}</h1>
      <div class="meta">Audit Stratégique • ${dateGen}</div>
      <div class="url">${clientUrl}</div>
    </div>
    
    <div class="content">
      <h2>Synthèse Exécutive</h2>
      <div class="summary">${summary}</div>
      
      <h2>Scores de Performance</h2>
      <div class="scores">
        <div class="score-box">
          <span class="score-val">${scoreMarket}</span>
          <span class="score-lbl">Marché</span>
        </div>
        <div class="score-box">
          <span class="score-val">${scoreTech}</span>
          <span class="score-lbl">Tech</span>
        </div>
        <div class="score-box">
          <span class="score-val">${scoreUx}</span>
          <span class="score-lbl">UX</span>
        </div>
        <div class="score-box">
          <span class="score-val">${scoreSeo}</span>
          <span class="score-lbl">SEO</span>
        </div>
        <div class="score-box">
          <span class="score-val">${scoreConv}</span>
          <span class="score-lbl">Conv.</span>
        </div>
      </div>

      ${renderActionPlan(data.action_plan)}
      
      ${renderScenarios(data.strategic_scenarios)}
      
      ${renderTeasers(data.teasers, plan)}
      
    </div>
    
    <div class="footer">
      Document confidentiel • Généré par <strong>${agencyName}</strong> Intelligence
    </div>
  </div>
</body>
</html>
    `;

    return new Response(html, { 
      headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } 
    });

  } catch (error: any) {
    console.error("Erreur audit-html:", error);
    const errorHtml = `<html><body><h1>Erreur Système</h1><pre>${error.message}</pre></body></html>`;
    return new Response(errorHtml, { 
      headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      status: 500
    });
  }
});

// Helper: Ajuster la luminosité d'une couleur hex
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// Helper: Convertir hex en RGB pour les gradients
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '216, 35, 42'; // Fallback IMOTION red
}

// Render Action Plan
function renderActionPlan(actionPlan: any[]): string {
  if (!actionPlan || actionPlan.length === 0) {
    return `
      <h2>Plan d'Action Prioritaire</h2>
      <p style="color: var(--text-light);">Aucune action spécifique identifiée pour le moment.</p>
    `;
  }
  
  const items = actionPlan.map((item: any) => {
    const step = item.step || item.phase || 'Action';
    const action = item.action || item.title || item;
    const details = item.details || item.description || '';
    const isLocked = details === '🔒 Réservé aux membres Premium' || details.includes('LOCKED_PREMIUM');
    
    if (isLocked) {
      return `<li><strong>${step} :</strong> ${action} <em style="color: var(--text-light);">🔒 Premium</em></li>`;
    }
    return `<li><strong>${step} :</strong> ${action}${details ? ` - ${details}` : ''}</li>`;
  }).join('');
  
  return `
    <h2>Plan d'Action Prioritaire</h2>
    <ul>${items}</ul>
  `;
}

// Render Strategic Scenarios
function renderScenarios(scenarios: any[]): string {
  if (!scenarios || scenarios.length === 0) return '';
  
  const items = scenarios.map((s: any) => `
    <div class="scenario">
      <span class="scenario-name">${s.name || 'Scénario'}</span>
      ${s.roi ? `<span class="scenario-roi">ROI: ${s.roi}</span>` : ''}
      <p style="margin-top: 10px; color: var(--text-light);">${s.description || ''}</p>
    </div>
  `).join('');
  
  return `
    <h2>Scénarios Stratégiques</h2>
    ${items}
  `;
}

// Render Teasers for Freemium users
function renderTeasers(teasers: any[], plan: string): string {
  // Only show teasers for discovery/freemium plans
  if (plan !== 'discovery' && plan !== 'freemium') return '';
  if (!teasers || teasers.length === 0) return '';
  
  const items = teasers.map((t: any) => `
    <div class="teaser-section">
      <div class="lock-icon">🔒</div>
      <h3>${t.description || 'Analyse avancée'}</h3>
      <p>Débloquez cette fonctionnalité avec le plan ${t.upgrade_plan || 'Pro'}</p>
    </div>
  `).join('');
  
  return `
    <h2>Analyses Avancées</h2>
    ${items}
    <div style="text-align: center; margin-top: 30px;">
      <a href="/pricing" class="upgrade-cta">Passer au Plan Pro →</a>
    </div>
  `;
}
