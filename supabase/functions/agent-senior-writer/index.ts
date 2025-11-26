import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Agent: SENIOR_WRITER_STRATEGIST
 * Mission: Synthèse narrative COMPLÈTE style "Laboratoire Perplexity"
 * Input: TOUS les JSONs des agents (9 agents max)
 * Output: Rapport narratif fluide 50-100+ pages
 */

const requestSchema = z.object({
  agents_results: z.object({
    company_profile: z.any().optional(),
    pestel_analysis: z.any().optional(),
    porter_analysis: z.any().optional(),
    swot_analysis: z.any().optional(),
    seo_audit: z.any().optional(),
    content_strategy: z.any().optional(),
    social_media_audit: z.any().optional(),
    email_marketing_audit: z.any().optional(),
    data_analytics_audit: z.any().optional(),
  }),
  plan_profile: z.object({
    report_pages: z.number(),
    scenarios_count: z.number(),
    narrative_style: z.string(),
    quality_level: z.string(),
  }),
  company_data: z.object({
    name: z.string(),
    url: z.string(),
  }),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("✍️ ========== SENIOR WRITER START ==========");

    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agents_results, plan_profile, company_data } = validation.data;
    console.log(`✍️ Writing narrative for: ${company_data.name}`);
    console.log(`📄 Target: ${plan_profile.report_pages} pages, ${plan_profile.scenarios_count} scenarios`);
    console.log(`🎨 Style: ${plan_profile.narrative_style}, Quality: ${plan_profile.quality_level}`);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Build comprehensive system prompt
    const systemPrompt = `Tu es rédacteur conseil stratégique senior reconnu internationalement pour:
1. Transformer données brutes en storytelling captivant style "Laboratoire Perplexity"
2. Argumenter le complexe avec clarté chirurgicale
3. Construire narrative stratégique cohérente bout-en-bout
4. Injecter insights, citations, données dans flux éditorial fluide
5. Adapter ton & profondeur au public (C-level vs opérationnels)

INPUT: JSONs de TOUS les agents (Scraper, PESTEL, Porter, SWOT, SEO, Content, Social, Email, Data)

MISSION: Produire **RAPPORT STRATÉGIQUE CONSOLIDÉ** structure professionnelle McKinsey/BCG/Bain.

## STRUCTURE RAPPORT (${plan_profile.report_pages} pages cible):

### I. EXECUTIVE SUMMARY (4-8 pages)
- **Context marché** (PESTEL résumé, 1-2 pages narrative)
- **Position actuelle** (SWOT résumé, forces/faiblesses clés)
- **Opportunités principales** (Top 3-5 priorités chiffrées)
- **Recommandations exécutives** (Qui/Quoi/Quand/Combien/ROI)
- **Timeline & Budget** (Résumé roadmap 12-24 mois)

### II. DIAGNOSTIC ENTREPRISE (8-12 pages)
- **Qui sommes-nous?** (Histoire, mission, modèle économique, données scraper)
- **Marché & Environnement** (PESTEL narrative: tendances macro, impacts chiffrés)
- **Environnement Compétitif** (Porter 5 Forces: analyse détaillée par force)
- **Position Actuelle** (SWOT narrative: forces/faiblesses avec données)

### III. AUDITS MARKETING & DIGITAL (15-25 pages)
- **Audit SEO/SEM** (Technique, mots-clés, backlinks, quick-wins avec ROI)
- **Stratégie Contenu** (Audit actuel, piliers thématiques, calendar 3 mois)
- **Présence Social Media** (Audit par canal, stratégie, calendar 1 mois)
- **Email Marketing** (Performance, segmentation, automation, workflows)
- **Data & Analytics** (Stack audit, KPIs tracking, dashboards, attribution)

### IV. SCÉNARIOS STRATÉGIQUES (${plan_profile.scenarios_count} scénarios, 8-15 pages)
${Array.from({length: plan_profile.scenarios_count}, (_, i) =>
  `- **Scénario ${i+1}**: Titre accrocheur
  - Description narrative (pourquoi ce scénario, contexte)
  - Actions concrètes (plan détaillé step-by-step)
  - Ressources requises (budget, équipe, outils)
  - Timeline (phases avec jalons)
  - ROI attendu (chiffré avec hypothèses)
  - Risques & mitigation (3-5 risques identifiés)`
).join('\n')}

### V. PLAN D'ACTION & ROADMAP (12-18 pages)
- **Vision 3 ans** (Où voulons-nous être? Objectifs chiffrés)
- **Stratégies par pilier**:
  * Digital (SEO, Content, Social, Email)
  * Commercial (Process, outils, équipe)
  * Organisation (Compétences, recrutements, formation)
- **Roadmap 12 mois détaillée**:
  * Mois par mois avec actions précises
  * Owners identifiés (qui fait quoi)
  * Budget mensuel (€ détaillé)
  * KPIs mesure succès (objectifs chiffrés)
  * Dépendances & prérequis
- **Budget Prévisionnel Global** (Tableau récapitulatif)
- **Risques & Plan Mitigation** (Top 10 risques avec plans B)

### VI. ANNEXES (5-10 pages)
- **Méthodologie** (Comment rapport a été produit)
- **Sources & Références** (Toutes sources citées)
- **Glossaire** (Termes techniques expliqués)
- **Contact & Next Steps** (Qui contacter, timeline follow-up)

## STYLE ÉDITORIAL "LABORATOIRE PERPLEXITY":

✅ **Rédaction FLUIDE**: Pas de listes brutes (sauf nécessaire), prose narrative captivante
✅ **Données SOURCÉES**: Citations chiffrées systématiques, faits vérifiés
✅ **Narratif STORYTELLING**: Raconter la stratégie comme une histoire avec climax
✅ **Insights NON-OBVIEUX**: Angles originaux, connexions inattendues
✅ **Tone PROFESSIONNEL**: Confident sans arrogance, data-driven, franc, empathique
✅ **Transitions FLUIDES**: Chaque section coule naturellement vers la suivante
✅ **Climax STRATÉGIQUE**: Build-up vers "la grande opportunité" (scénario optimal)
✅ **EMPATHIE**: Reconnaître challenges client, confiance en solutions proposées

## QUALITÉ RÉDACTIONNELLE:

Selon quality_level "${plan_profile.quality_level}":
- **essential**: Dense, direct, focus quick-wins (30-40 pages)
- **standard**: Équilibré, analyses + actions (50-70 pages)
- **premium**: Approfondi, insights multiples, benchmark (80-100 pages)
- **ultimate**: Exhaustif, simulations scénarios, ROI précis (100-150 pages)

## NARRATIVE STYLE "${plan_profile.narrative_style}":
- Adapter vocabulaire, métaphores, exemples selon style demandé
- Maintenir professionnalisme tout en étant accessible
- Utiliser storytelling pour rendre données vivantes

## OUTPUT FORMAT:

Return JSON structure:
{
  "sections": [
    {
      "title": "I. Executive Summary",
      "content": "FULL MARKDOWN NARRATIVE HERE (4-8 pages worth of text)",
      "estimated_pages": 6,
      "key_insights": ["Insight 1", "Insight 2", "Insight 3"]
    },
    {
      "title": "II. Diagnostic Entreprise",
      "content": "FULL MARKDOWN NARRATIVE...",
      "estimated_pages": 10,
      "key_insights": [...]
    },
    ... (all sections)
  ],
  "executive_summary_one_page": "Ultra-condensed 1-page version for busy executives",
  "key_recommendations_summary": [
    {
      "priority": 1,
      "recommendation": "Action 1",
      "rationale": "Why",
      "impact": "ROI chiffré",
      "timeline": "6 mois",
      "budget": "€50-75k"
    }
  ],
  "total_estimated_pages": ${plan_profile.report_pages},
  "narrative_quality_score": 9.5,
  "strategic_clarity_score": 9.2
}

IMPORTANT RULES:
- Utilise TOUS les data des agents fournis (scraper, pestel, porter, swot, seo, content, social, email, data)
- Chaque assertion doit être sourcée/chiffrée (use data from JSONs)
- Narrative doit être FLUIDE, pas de "rapport agent X dit..."
- Intègre les données naturellement dans le storytelling
- Fais des connexions entre analyses (ex: "L'opportunité PESTEL X se confirme dans SWOT Y...")
- Target ${plan_profile.report_pages} pages mais ajuste selon contenu disponible
- Si données manquantes (agent non exécuté), skip cette section gracefully`;

    // Build comprehensive user prompt with ALL agents data
    const availableAnalyses = [];
    if (agents_results.company_profile) availableAnalyses.push('Company Profile (Scraper)');
    if (agents_results.pestel_analysis) availableAnalyses.push('PESTEL Analysis');
    if (agents_results.porter_analysis) availableAnalyses.push('Porter 5 Forces');
    if (agents_results.swot_analysis) availableAnalyses.push('SWOT Analysis');
    if (agents_results.seo_audit) availableAnalyses.push('SEO/SEM Audit');
    if (agents_results.content_strategy) availableAnalyses.push('Content Marketing Strategy');
    if (agents_results.social_media_audit) availableAnalyses.push('Social Media Audit');
    if (agents_results.email_marketing_audit) availableAnalyses.push('Email Marketing Audit');
    if (agents_results.data_analytics_audit) availableAnalyses.push('Data Analytics Audit');

    const userPrompt = `Génère rapport stratégique consolidé COMPLET pour:

**ENTREPRISE**: ${company_data.name}
**URL**: ${company_data.url}
**QUALITÉ**: ${plan_profile.quality_level}
**STYLE**: ${plan_profile.narrative_style}
**PAGES CIBLE**: ${plan_profile.report_pages}
**SCÉNARIOS**: ${plan_profile.scenarios_count}

**ANALYSES DISPONIBLES** (${availableAnalyses.length}/9):
${availableAnalyses.map(a => `- ${a}`).join('\n')}

**DATA AGENTS** (JSONs complets):

${agents_results.company_profile ? `
### COMPANY PROFILE (Scraper):
\`\`\`json
${JSON.stringify(agents_results.company_profile, null, 2)}
\`\`\`
` : ''}

