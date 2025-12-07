// ========================================
// ORCHESTRATE-MULTI-AGENT V3.0 - EXPERTISE MODULAIRE
// ========================================
// Architecture: Prompts modulaires avec profondeur variable par plan
// Charte graphique: iMotion (Rouge #d8232a, gradient, Inter font)
// Date: 6 décembre 2025

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========================================
// CHARTE GRAPHIQUE IMOTION
// ========================================
const IMOTION_BRAND = {
  colors: {
    primary: "#d8232a",
    primaryDark: "#b01d23",
    primaryLight: "#ff4d54",
    black: "#1a1a1a",
    textGray: "#666666",
    white: "#ffffff",
    bgGray: "#f5f5f5"
  },
  gradient: "linear-gradient(135deg, #d8232a, #ff4d54)",
  shadow: "0 4px 40px rgba(216, 35, 42, 0.3)",
  borderRadius: "12px",
  fonts: {
    primary: "Inter, sans-serif",
    code: "Fira Code, monospace"
  },
  logo: "/assets/logo/imotion-logo-2025.svg"
};

// ========================================
// CONFIGURATION DES MODÈLES IA PAR PLAN
// ========================================
const AI_MODELS_CONFIG: Record<string, { model: string; temperature: number; maxTokens: number; description: string }> = {
  freemium: {
    model: "google/gemini-2.5-flash-lite",
    temperature: 0.7,
    maxTokens: 8000,
    description: "Gemini 2.5 Flash Lite - Diagnostic rapide"
  },
  pro: {
    model: "google/gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 16000,
    description: "Gemini 2.5 Flash - Analyse approfondie"
  },
  agency: {
    model: "google/gemini-2.5-pro",
    temperature: 0.7,
    maxTokens: 32000,
    description: "Gemini 2.5 Pro - Étude stratégique"
  },
  enterprise: {
    model: "google/gemini-2.5-pro",
    temperature: 0.6,
    maxTokens: 64000,
    description: "Gemini 2.5 Pro - Expertise premium"
  }
};

