// ============================================
// MIGRATION ANALYZER & DIGITAL TRANSFORMATION
// ============================================
// Enterprise-grade migration planning and digital transformation roadmap

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MigrationAnalysisRequest {
  auditId: string;
  url: string;
  companyName: string;
  currentStack?: string[];
  businessGoals?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { auditId, url, companyName, currentStack, businessGoals }: MigrationAnalysisRequest = await req.json();

    console.log(`🚀 Migration Analysis for ${companyName}`);

    // Step 1: Analyze current technical stack
    const stackAnalysis = await analyzeCurrentStack(url, currentStack);
    console.log(`✅ Stack analyzed: ${stackAnalysis.technologies.length} technologies identified`);

    // Step 2: Identify technical debt and risks
    const technicalDebt = await assessTechnicalDebt(stackAnalysis);
    console.log(`⚠️ Technical debt score: ${technicalDebt.score}/100`);

    // Step 3: Generate modernization recommendations
    const modernizationPlan = await generateModernizationPlan(stackAnalysis, technicalDebt, businessGoals);
    console.log(`📋 ${modernizationPlan.opportunities.length} modernization opportunities identified`);

    // Step 4: Create detailed migration roadmap
    const migrationRoadmap = await createMigrationRoadmap(stackAnalysis, modernizationPlan);
    console.log(`🗺️ Migration roadmap created: ${migrationRoadmap.phases.length} phases`);

    // Step 5: Calculate ROI and business case
    const businessCase = await calculateROI(stackAnalysis, modernizationPlan, migrationRoadmap);
    console.log(`💰 Expected ROI: ${businessCase.roi_percentage}%`);

    // Save results to database
    const result = {
      stack_analysis: stackAnalysis,
      technical_debt: technicalDebt,
      modernization_plan: modernizationPlan,
      migration_roadmap: migrationRoadmap,
      business_case: businessCase,
      generated_at: new Date().toISOString()
    };

    await supabase
      .from('pre_audits')
      .update({ 
        migration_analysis: result,
        updated_at: new Date().toISOString()
      })
      .eq('id', auditId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Migration Analysis error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function analyzeCurrentStack(url: string, providedStack?: string[]): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `Tu es un Architecte Technique Senior (ex-CTO Fortune 500).

Analyse la stack technique du site : ${url}
${providedStack ? `Stack déclarée : ${providedStack.join(', ')}` : ''}

Identifie et analyse toutes les technologies utilisées (frontend, backend, infrastructure, outils).

Fournis une analyse complète en JSON :
{
  "technologies": [
    {
      "name": "string",
      "category": "frontend|backend|database|infrastructure|devops|analytics|security",
      "version": "string (si détectable)",
      "status": "modern|current|outdated|legacy|obsolete",
      "adoption_level": "mainstream|emerging|declining",
      "support_status": "active|maintenance|deprecated|eol",
      "security_concerns": ["concern 1", ...],
      "performance_impact": "positive|neutral|negative",
      "scalability_rating": 0-10,
      "maintainability_rating": 0-10,
      "replacement_urgency": "high|medium|low|none",
      "recommended_alternatives": ["alternative 1", ...]
    }
  ],
  "architecture_pattern": "monolith|microservices|serverless|hybrid",
  "hosting_type": "on-premise|cloud|hybrid",
  "cloud_provider": "AWS|Azure|GCP|Other|None",
  "overall_maturity_score": 0-100,
  "key_strengths": ["strength 1", ...],
  "critical_weaknesses": ["weakness 1", ...],
  "immediate_risks": ["risk 1", ...]
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse stack analysis");
  } catch (error: any) {
    console.error("Stack analysis error:", error.message);
    throw error;
  }
}

async function assessTechnicalDebt(stackAnalysis: any): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `Tu es un Expert en Dette Technique et Qualité Logicielle.

Basé sur cette analyse de stack :
${JSON.stringify(stackAnalysis, null, 2)}

Évalue la dette technique et fournis une analyse en JSON :
{
  "score": 0-100,
  "level": "low|moderate|high|critical",
  "categories": {
    "code_quality": {"score": 0-100, "issues": ["issue 1", ...]},
    "security": {"score": 0-100, "vulnerabilities": ["vuln 1", ...]},
    "performance": {"score": 0-100, "bottlenecks": ["bottleneck 1", ...]},
    "scalability": {"score": 0-100, "limitations": ["limit 1", ...]},
    "maintainability": {"score": 0-100, "concerns": ["concern 1", ...]},
    "documentation": {"score": 0-100, "gaps": ["gap 1", ...]}
  },
  "critical_issues": [
    {
      "title": "string",
      "severity": "critical|high|medium|low",
      "description": "string",
      "impact": "string",
      "remediation_effort": "string",
      "estimated_cost": "string"
    }
  ],
  "estimated_remediation_cost": "string",
  "estimated_remediation_time": "string"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse technical debt assessment");
  } catch (error: any) {
    console.error("Technical debt assessment error:", error.message);
    throw error;
  }
}

async function generateModernizationPlan(
  stackAnalysis: any,
  technicalDebt: any,
  businessGoals?: string[]
): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `Tu es un Directeur de la Transformation Digitale (ex-CTO Fortune 500).

Basé sur :
**Stack actuelle :**
${JSON.stringify(stackAnalysis, null, 2)}

**Dette technique :**
${JSON.stringify(technicalDebt, null, 2)}

**Objectifs business :**
${businessGoals ? businessGoals.join(', ') : 'Amélioration générale'}

Génère un plan de modernisation complet en JSON :
{
  "opportunities": [
    {
      "id": "string",
      "title": "string",
      "description": "string (600+ mots, très détaillé)",
      "category": "cloud_migration|microservices|api_modernization|frontend_refresh|database_upgrade|security_enhancement|devops_automation",
      "current_state": "string",
      "target_state": "string",
      "benefits": ["benefit 1", ...],
      "business_value": "string",
      "technical_value": "string",
      "investment_required": "string",
      "roi_estimate": "string",
      "payback_period": "string",
      "timeline": "string",
      "complexity": "low|medium|high",
      "risk_level": "low|medium|high",
      "dependencies": ["dependency 1", ...],
      "success_criteria": ["criterion 1", ...]
    }
  ],
  "quick_wins": [
    {
      "title": "string",
      "description": "string",
      "effort": "string",
      "impact": "string",
      "timeline": "string"
    }
  ],
  "strategic_initiatives": [
    {
      "title": "string",
      "description": "string",
      "timeline": "string",
      "investment": "string",
      "expected_roi": "string"
    }
  ],
  "recommended_priorities": ["priority 1", "priority 2", ...]
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 6000
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse modernization plan");
  } catch (error: any) {
    console.error("Modernization plan generation error:", error.message);
    throw error;
  }
}

async function createMigrationRoadmap(stackAnalysis: any, modernizationPlan: any): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `Tu es un Chef de Projet Transformation Digitale (PMP, Agile Coach).

Basé sur le plan de modernisation :
${JSON.stringify(modernizationPlan, null, 2)}

Crée une roadmap de migration détaillée en JSON :
{
  "phases": [
    {
      "phase_number": 1,
      "name": "string",
      "duration": "string",
      "start_date": "relative (ex: Month 1)",
      "end_date": "relative (ex: Month 3)",
      "objectives": ["objective 1", ...],
      "deliverables": ["deliverable 1", ...],
      "activities": [
        {
          "name": "string",
          "description": "string",
          "duration": "string",
          "resources_required": ["resource 1", ...],
          "dependencies": ["dependency 1", ...]
        }
      ],
      "milestones": ["milestone 1", ...],
      "risks": [
        {
          "risk": "string",
          "probability": "low|medium|high",
          "impact": "low|medium|high",
          "mitigation": "string"
        }
      ],
      "estimated_cost": "string",
      "success_criteria": ["criterion 1", ...]
    }
  ],
  "total_duration": "string",
  "total_investment": "string",
  "critical_path": ["activity 1", "activity 2", ...],
  "resource_requirements": {
    "internal_team": ["role 1", ...],
    "external_consultants": ["role 1", ...],
    "tools_and_licenses": ["tool 1", ...]
  },
  "governance": {
    "steering_committee": "string",
    "project_manager": "string",
    "reporting_frequency": "string",
    "decision_making_process": "string"
  }
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 5000
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse migration roadmap");
  } catch (error: any) {
    console.error("Migration roadmap creation error:", error.message);
    throw error;
  }
}

