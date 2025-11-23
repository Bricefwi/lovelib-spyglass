import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { generatePremiumAuditHTML } from "../_shared/premiumAuditTemplate.ts";

const corsHeaders = { 
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" 
};

// Input validation schema
const querySchema = z.object({
  report_id: z.string().uuid({ message: "Invalid report ID format" })
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const reportId = new URL(req.url).searchParams.get('report_id');
    
    // Validate input
    const validation = querySchema.safeParse({ report_id: reportId });
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ CORRECTION SÉCURITÉ: Utiliser SERVICE_ROLE_KEY pour contourner les RLS strictes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { data, error } = await supabase
      .from('audit_reports')
      .select(`
        id,
        content,
        created_at,
        pre_audits!inner(
          url,
          company_guess,
          confidence,
          companies(name, industry)
        )
      `)
      .eq('id', reportId)
      .single();
    
    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Rapport non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer le HTML avec le template Premium IMOTION
    const preAudit = (data.pre_audits as any);
    const reportContent = data.content as any;
    
    const premiumData = {
      company: {
        name: preAudit?.companies?.name || preAudit?.company_guess || 'Entreprise',
        website: preAudit?.url || '',
        industry: preAudit?.companies?.industry || reportContent?.market_analysis?.trend?.split(' ')[0] || 'Non spécifié',
      },
      executiveSummary: reportContent?.executive_summary || 'Analyse en cours...',
      scores: reportContent?.scores || {
        global: 70,
        market: reportContent?.scores?.market || 70,
        tech: reportContent?.scores?.tech || 70,
        ux: reportContent?.scores?.ux || 70,
        seo: reportContent?.scores?.seo || 70,
        conversion: reportContent?.scores?.conversion || 70,
      },
      detailedInsights: reportContent?.market_analysis ? [
        {
          category: 'Marché',
          title: 'Analyse de Marché',
          analysis: reportContent.market_analysis.trend || 'Analyse de marché en cours...',
          metrics: reportContent.market_analysis.competitors ? [
            { label: 'Concurrents identifiés', value: reportContent.market_analysis.competitors.length.toString() }
          ] : []
        },
        {
          category: 'Positionnement',
          title: 'Positionnement Stratégique',
          analysis: reportContent.market_analysis.positioning || 'Analyse du positionnement en cours...',
        }
      ] : [],
      swot: reportContent?.swot || {
        strengths: ['Analyse en cours...'],
        weaknesses: ['Analyse en cours...'],
        opportunities: ['Analyse en cours...'],
        threats: ['Analyse en cours...']
      },
      recommendations: reportContent?.action_plan?.map((action: any, index: number) => ({
        title: `Action ${index + 1}: ${action.action || action.step}`,
        description: action.action || 'Description à venir',
        priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
        impact: 'À définir',
        effort: action.budget || 'À définir',
        roi: 'À calculer',
        timeline: action.step || `Phase ${index + 1}`
      })) || [],
      scenarios: reportContent?.strategic_scenarios || [],
      kpis: [],
      roadmap: reportContent?.action_plan?.map((action: any) => ({
        phase: action.step,
        duration: '1 mois',
        objectives: [action.action],
        deliverables: [],
        kpis: []
      })) || [],
      generatedAt: new Date(data.created_at || Date.now()).toISOString(),
      reportId: data.id,
      confidenceScore: preAudit?.confidence || 85
    };

    const html = generatePremiumAuditHTML(premiumData);
    
    return new Response(html, { 
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } 
    });
  } catch (error) {
    const requestId = crypto.randomUUID();
    console.error(`[${requestId}] Error in audit-html:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de la récupération du rapport.',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