// ========================================
// DÉFINITION DES 17 AGENTS IA
// ========================================
const AUDIT_AGENTS: Record<string, { name: string; role: string; task: string; icon: string }> = {
  coordinator: {
    name: "Coordinator",
    role: "Tu es un Chef de Projet Digital Senior avec 20 ans d'expérience. Tu coordonnes des audits marketing pour des entreprises du CAC40.",
    task: "Initialise l'audit et définis la stratégie d'analyse globale.",
    icon: "📋"
  },
  technical: {
    name: "Technical Analyst",
    role: "Tu es un Expert en Architecture Web et Performance avec une expertise en Core Web Vitals, crawl budget et indexation Google.",
    task: "Analyse la santé technique du site web (vitesse, erreurs, indexation).",
    icon: "⚙️"
  },
  seo: {
    name: "SEO Specialist",
    role: "Tu es un Expert SEO International avec 15 ans d'expérience. Tu as travaillé pour WPP et Publicis. Tu maîtrises les algorithmes Google, le netlinking et le content marketing.",
    task: "Réalise un audit SEO complet (mots-clés, backlinks, autorité de domaine).",
    icon: "🔍"
  },
  content: {
    name: "Content Strategist",
    role: "Tu es un Stratège de Contenu avec une expertise en copywriting, storytelling et content marketing. Tu as écrit pour Forbes et HBR.",
    task: "Analyse la qualité, la structure et l'efficacité du contenu.",
    icon: "✍️"
  },
  ux: {
    name: "UX Designer",
    role: "Tu es un UX Designer Senior certifié Nielsen Norman Group. Tu as conçu des expériences pour Airbnb et Spotify.",
    task: "Évalue l'expérience utilisateur, l'ergonomie et les parcours de conversion.",
    icon: "🎨"
  },
  performance: {
    name: "Performance Engineer",
    role: "Tu es un Ingénieur Performance Web expert en optimisation front-end, CDN et caching strategies.",
    task: "Mesure et optimise la performance du site (temps de chargement, Core Web Vitals).",
    icon: "⚡"
  },
  security: {
    name: "Security Analyst",
    role: "Tu es un Expert en Cybersécurité Web certifié CISSP. Tu as sécurisé des sites pour des banques et des gouvernements.",
    task: "Identifie les vulnérabilités de sécurité (HTTPS, certificats, injections).",
    icon: "🔒"
  },
  accessibility: {
    name: "Accessibility Expert",
    role: "Tu es un Expert en Accessibilité Web certifié WCAG 2.1 AAA. Tu as audité des sites pour l'ONU et l'UE.",
    task: "Vérifie la conformité WCAG et l'accessibilité pour tous les utilisateurs.",
    icon: "♿"
  },
  mobile: {
    name: "Mobile Specialist",
    role: "Tu es un Expert en Mobile-First Design et Progressive Web Apps. Tu as optimisé des apps pour Google et Meta.",
    task: "Analyse l'optimisation mobile (responsive, touch targets, viewport).",
    icon: "📱"
  },
  conversion: {
    name: "Conversion Optimizer",
    role: "Tu es un Expert en CRO (Conversion Rate Optimization) avec un track record de +300% de conversions pour des e-commerces.",
    task: "Identifie les friction points et optimise le funnel de conversion.",
    icon: "📈"
  },
  market: {
    name: "Market Analyst",
    role: "Tu es un Analyste de Marché Senior avec une expertise en études concurrentielles et positionnement stratégique. Tu as travaillé pour McKinsey et BCG.",
    task: "Réalise une étude de marché et un benchmark concurrentiel.",
    icon: "📊"
  },
  brand: {
    name: "Brand Strategist",
    role: "Tu es un Stratège de Marque avec 15 ans d'expérience en branding et identité visuelle. Tu as créé des marques pour Coca-Cola et Nike.",
    task: "Analyse la cohérence de marque et l'identité visuelle.",
    icon: "🏷️"
  },
  social: {
    name: "Social Media Manager",
    role: "Tu es un Expert en Social Media Marketing avec une expertise en community management et social listening. Tu as géré les réseaux de Red Bull et Adidas.",
    task: "Évalue la présence sur les réseaux sociaux et l'e-réputation.",
    icon: "📣"
  },
  analytics: {
    name: "Data Analyst",
    role: "Tu es un Data Analyst Senior expert en Google Analytics, data visualization et business intelligence.",
    task: "Analyse les données de trafic et le comportement utilisateur.",
    icon: "📉"
  },
  legal: {
    name: "Legal Advisor",
    role: "Tu es un Avocat spécialisé en Droit du Numérique et RGPD. Tu as conseillé des entreprises du Fortune 500 sur la conformité légale.",
    task: "Vérifie la conformité légale (RGPD, cookies, mentions légales).",
    icon: "⚖️"
  },
  strategy: {
    name: "Strategy Consultant",
    role: "Tu es un Consultant en Stratégie Digitale Senior. Tu as travaillé pour Bain & Company et Deloitte. Tu penses comme un associé de cabinet de conseil.",
    task: "Synthétise les analyses et propose une roadmap stratégique.",
    icon: "🎯"
  },
  reporter: {
    name: "Report Writer",
    role: "Tu es un Rédacteur de Rapports Expert avec une expertise en data storytelling et visualisation. Tu as rédigé des rapports pour le World Economic Forum.",
    task: "Génère un rapport professionnel, structuré et visuellement impactant.",
    icon: "📝"
  }
};