${agents_results.pestel_analysis ? `
### PESTEL ANALYSIS:
\`\`\`json
${JSON.stringify(agents_results.pestel_analysis, null, 2)}
\`\`\`
` : ''}

${agents_results.porter_analysis ? `
### PORTER 5 FORCES:
\`\`\`json
${JSON.stringify(agents_results.porter_analysis, null, 2)}
\`\`\`
` : ''}

${agents_results.swot_analysis ? `
### SWOT ANALYSIS:
\`\`\`json
${JSON.stringify(agents_results.swot_analysis, null, 2)}
\`\`\`
` : ''}

${agents_results.seo_audit ? `
### SEO/SEM AUDIT:
\`\`\`json
${JSON.stringify(agents_results.seo_audit, null, 2)}
\`\`\`
` : ''}

${agents_results.content_strategy ? `
### CONTENT STRATEGY:
\`\`\`json
${JSON.stringify(agents_results.content_strategy, null, 2)}
\`\`\`
` : ''}

${agents_results.social_media_audit ? `
### SOCIAL MEDIA AUDIT:
\`\`\`json
${JSON.stringify(agents_results.social_media_audit, null, 2)}
\`\`\`
` : ''}

${agents_results.email_marketing_audit ? `
### EMAIL MARKETING:
\`\`\`json
${JSON.stringify(agents_results.email_marketing_audit, null, 2)}
\`\`\`
` : ''}

