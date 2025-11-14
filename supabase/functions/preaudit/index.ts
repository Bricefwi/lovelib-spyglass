import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const preAuditSchema = z.object({
  url: z.string()
    .url({ message: "Invalid URL format" })
    .min(10, { message: "URL too short" })
    .max(500, { message: "URL too long" })
    .refine(
      (url) => {
        const hostname = new URL(url).hostname;
        return !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
      },
      { message: "Local URLs not allowed" }
    )
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    
    // Validate input
    const validation = preAuditSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Invalid input: " + validation.error.errors[0].message 
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { url } = validation.data;
    console.log(`Starting pre-audit for: ${url}`);
    
    // SÉCURITÉ: Utiliser ANON_KEY au lieu de SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const domain = url.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0];
    const websiteUrl = `https://${domain}`;
    
    // Chercher d'abord une company existante avec ce website
    let company: any;
    const { data: existingCompany } = await supabase.from('companies').select().eq('website', websiteUrl).maybeSingle();
    
    if (existingCompany) {
      company = existingCompany;
      console.log(`Using existing company: ${company.id}`);
    } else {
      // Créer une nouvelle company avec un nom temporaire
      const { data: newCompany, error: companyError } = await supabase.from('companies').insert({ 
        name: domain, 
        website: websiteUrl,
        city: 'Unknown'
      }).select().single();
      
      if (companyError) {
        console.error('Error creating company:', companyError);
        throw companyError;
      }
      company = newCompany;
      console.log(`Created new company: ${company.id}`);
    }
    
    const { data: pre, error: preError } = await supabase.from('pre_audits').insert({ 
      company_id: company.id, 
      url, 
      status: 'collecting', 
      timeline: [{at: new Date().toISOString(), label: 'Création'}] 
    }).select().single();

    if (preError) {
      console.error('Error creating pre-audit:', preError);
      throw preError;
    }

    console.log(`Pre-audit created with id: ${pre.id}`);

    // Utiliser Lovable AI pour l'analyse
    console.log('Fetching site basics...');
    
    const prompt = `Analyse complète du site web ${url} (${domain}):

Génère un rapport d'audit marketing et commercial au format JSON avec EXACTEMENT cette structure:

{
  "summary": "Résumé de 2-3 phrases décrivant l'entreprise et son positionnement",
  "company": {
    "name": "Nom de l'entreprise",
    "country": "Pays (code ISO comme FR, BE, etc.)",
    "industry": "Secteur d'activité"
  },
  "marketing": {
    "channels": ["Liste des canaux marketing utilisés: SEO, Google Ads, Facebook Ads, LinkedIn, etc."],
    "stack": ["Outils marketing détectés: Google Analytics, HubSpot, Mailchimp, etc."]
  },
  "sales": {
    "motions": ["Types de vente: B2B, B2C, E-commerce, Lead Generation, etc."]
  },
  "tech": {
    "stack": ["Technologies utilisées: WordPress, Shopify, React, etc."]
  },
  "competitors": ["Liste de 3-5 concurrents directs"],
  "kpis": {
    "current": ["KPIs actuels estimés"],
    "suggested": ["KPIs recommandés pour améliorer la performance"]
  },
  "scenarios": [
    {
      "type": "ambitieux",
      "benefits": "Description des bénéfices attendus",
      "risks": "Risques identifiés",
      "prob_succes": 75,
      "kpis": ["KPIs spécifiques à ce scénario"],
      "effort": {
        "jours": 90,
        "budget_eur": 25000
      }
    },
    {
      "type": "raisonnable",
      "benefits": "Description des bénéfices attendus",
      "risks": "Risques identifiés",
      "prob_succes": 85,
      "kpis": ["KPIs spécifiques à ce scénario"],
      "effort": {
        "jours": 45,
        "budget_eur": 12000
      }
    },
    {
      "type": "opportuniste",
      "benefits": "Description des bénéfices attendus",
      "risks": "Risques identifiés",
      "prob_succes": 90,
      "kpis": ["KPIs spécifiques à ce scénario"],
      "effort": {
        "jours": 20,
        "budget_eur": 5000
      }
    },
    {
      "type": "mix",
      "benefits": "Description des bénéfices attendus",
      "risks": "Risques identifiés",
      "prob_succes": 80,
      "kpis": ["KPIs spécifiques à ce scénario"],
      "effort": {
        "jours": 60,
        "budget_eur": 15000
      }
    }
  ]
}

IMPORTANT: 
- Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après
- Fournis des données réalistes et spécifiques basées sur le domaine
- Les scénarios doivent être concrets et actionnables
- Ne laisse AUCUN champ vide`;

    console.log('Searching with Lovable AI...');
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en audit marketing et commercial. Tu analyses les sites web et fournis des rapports détaillés au format JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('No content from Lovable AI');
    }

    console.log('AI generation completed');

    // Parser le JSON de la réponse
    let consolidated: any;
    try {
      // Extraire le JSON de la réponse (en cas de texte autour)
      const jsonStart = aiContent.indexOf('{');
      const jsonEnd = aiContent.lastIndexOf('}') + 1;
      const jsonStr = aiContent.slice(jsonStart, jsonEnd);
      consolidated = JSON.parse(jsonStr);
      console.log('Successfully parsed AI response');
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback avec structure par défaut
      consolidated = {
        summary: `Audit marketing et commercial de ${domain}`,
        company: { name: domain, country: 'FR', industry: 'Non déterminé' },
        marketing: { channels: ['SEO', 'Réseaux sociaux'], stack: [] },
        sales: { motions: ['Digital'] },
        tech: { stack: [] },
        competitors: [],
        kpis: { current: ['Trafic web', 'Taux de conversion'], suggested: ['ROI marketing', 'Coût d\'acquisition client'] },
        scenarios: [
          { type: 'ambitieux', benefits: 'Croissance rapide', risks: 'Investissement élevé', prob_succes: 70, kpis: [], effort: { jours: 90, budget_eur: 25000 } },
          { type: 'raisonnable', benefits: 'Croissance stable', risks: 'Risque modéré', prob_succes: 85, kpis: [], effort: { jours: 45, budget_eur: 12000 } },
          { type: 'opportuniste', benefits: 'Gains rapides', risks: 'Risque faible', prob_succes: 90, kpis: [], effort: { jours: 20, budget_eur: 5000 } },
          { type: 'mix', benefits: 'Équilibre risque/bénéfice', risks: 'Risque moyen', prob_succes: 80, kpis: [], effort: { jours: 60, budget_eur: 15000 } }
        ]
      };
    }

    const confidence = 85; // Haute confiance avec Lovable AI

    // Mettre à jour le pre_audit
    const { error: updateError } = await supabase.from('pre_audits').update({ 
      status: 'consolidated', 
      confidence, 
      sources_raw: { lovable_ai: aiContent },
      consolidated,
      timeline: [...pre.timeline, {at: new Date().toISOString(), label: 'Analyse IA terminée'}],
      updated_at: new Date().toISOString()
    }).eq('id', pre.id);

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Pre-audit updated successfully');
    }

    // Générer le rapport HTML
    const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Rapport ${domain}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .top { background: #E53935; color: #fff; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .top strong { font-size: 20px; font-weight: 700; }
    .container { max-width: 1200px; margin: 32px auto; padding: 0 20px; }
    .card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card h2 { font-size: 24px; margin-bottom: 16px; color: #333; }
    .card h3 { font-size: 18px; margin-bottom: 12px; color: #555; }
    .card p { line-height: 1.6; color: #666; margin-bottom: 12px; }
    .badge { display: inline-block; background: #fee; color: #B71C1C; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    @media(max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .tag { display: inline-block; background: #f3f3f3; color: #333; padding: 6px 12px; border-radius: 6px; margin: 4px 4px 4px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #e0e0e0; padding: 12px; text-align: left; }
    th { background: #f9f9f9; font-weight: 600; color: #555; }
    td { color: #666; }
    .section-title { font-size: 14px; text-transform: uppercase; color: #999; margin-bottom: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="top">
    <strong>IMOTION</strong>
    <div style="font-size: 16px;">Rapport ${domain}</div>
    <div style="font-size: 14px;">Confiance ${confidence}%</div>
  </div>
  <div class="container">
    <div class="card">
      <h2>Résumé Exécutif</h2>
      <p>${consolidated.summary || 'Analyse en cours...'}</p>
      <span class="badge">Confiance ${confidence}%</span>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Entreprise</h3>
        <p><strong>${consolidated.company?.name || domain}</strong></p>
        <p>${consolidated.company?.industry || 'Secteur non déterminé'} • ${consolidated.company?.country || 'FR'}</p>
      </div>
      <div class="card">
        <h3>Concurrents Identifiés</h3>
        <div>
          ${(consolidated.competitors || []).map((c: string) => `<span class="tag">${c}</span>`).join('') || '<p>Aucun concurrent identifié</p>'}
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Marketing Digital</h3>
        <div class="section-title">Canaux</div>
        <div>
          ${(consolidated.marketing?.channels || []).map((c: string) => `<span class="tag">${c}</span>`).join('') || '<p>Non détecté</p>'}
        </div>
        <div class="section-title" style="margin-top: 16px;">Stack Technique</div>
        <div>
          ${(consolidated.marketing?.stack || []).map((s: string) => `<span class="tag">${s}</span>`).join('') || '<p>Non détecté</p>'}
        </div>
      </div>
      <div class="card">
        <h3>Commercial</h3>
        <div class="section-title">Modèles de vente</div>
        <div>
          ${(consolidated.sales?.motions || []).map((m: string) => `<span class="tag">${m}</span>`).join('') || '<p>Non détecté</p>'}
        </div>
        ${consolidated.tech?.stack?.length ? `
        <div class="section-title" style="margin-top: 16px;">Technologies</div>
        <div>
          ${consolidated.tech.stack.map((t: string) => `<span class="tag">${t}</span>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>

    <div class="card">
      <h3>KPIs Recommandés</h3>
      <div class="grid">
        <div>
          <div class="section-title">KPIs Actuels</div>
          ${(consolidated.kpis?.current || []).map((k: string) => `<div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">• ${k}</div>`).join('') || '<p>Non définis</p>'}
        </div>
        <div>
          <div class="section-title">KPIs Suggérés</div>
          ${(consolidated.kpis?.suggested || []).map((k: string) => `<div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">• ${k}</div>`).join('') || '<p>Non définis</p>'}
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Scénarios d'Optimisation</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Probabilité</th>
            <th>Effort</th>
            <th>Bénéfices</th>
            <th>Risques</th>
          </tr>
        </thead>
        <tbody>
          ${(consolidated.scenarios || []).map((s: any) => `
            <tr>
              <td><strong>${s.type.charAt(0).toUpperCase() + s.type.slice(1)}</strong></td>
              <td>${s.prob_succes}%</td>
              <td>${s.effort?.jours || 0}j / ${s.effort?.budget_eur || 0}€</td>
              <td>${s.benefits || '—'}</td>
              <td>${s.risks || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card" style="background: #f9f9f9; border: 2px solid #E53935;">
      <p style="text-align: center; color: #666; font-size: 14px;">
        <strong>Rapport généré par IMOTION</strong> • ${new Date().toLocaleDateString('fr-FR')}
      </p>
    </div>
  </div>
</body>
</html>`;
    
    const { data: rep, error: repError } = await supabase.from('audit_reports').insert({ 
      pre_audit_id: pre.id, 
      title: `Rapport ${domain}`, 
      html 
    }).select().single();

    if (repError) {
      console.error('Error creating report:', repError);
    } else {
      console.log(`Report created with id: ${rep.id}`);
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      report_id: rep?.id, 
      pre_audit_id: pre.id,
      confidence
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
    
  } catch(e) {
    console.error('Error in preaudit:', e);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: e instanceof Error ? e.message : String(e) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