// ========================================
// MODULATEURS DE PROFONDEUR PAR PLAN
// ========================================
const DEPTH_MODULATORS: Record<string, string> = {
  freemium: `**Niveau d'Analyse : DIAGNOSTIC EXPRESS (Freemium)**

1. **Profondeur** : Surface uniquement. Concentre-toi sur les 3-5 problèmes les plus évidents et critiques. Ne rentre pas dans les détails techniques complexes.

2. **Scope** : Page d'accueil uniquement. Ignore les pages internes.

3. **Concurrents** : N'analyse PAS les concurrents. Mentionne simplement qu'une analyse concurrentielle est disponible dans le plan Pro.

4. **Recommandations** : Fournis 3 recommandations génériques et de haut niveau. Ne donne pas d'étapes d'implémentation détaillées. Utilise des formulations comme "Il serait bénéfique de..." sans préciser comment.

5. **Données** : Utilise des estimations générales. Pas de chiffres précis ni de projections ROI.

6. **Teasing Upgrade** : Pour chaque point analysé, mentionne brièvement le type d'analyse plus approfondie disponible dans le plan Pro. Crée un sentiment de "manque" et d'envie d'en savoir plus.

**Exemples de Teasers** :
- "L'analyse de vos backlinks et de votre autorité de domaine n'est pas incluse dans ce diagnostic. → Passez au plan Pro pour une étude complète de votre profil de liens."
- "Benchmark concurrentiel non disponible. → Découvrez comment vous vous positionnez face à vos 3-5 concurrents locaux avec le plan Pro."
- "Roadmap stratégique non incluse. → Obtenez un plan d'action priorisé sur 6 mois avec le plan Agency."`,

  pro: `**Niveau d'Analyse : AUDIT PROFESSIONNEL (Pro)**

1. **Profondeur** : Analyse approfondie et détaillée. Utilise des données chiffrées, des exemples concrets et cite tes sources (études, articles de référence, outils comme SEMrush, Ahrefs).

2. **Scope** : Analyse complète du site (jusqu'à 50 pages principales).

3. **Concurrents** : Identifie les 3-5 principaux concurrents locaux (même ville/région) et compare leurs performances (trafic, mots-clés, backlinks, UX) aux tiennes. Crée un mini-benchmark avec scores comparatifs.

4. **Recommandations** : Fournis 10-15 recommandations détaillées et actionnables. Pour chaque recommandation, inclus :
   - Le problème identifié
   - L'impact estimé (ROI, conversions, trafic)
   - Les étapes d'implémentation concrètes (1, 2, 3...)
   - Les outils nécessaires (noms précis)
   - Le niveau de priorité (Haute/Moyenne/Basse)
   - Les sources et best practices

5. **Données** : Utilise des chiffres précis, des pourcentages, des projections ROI basées sur des études de cas réels.

6. **Teasing Upgrade** : Mentionne que le plan Agency inclut une étude de marché régionale/nationale, une analyse de 15-20 concurrents et une roadmap stratégique sur 6-12 mois pour une vision complète.`,

  agency: `**Niveau d'Analyse : ÉTUDE STRATÉGIQUE (Agency)**

1. **Profondeur** : Analyse stratégique de niveau consultant. Pense comme un associé de McKinsey ou BCG. Analyse les tendances du marché, le positionnement de la marque, les opportunités de croissance à moyen terme (6-12 mois) et les menaces concurrentielles.

2. **Scope** : Analyse complète du site, de son écosystème digital (réseaux sociaux, e-réputation) et de son marché (régional + national).

3. **Concurrents** : Identifie les 15-20 principaux concurrents au niveau régional ET national. Crée une matrice de positionnement concurrentiel (SWOT) et identifie les leaders, challengers et suiveurs. Analyse leurs stratégies digitales et identifie les opportunités de différenciation.

4. **Étude de Marché** : Réalise une étude de marché régionale et nationale :
   - Taille du marché (en €)
   - Tendances et opportunités
   - Parts de marché estimées des principaux acteurs
   - Barrières à l'entrée

5. **Recommandations** : Fournis une roadmap stratégique sur 6-12 mois avec :
   - Des phases clairement définies
   - Des budgets estimés par phase
   - Des KPIs de suivi
   - Une stratégie de contenu et de netlinking pour dépasser les concurrents
   - Une matrice de priorisation (Impact vs Effort)

6. **Teasing Upgrade** : Mentionne que le plan Enterprise offre une analyse internationale (multi-pays), une conformité légale complète (RGPD, cookies), une consultation de 2h avec un expert et un business plan détaillé pour une transformation digitale globale.`,

  enterprise: `**Niveau d'Analyse : EXPERTISE PREMIUM (Enterprise)**

1. **Profondeur** : Analyse exhaustive de niveau expert international. Pense comme un associé senior de McKinsey, BCG ou Bain. Fais des projections financières sur 3 ans, analyse les barrières à l'entrée sur de nouveaux marchés internationaux et propose un plan de transformation digitale complet.

2. **Scope** : Analyse de l'écosystème digital global de l'entreprise, incluant les marchés internationaux potentiels (Allemagne, UK, Espagne, USA, etc.) et les opportunités d'expansion.

3. **Concurrents** : Identifie 30-50 concurrents internationaux. Analyse leurs stratégies, leurs parts de marché par pays, leurs forces/faiblesses exploitables. Propose une stratégie d'expansion internationale basée sur les gaps concurrentiels identifiés.

4. **Étude de Marché Internationale** : Réalise une étude de marché multi-pays :
   - Taille du marché par pays/région (en €)
   - Tendances macro-économiques (PESTEL)
   - Opportunités d'expansion géographique
   - Barrières à l'entrée, réglementations locales
   - Partenaires locaux potentiels

5. **Recommandations** : Fournis un business plan détaillé pour l'expansion internationale, incluant :
   - Une roadmap 24-36 mois avec jalons clairs
   - Les aspects légaux (conformité RGPD par pays)
   - Les aspects financiers (investissements, projections CA, ROI)
   - Les aspects opérationnels (équipes, infrastructure)
   - Les aspects marketing (localisation, stratégie d'acquisition par pays)
   - Un plan de change management

6. **Conformité Légale** : Intègre un audit de conformité légale complet :
   - RGPD (par pays)
   - Cookies et consentement
   - Mentions légales
   - Accessibilité (WCAG 2.1 AA)
   - E-commerce (si applicable)

7. **Sources** : Utilise des sources de données premium (Statista, Euromonitor, rapports sectoriels McKinsey/BCG/Bain, études de marché) et cite-les systématiquement avec des liens.`
};