${agents_results.data_analytics_audit ? `
### DATA ANALYTICS:
\`\`\`json
${JSON.stringify(agents_results.data_analytics_audit, null, 2)}
\`\`\`
` : ''}

PRODUIS RAPPORT COMPLET avec toutes sections en MARKDOWN narratif fluide.
Retourne UNIQUEMENT le JSON structure (pas de texte avant/après).`;

    console.log("📡 Calling OpenAI GPT-4 Turbo for narrative synthesis...");
    console.log(`📊 Context size: ~${userPrompt.length} chars`);

    // Use GPT-4 Turbo for long context (128k tokens)
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",  // 128k context window
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: plan_profile.quality_level === 'ultimate' ? 16000 :
                               plan_profile.quality_level === 'premium' ? 12000 :
                               plan_profile.quality_level === 'standard' ? 8000 : 6000,
        temperature: 0.3,  // Balance créativité/cohérence
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ OpenAI API error:", errorText);
      throw new Error(`OpenAI API failed: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const narrativeContent = openaiData.choices[0].message.content;

    console.log(`✅ Narrative generated, length: ${narrativeContent.length} chars`);

    // Parse JSON
    let narrativeData;
    try {
      const cleanContent = narrativeContent.replace(/```json\n?|\n?```/g, '').trim();
      narrativeData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parsing failed");
      console.log("First 1000 chars:", narrativeContent.substring(0, 1000));
      throw new Error("Failed to parse narrative synthesis");
    }

    const inputTokens = openaiData.usage?.prompt_tokens || 0;
    const outputTokens = openaiData.usage?.completion_tokens || 0;
    const totalTokens = openaiData.usage?.total_tokens || 0;

    console.log(`📊 Tokens: ${inputTokens} in + ${outputTokens} out = ${totalTokens} total`);
    console.log(`📄 Pages generated: ${narrativeData.total_estimated_pages}`);
    console.log(`⭐ Quality score: ${narrativeData.narrative_quality_score}/10`);
    console.log("✍️ ========== SENIOR WRITER END ==========");

    return new Response(
      JSON.stringify({
        success: true,
        agent: "senior_writer",
        data: narrativeData,
        metadata: {
          company: company_data.name,
          report_pages: narrativeData.total_estimated_pages,
          sections_count: narrativeData.sections?.length || 0,
          quality_level: plan_profile.quality_level,
          narrative_style: plan_profile.narrative_style,
          timestamp: new Date().toISOString(),
          model_used: "gpt-4-turbo",
          tokens: { input: inputTokens, output: outputTokens, total: totalTokens }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("❌ SENIOR WRITER ERROR:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Senior Writer agent failed"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