async function calculateROI(stackAnalysis: any, modernizationPlan: any, migrationRoadmap: any): Promise<any> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `Tu es un Analyste Financier spécialisé en ROI IT.

Basé sur :
- Roadmap de migration : ${JSON.stringify(migrationRoadmap, null, 2)}
- Plan de modernisation : ${JSON.stringify(modernizationPlan, null, 2)}

Calcule le ROI et le business case en JSON :
{
  "investment_breakdown": {
    "software_licenses": "string",
    "infrastructure": "string",
    "consulting_services": "string",
    "internal_resources": "string",
    "training": "string",
    "contingency": "string",
    "total_investment": "string"
  },
  "expected_benefits": {
    "cost_savings": {
      "infrastructure_reduction": "string/year",
      "maintenance_reduction": "string/year",
      "license_optimization": "string/year",
      "productivity_gains": "string/year",
      "total_annual_savings": "string"
    },
    "revenue_opportunities": {
      "faster_time_to_market": "string",
      "new_capabilities": "string",
      "customer_experience_improvement": "string",
      "estimated_revenue_uplift": "string/year"
    },
    "risk_mitigation": {
      "security_improvement": "string",
      "compliance_assurance": "string",
      "business_continuity": "string",
      "value_estimate": "string"
    }
  },
  "roi_calculation": {
    "total_investment": "string",
    "year_1_benefits": "string",
    "year_2_benefits": "string",
    "year_3_benefits": "string",
    "cumulative_3_year_benefits": "string",
    "net_present_value": "string",
    "roi_percentage": "string",
    "payback_period": "string",
    "break_even_point": "string"
  },
  "intangible_benefits": ["benefit 1", ...],
  "recommendation": "string (synthèse exécutive, 300+ mots)"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse ROI calculation");
  } catch (error: any) {
    console.error("ROI calculation error:", error.message);
    throw error;
  }
}