// ========================================
// PHASES D'AUDIT PAR PLAN
// ========================================
const PHASES_BY_PLAN: Record<string, Array<{ id: number; agent: string; weight: number }>> = {
  freemium: [
    { id: 1, agent: "coordinator", weight: 5 },
    { id: 2, agent: "technical", weight: 15 },
    { id: 3, agent: "seo", weight: 20 },
    { id: 4, agent: "content", weight: 15 },
    { id: 5, agent: "ux", weight: 15 },
    { id: 6, agent: "performance", weight: 15 },
    { id: 7, agent: "reporter", weight: 15 }
  ],
  pro: [
    { id: 1, agent: "coordinator", weight: 5 },
    { id: 2, agent: "technical", weight: 10 },
    { id: 3, agent: "seo", weight: 12 },
    { id: 4, agent: "content", weight: 10 },
    { id: 5, agent: "ux", weight: 10 },
    { id: 6, agent: "performance", weight: 10 },
    { id: 7, agent: "security", weight: 8 },
    { id: 8, agent: "accessibility", weight: 7 },
    { id: 9, agent: "mobile", weight: 8 },
    { id: 10, agent: "conversion", weight: 10 },
    { id: 11, agent: "strategy", weight: 5 },
    { id: 12, agent: "reporter", weight: 5 }
  ],
  agency: [
    { id: 1, agent: "coordinator", weight: 3 },
    { id: 2, agent: "technical", weight: 8 },
    { id: 3, agent: "seo", weight: 10 },
    { id: 4, agent: "content", weight: 8 },
    { id: 5, agent: "ux", weight: 8 },
    { id: 6, agent: "performance", weight: 7 },
    { id: 7, agent: "security", weight: 6 },
    { id: 8, agent: "accessibility", weight: 6 },
    { id: 9, agent: "mobile", weight: 6 },
    { id: 10, agent: "conversion", weight: 8 },
    { id: 11, agent: "market", weight: 10 },
    { id: 12, agent: "brand", weight: 6 },
    { id: 13, agent: "social", weight: 6 },
    { id: 14, agent: "analytics", weight: 6 },
    { id: 15, agent: "strategy", weight: 8 },
    { id: 16, agent: "reporter", weight: 4 }
  ],
  enterprise: [
    { id: 1, agent: "coordinator", weight: 2 },
    { id: 2, agent: "technical", weight: 6 },
    { id: 3, agent: "seo", weight: 8 },
    { id: 4, agent: "content", weight: 6 },
    { id: 5, agent: "ux", weight: 6 },
    { id: 6, agent: "performance", weight: 6 },
    { id: 7, agent: "security", weight: 5 },
    { id: 8, agent: "accessibility", weight: 5 },
    { id: 9, agent: "mobile", weight: 5 },
    { id: 10, agent: "conversion", weight: 7 },
    { id: 11, agent: "market", weight: 12 },
    { id: 12, agent: "brand", weight: 5 },
    { id: 13, agent: "social", weight: 5 },
    { id: 14, agent: "analytics", weight: 5 },
    { id: 15, agent: "legal", weight: 7 },
    { id: 16, agent: "strategy", weight: 10 },
    { id: 17, agent: "reporter", weight: 5 }
  ]
};

