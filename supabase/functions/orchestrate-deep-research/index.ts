import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CONFIGURATION ULTRA-PREMIUM - Modèles Lovable AI disponibles
const AI_CONFIG = {
  model_reasoning: "openai/gpt-5", // Puissant raisonnement multi-étapes
  model_drafting: "google/gemini-2.5-pro", // Excellence rédactionnelle
  search_provider: "tavily"
};

// Extraction JSON robuste
function extractJSON(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON extraction failed:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audit_id } = await req.json();
    
    if (!audit_id) {
      throw new Error("audit_id requis");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Récupération Audit
    const { data: audit, error: auditError } = await supabase
      .from('pre_audits')
      .select('*, companies(*)')
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      throw new Error(`Audit introuvable: ${auditError?.message}`);
    }

    const companyName = audit.companies?.name || audit.company_guess || new URL(audit.url).hostname;
    console.log(`🚀 START DEEP RESEARCH V5: ${audit.url} (${companyName})`);

    // Mise à jour statut
    await supabase.from('pre_audits').update({
      status: 'ai_running',
      current_phase: 'deep_research',
      updated_at: new Date().toISOString()
    }).eq('id', audit_id);

    // =================================================================================
    // PHASE 1 : INVESTIGATION PROFONDE (La méthode Perplexity - Triple Recherche)
    // =================================================================================
    
    const searchQueries = [
      // Axe 1: Données Financières & Entreprise
      `"${companyName}" chiffre affaires CA résultats financiers société.com pappers.fr`,
      // Axe 2: Concurrents & Marché  
      `"${companyName}" concurrents principaux parts de marché secteur industrie benchmark`,
      // Axe 3: Réputation & Digital
      `"${companyName}" avis clients stratégie digitale e-commerce site web trustpilot`
    ];

    let knowledgeBase = "";
    let sourcesCollected: Array<{title: string, url: string, snippet: string}> = [];
    const tavilyKey = Deno.env.get("TAVILY_API_KEY");

    if (tavilyKey) {
      console.log("🕵️ Lancement des 3 agents de recherche parallèles...");
      
      // Recherches parallèles pour gain de temps massif
      const searchPromises = searchQueries.map((query, index) => 
        fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: query,
            search_depth: "advanced",
            include_domains: [
              "societe.com", "pappers.fr", "linkedin.com", "lesechos.fr", 
              "trustpilot.com", "glassdoor.fr", "wikipedia.org", "lefigaro.fr",
              "bfmtv.com", "capital.fr", "challenges.fr", "usinenouvelle.com"
            ],
            max_results: 5
          })
        })
        .then(res => res.json())
        .catch(err => {
          console.error(`Recherche ${index + 1} échouée:`, err);
          return { results: [] };
        })
      );

      const results = await Promise.all(searchPromises);
      
      const axeNames = ["DONNÉES FINANCIÈRES", "CONCURRENTS & MARCHÉ", "RÉPUTATION DIGITALE"];
      
      results.forEach((res, index) => {
        knowledgeBase += `\n\n=== AXE ${index + 1}: ${axeNames[index]} ===\n`;
        if (res.results && res.results.length > 0) {
          res.results.forEach((r: any) => {
            knowledgeBase += `\n[SOURCE: ${r.title}]\n${r.content}\n(URL: ${r.url})\n`;
            sourcesCollected.push({
              title: r.title || "Source",
              url: r.url || "",
              snippet: r.content?.substring(0, 200) || ""
            });
          });
          console.log(`✅ Axe ${index + 1}: ${res.results.length} sources collectées`);
        } else {
          knowledgeBase += `\nAucune source trouvée pour cet axe.\n`;
          console.log(`⚠️ Axe ${index + 1}: Aucune source`);
        }
      });
    } else {
      console.warn("⚠️ TAVILY_API_KEY non configurée - Recherche limitée");
      knowledgeBase = `Analyse basée sur l'URL: ${audit.url}`;
    }

    console.log(`📚 Base de connaissances: ${knowledgeBase.length} caractères, ${sourcesCollected.length} sources`);

    // =================================================================================
    // PHASE 2 : RAISONNEMENT STRATÉGIQUE (Le Cerveau GPT-5)
    // =================================================================================
    console.log("🧠 Phase 2: Analyse DeepThink (GPT-5)...");

    const strategyPrompt = `Tu es un Directeur Associé chez McKinsey spécialisé en transformation digitale B2B.

ENTREPRISE ANALYSÉE: ${companyName}
URL: ${audit.url}
SECTEUR: ${audit.companies?.industry || "Non spécifié"}

DONNÉES COLLECTÉES PAR NOS AGENTS DE RECHERCHE:
${knowledgeBase.substring(0, 25000)}

TA MISSION DE DIAGNOSTIC STRATÉGIQUE:

1. CHIFFRES CLÉS (3 minimum):
   - Extrait les données financières vérifiables (CA, effectifs, croissance)
   - Cite TOUJOURS la source entre crochets [Source: X]
   - Si non trouvé, indique "Données non publiques"

2. ANALYSE RACINE (Root Cause Analysis):
   - Identifie LE problème principal qui freine leur croissance digitale
   - Explique pourquoi c'est le levier prioritaire

3. BENCHMARK CONCURRENTIEL:
   - Liste 3-5 concurrents identifiés avec forces/faiblesses
   - Positionne l'entreprise sur une matrice

4. SCÉNARIOS STRATÉGIQUES (3):
   - CONSERVATEUR: Actions à faible risque, ROI garanti
   - RÉALISTE: Transformation progressive sur 12 mois  
   - RUPTURE: Stratégie audacieuse haute croissance

5. PLAN D'ACTION CHIFFRÉ:
   - Budget estimé par phase (en K€)
   - Timeline sur 12 mois minimum
   - KPIs de succès mesurables

Réponds en JSON structuré avec ces sections. Sois PRÉCIS et FACTUEL.`;

    const strategyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_CONFIG.model_reasoning,
        messages: [{ role: "user", content: strategyPrompt }],
        max_completion_tokens: 4000
      })
    });

    if (!strategyResponse.ok) {
      const errText = await strategyResponse.text();
      console.error("Erreur GPT-5:", errText);
      throw new Error(`Erreur modèle reasoning: ${strategyResponse.status}`);
    }

    const strategyData = await strategyResponse.json();
    const strategicBlueprint = strategyData.choices?.[0]?.message?.content || "";
    console.log("✅ Blueprint stratégique généré:", strategicBlueprint.length, "caractères");

    // =================================================================================
    // PHASE 3 : RÉDACTION FINALE & MISE EN FORME (La Plume Gemini Pro)
    // =================================================================================
    console.log("✍️ Phase 3: Rédaction Finale (Gemini 2.5 Pro)...");

    const draftingPrompt = `Tu es le rédacteur final d'un rapport d'audit stratégique B2B premium.

BLUEPRINT STRATÉGIQUE (Analyse préalable):
${strategicBlueprint}

ENTREPRISE: ${companyName}
URL: ${audit.url}

RÈGLES DE RÉDACTION IMPÉRATIVES:
- Ton: Professionnel, direct, niveau "C-Level" (pour PDG/DG)
- Citations: Chaque affirmation chiffrée DOIT avoir [Source: X]
- Qualité: Niveau rapport McKinsey/BCG
- Longueur: Executive Summary de 250+ mots

GÉNÈRE LE JSON FINAL EXACTEMENT DANS CE FORMAT:

{
  "executive_summary": "Synthèse stratégique complète de 250+ mots avec insights clés, chiffres et recommandations prioritaires. Mentionne les sources.",
  
  "key_figures": [
    {"label": "Chiffre d'affaires", "value": "X M€", "source": "Société.com 2024", "trend": "+/-X%"},
    {"label": "Effectifs", "value": "X employés", "source": "LinkedIn", "trend": "stable"},
    {"label": "Part de marché", "value": "X%", "source": "Étude sectorielle", "trend": "+X%"}
  ],
  
  "market_study": {
    "market_size": "X M€ [Source: ...]",
    "growth_trend": "+X% CAGR [Source: ...]",
    "competitors": [
      {"name": "Concurrent 1", "strength": "Force clé", "weakness": "Faiblesse"},
      {"name": "Concurrent 2", "strength": "Force clé", "weakness": "Faiblesse"}
    ],
    "pestel": {
      "political": "Impact réglementaire...",
      "economic": "Contexte macro...",
      "technological": "Tendances tech..."
    }
  },
  
  "scores": {
    "market": 75,
    "tech": 70,
    "ux": 65,
    "seo": 60,
    "conversion": 55
  },
  
  "swot": {
    "strengths": ["Force 1 avec détail", "Force 2 avec détail"],
    "weaknesses": ["Faiblesse 1 avec détail", "Faiblesse 2 avec détail"],
    "opportunities": ["Opportunité 1 avec détail", "Opportunité 2 avec détail"],
    "threats": ["Menace 1 avec détail", "Menace 2 avec détail"]
  },
  
  "root_cause": {
    "problem": "Le problème racine identifié",
    "impact": "Impact business quantifié",
    "priority": "Pourquoi c'est prioritaire"
  },
  
  "strategic_scenarios": [
    {
      "name": "Scénario Conservateur",
      "description": "Description détaillée 100+ mots",
      "budget": "50-100K€",
      "timeline": "6 mois",
      "roi": "+15% revenus",
      "risk": "Faible"
    },
    {
      "name": "Scénario Réaliste", 
      "description": "Description détaillée 100+ mots",
      "budget": "150-300K€",
      "timeline": "12 mois",
      "roi": "+40% revenus",
      "risk": "Modéré"
    },
    {
      "name": "Scénario Rupture",
      "description": "Description détaillée 100+ mots",
      "budget": "400-600K€",
      "timeline": "18-24 mois",
      "roi": "+100% revenus",
      "risk": "Élevé"
    }
  ],
  
  "action_plan": [
    {"phase": "Mois 1-2", "action": "Action détaillée", "budget": "XX K€", "kpi": "Métrique de succès"},
    {"phase": "Mois 3-4", "action": "Action détaillée", "budget": "XX K€", "kpi": "Métrique de succès"},
    {"phase": "Mois 5-6", "action": "Action détaillée", "budget": "XX K€", "kpi": "Métrique de succès"},
    {"phase": "Mois 7-12", "action": "Action détaillée", "budget": "XX K€", "kpi": "Métrique de succès"}
  ],
  
  "quick_wins": [
    {"action": "Quick win 1 réalisable en 2 semaines", "impact": "Impact attendu", "effort": "Faible"},
    {"action": "Quick win 2 réalisable en 2 semaines", "impact": "Impact attendu", "effort": "Faible"}
  ],
  
  "sources": [
    {"title": "Source 1", "url": "https://...", "reliability": 95},
    {"title": "Source 2", "url": "https://...", "reliability": 90}
  ]
}

IMPORTANT: Renvoie UNIQUEMENT le JSON valide, sans markdown ni commentaires.`;

    const draftingResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_CONFIG.model_drafting,
        messages: [
          { role: "system", content: "Tu es un expert en rédaction de rapports d'audit B2B niveau McKinsey. Tu génères du JSON valide uniquement." },
          { role: "user", content: draftingPrompt }
        ]
      })
    });

    if (!draftingResponse.ok) {
      const errText = await draftingResponse.text();
      console.error("Erreur Gemini:", errText);
      throw new Error(`Erreur modèle drafting: ${draftingResponse.status}`);
    }

    const draftingData = await draftingResponse.json();
    const rawContent = draftingData.choices?.[0]?.message?.content || "";
    
    // Extraction JSON robuste
    const finalJson = extractJSON(rawContent);
    
    if (!finalJson) {
      console.error("Échec parsing JSON final. Contenu brut:", rawContent.substring(0, 500));
      throw new Error("Impossible de parser le rapport final");
    }

    // Enrichir avec les sources collectées
    if (sourcesCollected.length > 0 && !finalJson.sources) {
      finalJson.sources = sourcesCollected.slice(0, 10).map(s => ({
        title: s.title,
        url: s.url,
        reliability: 85
      }));
    }

    console.log("✅ Rapport final généré avec succès");

    // =================================================================================
    // PHASE 4 : SAUVEGARDE & GÉNÉRATION HTML
    // =================================================================================
    
    // Calcul du score de confiance basé sur les sources
    const confidenceScore = Math.min(98, 70 + (sourcesCollected.length * 2));

    await supabase.from('pre_audits').update({
      status: 'consolidated',
      confidence: confidenceScore,
      consolidated: finalJson,
      raw_sources: { 
        knowledge_base: knowledgeBase.substring(0, 50000),
        sources_count: sourcesCollected.length,
        strategic_blueprint: strategicBlueprint.substring(0, 10000)
      },
      current_phase: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', audit_id);

    console.log(`💾 Audit sauvegardé. Confiance: ${confidenceScore}%`);

    // Génération du rapport HTML
    try {
      const htmlResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/audit-html?report_id=${audit_id}`,
        {
          headers: { 
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` 
          }
        }
      );
      
      if (htmlResponse.ok) {
        console.log("📄 Rapport HTML généré");
      } else {
        console.warn("⚠️ Génération HTML échouée:", await htmlResponse.text());
      }
    } catch (htmlErr) {
      console.error("Erreur génération HTML:", htmlErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        audit_id,
        confidence: confidenceScore,
        sources_count: sourcesCollected.length,
        message: "Deep Research V5 complété avec succès"
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Critical Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
