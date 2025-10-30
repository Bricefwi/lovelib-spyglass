import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdvancedReportRequest {
  pre_audit_id: string;
  orchestration_id: string;
  results: {
    phases: any[];
    synthesis: any;
    confidence: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pre_audit_id, orchestration_id, results }: AdvancedReportRequest = await req.json();
    
    console.log(`Generating advanced HTML report for pre_audit: ${pre_audit_id}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch pre-audit data
    const { data: preAudit, error: preAuditError } = await supabase
      .from('pre_audits')
      .select('*, companies(*)')
      .eq('id', pre_audit_id)
      .single();

    if (preAuditError) throw preAuditError;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    // Use Claude to generate advanced HTML report
    const prompt = `Tu es un expert en transformation digitale. Génère un rapport HTML professionnel et détaillé basé sur l'analyse multi-agent suivante.

ENTREPRISE: ${preAudit.companies?.name || preAudit.company_guess}
URL: ${preAudit.url}
SECTEUR: ${preAudit.companies?.industry || 'Non spécifié'}

RÉSULTATS DE L'ANALYSE MULTI-AGENT:
${JSON.stringify(results, null, 2)}

Le rapport doit contenir:
1. En-tête avec logo IMOTION et branding
2. Executive Summary (synthèse des insights clés)
3. Analyse détaillée par phase:
   - Recherche de marché
   - Audits conversationnels (Marketing, Sales, Tech, Stratégie)
   - Analyses spécialisées (SEO, Contenu, UX, Conversion)
4. Synthèse finale avec recommandations prioritaires
5. Scores de maturité digitale (si disponibles)
6. Roadmap recommandée
7. Footer avec coordonnées IMOTION

Style: Professionnel, moderne, avec des sections clairement délimitées, des icônes, et une hiérarchie visuelle claire.
Couleurs: Utilise un gradient violet/bleu (#667eea, #764ba2) pour les en-têtes.

IMPORTANT: Génère UNIQUEMENT le code HTML complet, sans commentaires, sans markdown. Le HTML doit être prêt à être affiché directement.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const htmlContent = data.content[0].text;

    // Save the advanced report
    const { data: report, error: reportError } = await supabase
      .from('audit_reports')
      .insert({
        pre_audit_id,
        title: `Rapport Multi-Agent - ${preAudit.companies?.name || preAudit.company_guess}`,
        html: htmlContent,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    console.log(`Advanced report created with ID: ${report.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      report_id: report.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in audit-html-advanced function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