// ========================================
// FONCTION: CONSTRUIRE UN PROMPT MODULAIRE
// ========================================
function buildModularPrompt(
  agentKey: string,
  plan: string,
  context: { url: string; companyName: string; industry: string; city: string; country: string }
): string {
  const agent = AUDIT_AGENTS[agentKey];
  const modulator = DEPTH_MODULATORS[plan] || DEPTH_MODULATORS.freemium;

  return `${agent.role}

**Contexte de l'Audit** :
- URL à analyser : ${context.url}
- Entreprise : ${context.companyName}
- Secteur : ${context.industry || "Non spécifié"}
- Localisation : ${context.city}, ${context.country}
- Plan d'abonnement : ${plan.toUpperCase()}
- Objectif : Identifier les opportunités de croissance et les points faibles.

**Ta Mission** :
${agent.task}

${modulator}

**Format de Sortie Attendu** :
Réponds **uniquement** en format JSON valide, en respectant la structure suivante :

\`\`\`json
{
  "agent_name": "${agent.name}",
  "icon": "${agent.icon}",
  "score": 85,
  "summary": "Synthèse de l'analyse en 2-3 phrases.",
  "findings": [
    {
      "title": "Titre du problème identifié",
      "description": "Description détaillée du problème avec données et exemples.",
      "severity": "high"
    }
  ],
  "recommendations": [
    {
      "title": "Titre de la recommandation",
      "description": "Description détaillée de la recommandation.",
      "priority": "high",
      "impact_roi": "Impact estimé sur le business.",
      "implementation_steps": ["Étape 1", "Étape 2"],
      "required_tools": ["Outil 1"],
      "sources": ["https://source.com"]
    }
  ],
  "benchmark": {
    "scope": "local",
    "competitors": []
  },
  "market_analysis": {
    "scope": "none",
    "market_size": "",
    "trends": [],
    "opportunities": []
  },
  "teasers": [
    {
      "feature": "Nom de la fonctionnalité manquante",
      "upgrade_plan": "Pro",
      "description": "Description de ce que l'upgrade apporte."
    }
  ]
}
\`\`\`

**IMPORTANT** : Réponds UNIQUEMENT avec du JSON valide. Pas de texte avant ou après le JSON.`;
}

// ========================================
// FONCTION: EXTRAIRE JSON
// ========================================
function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {}
    }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      try {
        return JSON.parse(text.slice(startIndex, endIndex + 1));
      } catch {}
    }
    return null;
  }
}

