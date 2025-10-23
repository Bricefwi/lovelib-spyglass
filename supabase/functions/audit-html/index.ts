import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const preAuditId = url.searchParams.get("pre_audit_id");

    if (!preAuditId) {
      return new Response(
        JSON.stringify({ error: "pre_audit_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Récupérer les données du pré-audit et du rapport
    const { data: preAudit, error: preError } = await supabase
      .from("pre_audits")
      .select("id, url, domain, company_guess, status, confidence, consolidated")
      .eq("id", preAuditId)
      .single();

    if (preError || !preAudit) {
      return new Response(
        JSON.stringify({ error: "Pre-audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Récupérer le rapport d'audit s'il existe
    const { data: auditResult } = await supabase
      .from("audit_results")
      .select("summary, scores, scenarios, sources, confidence")
      .eq("pre_audit_id", preAuditId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const consolidated = preAudit.consolidated || {};
    const scores = auditResult?.scores || consolidated.scores || {};
    const scenarios = auditResult?.scenarios || consolidated.scenarios || [];
    const sources = auditResult?.sources || consolidated.sources || [];
    const summary = auditResult?.summary || consolidated.summary || "Analyse en cours...";
    const confidence = auditResult?.confidence || preAudit.confidence || 0;

    // Générer le HTML
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport IMOTION – ${preAudit.company_guess || preAudit.domain}</title>
  <style>
    :root {
      --red: #e11d48;
      --ink: #111827;
      --muted: #6b7280;
      --bg: #f9fafb;
      --card: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
      background: var(--bg);
      line-height: 1.6;
    }
    .banner {
      background: linear-gradient(90deg, var(--red), #ef4444);
      color: #fff;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo {
      height: 32px;
      font-weight: 800;
      font-size: 24px;
    }
    .title {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 0.3px;
    }
    .meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
    }
    .container {
      max-width: 1200px;
      margin: 32px auto;
      padding: 0 24px;
    }
    .card {
      background: var(--card);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 24px;
    }
    h1 { font-size: 28px; margin-bottom: 16px; color: var(--red); }
    h2 { font-size: 24px; margin-bottom: 12px; margin-top: 8px; }
    h3 { font-size: 20px; margin-bottom: 10px; margin-top: 8px; }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .score-item {
      padding: 16px;
      background: #f3f4f6;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .score-label {
      font-weight: 600;
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 8px;
    }
    .score-value {
      font-size: 32px;
      font-weight: 800;
      color: var(--red);
    }
    .scenario {
      padding: 16px;
      border-left: 4px solid var(--red);
      background: #fef2f2;
      margin-bottom: 16px;
      border-radius: 8px;
    }
    .scenario-title {
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 8px;
    }
    .source-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .source-url {
      color: var(--red);
      text-decoration: none;
      font-weight: 600;
    }
    .confidence-badge {
      display: inline-block;
      padding: 8px 16px;
      background: var(--red);
      color: white;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      color: var(--muted);
      padding: 32px;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 48px;
    }
    @media (max-width: 900px) {
      .grid-2 { grid-template-columns: 1fr; }
      .meta { flex-direction: column; gap: 8px; }
    }
  </style>
</head>
<body>
  <header class="banner">
    <div class="brand">
      <div class="logo">IMOTION</div>
      <div class="title">Rapport d'audit digital</div>
    </div>
    <div class="meta">
      <div><strong>${preAudit.company_guess || preAudit.domain}</strong></div>
      <div>Confiance: <strong>${Math.round(confidence)}%</strong></div>
    </div>
  </header>

  <main class="container">
    <section class="card">
      <h1>Résumé exécutif</h1>
      <p style="font-size: 16px; line-height: 1.8;">${summary}</p>
      <div style="margin-top: 16px;">
        <span class="confidence-badge">Score de confiance: ${Math.round(confidence)}%</span>
      </div>
    </section>

    <div class="grid-2">
      <div class="card">
        <h2>Scores & Indicateurs</h2>
        ${Object.keys(scores).length > 0 ? Object.entries(scores).map(([key, value]) => `
          <div class="score-item">
            <div class="score-label">${key}</div>
            <div class="score-value">${typeof value === 'number' ? Math.round(value) : value}</div>
          </div>
        `).join('') : '<p style="color: var(--muted);">Aucun score disponible</p>'}
      </div>

      <div class="card">
        <h2>Informations collectées</h2>
        <div class="score-item">
          <div class="score-label">URL analysée</div>
          <div style="font-size: 14px; margin-top: 4px;"><a href="${preAudit.url}" target="_blank" class="source-url">${preAudit.url}</a></div>
        </div>
        <div class="score-item">
          <div class="score-label">Domaine</div>
          <div style="font-size: 16px; font-weight: 600; margin-top: 4px;">${preAudit.domain || 'N/A'}</div>
        </div>
        <div class="score-item">
          <div class="score-label">Statut</div>
          <div style="font-size: 16px; font-weight: 600; margin-top: 4px;">${preAudit.status}</div>
        </div>
      </div>
    </div>

    <section class="card">
      <h2>Scénarios recommandés</h2>
      ${scenarios.length > 0 ? scenarios.map((scenario: any) => `
        <div class="scenario">
          <div class="scenario-title">${scenario.title || scenario.name || 'Scénario'}</div>
          <p>${scenario.description || scenario.content || JSON.stringify(scenario)}</p>
        </div>
      `).join('') : '<p style="color: var(--muted);">Aucun scénario disponible pour le moment</p>'}
    </section>

    <section class="card">
      <h2>Sources & Références</h2>
      ${sources.length > 0 ? sources.map((source: any) => `
        <div class="source-item">
          ${source.url ? `<a href="${source.url}" target="_blank" class="source-url">${source.url}</a>` : ''}
          ${source.snippet ? `<p style="margin-top: 8px; color: var(--muted);">${source.snippet}</p>` : ''}
          ${source.reliability ? `<div style="margin-top: 4px; font-size: 12px;">Fiabilité: ${Math.round(source.reliability * 100)}%</div>` : ''}
        </div>
      `).join('') : '<p style="color: var(--muted);">Aucune source référencée</p>'}
      <p style="margin-top: 16px; font-size: 13px; color: var(--muted);">
        ⚠️ Les données sont issues de collectes publiques et de modèles IA, consolidées automatiquement.
      </p>
    </section>
  </main>

  <footer class="footer">
    <div style="font-weight: 600; margin-bottom: 8px;">IMOTION • Conseil Marketing & Commercial</div>
    <div>Rapport généré automatiquement • ${new Date().toLocaleDateString('fr-FR')}</div>
  </footer>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("Error in audit-html:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