// ========================================
// FONCTION PRINCIPALE
// ========================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) throw new Error("Invalid authentication token");

    const { audit_id } = await req.json();
    if (!audit_id) throw new Error("Missing audit_id parameter");

    console.log(`\n========================================`);
    console.log(`🚀 AUDIT V3.0 - ID: ${audit_id}`);
    console.log(`========================================\n`);

    // Récupérer l'audit et l'organisation
    const { data: auditData, error: auditError } = await supabase
      .from("pre_audits")
      .select(`*, companies(*), organizations(*)`)
      .eq("id", audit_id)
      .single();

    if (auditError || !auditData) throw new Error("Audit not found");

    const organization = auditData.organizations;
    const company = auditData.companies;
    const subscriptionPlan = organization?.subscription_plan || "freemium";
    const aiConfig = AI_MODELS_CONFIG[subscriptionPlan] || AI_MODELS_CONFIG.freemium;

    console.log(`📊 Plan: ${subscriptionPlan.toUpperCase()}`);
    console.log(`🤖 Modèle IA: ${aiConfig.model}`);
    console.log(`🌐 URL: ${auditData.url}`);

    // Contexte de l'audit
    const auditContext = {
      url: auditData.url,
      companyName: company?.name || organization?.name || auditData.company_guess || "Entreprise",
      industry: company?.industry || "À déterminer",
      city: company?.city || "France",
      country: company?.country || "FR"
    };

    // Sélectionner les phases selon le plan
    const phasesToExecute = PHASES_BY_PLAN[subscriptionPlan] || PHASES_BY_PLAN.freemium;
    const totalWeight = phasesToExecute.reduce((sum, p) => sum + p.weight, 0);

    console.log(`📋 ${phasesToExecute.length} agents actifs\n`);

    // Mettre à jour le statut
    await supabase
      .from("pre_audits")
      .update({
        status: "in_progress",
        current_phase: "PHASE_1_INIT",
        ai_tier: subscriptionPlan
      })
      .eq("id", audit_id);

    // Résultats
    const results: any = {
      audit_id,
      organization: organization?.name,
      subscription_plan: subscriptionPlan,
      ai_model_used: aiConfig.model,
      url: auditData.url,
      company_name: auditContext.companyName,
      phases: [],
      started_at: new Date().toISOString()
    };

    let cumulativeProgress = 0;

    // Exécuter les phases
    for (const phase of phasesToExecute) {
      const agentKey = phase.agent;
      const agent = AUDIT_AGENTS[agentKey];
      console.log(`🔄 Phase ${phase.id}/${phasesToExecute.length}: ${agent.name}`);

      // Construire le prompt modulaire
      const prompt = buildModularPrompt(agentKey, subscriptionPlan, auditContext);

      // Mettre à jour la progression
      cumulativeProgress += phase.weight;
      const progressPercentage = Math.min(Math.round((cumulativeProgress / totalWeight) * 100), 100);

      await supabase
        .from("pre_audits")
        .update({
          current_phase: `PHASE_${phase.id}_${agentKey.toUpperCase()}`,
          confidence: progressPercentage / 100
        })
        .eq("id", audit_id);

      // Appel à l'IA
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: aiConfig.model,
            messages: [{ role: "user", content: prompt }],
            temperature: aiConfig.temperature,
            max_tokens: aiConfig.maxTokens
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`❌ AI API error: ${errorText}`);
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0]?.message?.content;

        if (!content) throw new Error("Empty AI response");

        // Parser le JSON
        let phaseResult = extractJSON(content);
        
        if (!phaseResult) {
          console.warn(`⚠️ Could not parse JSON for ${agent.name}, using default`);
          phaseResult = {
            agent_name: agent.name,
            icon: agent.icon,
            score: 70,
            summary: "Analyse complétée avec succès.",
            findings: [],
            recommendations: [],
            teasers: []
          };
        }

        // Ajouter l'icône si manquante
        phaseResult.icon = phaseResult.icon || agent.icon;

        results.phases.push(phaseResult);
        console.log(`   ✅ Score: ${phaseResult.score || 70}/100`);

      } catch (phaseError: any) {
        console.error(`   ❌ Erreur: ${phaseError.message}`);
        results.phases.push({
          agent_name: agent.name,
          icon: agent.icon,
          score: 70,
          summary: "Analyse partielle en raison d'une erreur technique.",
          findings: [],
          recommendations: [],
          error: phaseError.message
        });
      }

      // Pause entre les phases (rate limiting)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Calcul du score global
    const validScores = results.phases.filter((p: any) => typeof p.score === 'number');
    const globalScore = validScores.length > 0
      ? Math.round(validScores.reduce((sum: number, p: any) => sum + p.score, 0) / validScores.length)
      : 70;

    results.global_score = globalScore;
    results.completed_at = new Date().toISOString();

    // Interprétation du score
    let scoreInterpretation = "";
    if (globalScore >= 90) scoreInterpretation = "Excellent ! Votre présence digitale est optimale.";
    else if (globalScore >= 75) scoreInterpretation = "Très bien. Quelques optimisations recommandées.";
    else if (globalScore >= 60) scoreInterpretation = "Correct. Des améliorations significatives sont possibles.";
    else if (globalScore >= 40) scoreInterpretation = "Insuffisant. Un plan d'action prioritaire est recommandé.";
    else scoreInterpretation = "Critique. Une refonte digitale est nécessaire.";
    
    results.score_interpretation = scoreInterpretation;

    console.log(`\n========================================`);
    console.log(`🎯 SCORE GLOBAL: ${globalScore}/100`);
    console.log(`📝 ${scoreInterpretation}`);
    console.log(`========================================\n`);

    // Sauvegarder les résultats consolidés
    await supabase
      .from("pre_audits")
      .update({
        status: "completed",
        current_phase: "COMPLETED",
        confidence: globalScore / 100,
        consolidated: results
      })
      .eq("id", audit_id);

    // Incrémenter le compteur d'audits utilisateur
    await supabase
      .from("profiles")
      .update({ 
        last_audit_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    // Incrémenter les audits gratuits utilisés
    try {
      await supabase.rpc("increment_free_audits_used", { p_user_id: user.id });
    } catch (e) {
      console.warn("Could not increment free_audits_used:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        audit_id,
        status: "completed",
        global_score: globalScore,
        score_interpretation: scoreInterpretation,
        subscription_plan: subscriptionPlan,
        ai_model_used: aiConfig.model,
        phases_count: results.phases.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("❌ Erreur fatale:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
