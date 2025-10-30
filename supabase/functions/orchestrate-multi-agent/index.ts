import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestrationRequest {
  preAuditId: string;
  url: string;
  companyInfo?: any;
}

interface AgentPhase {
  name: string;
  order: number;
  agents: string[];
  systemPrompt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preAuditId, url, companyInfo }: OrchestrationRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting multi-agent orchestration for pre-audit: ${preAuditId}`);

    // Create orchestration record
    const { data: orchestration, error: orchError } = await supabase
      .from('agent_orchestrations')
      .insert({
        pre_audit_id: preAuditId,
        status: 'running',
        started_at: new Date().toISOString(),
        current_phase: 'market_research',
        progress: 0,
        phases: [
          { name: 'market_research', order: 1, status: 'pending' },
          { name: 'conversational_audits', order: 2, status: 'pending' },
          { name: 'specialized_analysis', order: 3, status: 'pending' },
          { name: 'synthesis', order: 4, status: 'pending' }
        ]
      })
      .select()
      .single();

    if (orchError) {
      console.error('Error creating orchestration:', orchError);
      throw orchError;
    }

    console.log('Orchestration created:', orchestration.id);

    // Define agent phases with specialized prompts
    const phases: AgentPhase[] = [
      {
        name: 'market_research',
        order: 1,
        agents: ['market_researcher', 'competitor_analyst', 'trend_analyzer'],
        systemPrompt: `Tu es un analyste de marché expert. Analyse le site ${url} et fournis:
1. Position sur le marché
2. Principaux concurrents
3. Tendances du secteur
4. Opportunités de croissance
Sois concis et factuel.`
      },
      {
        name: 'conversational_audits',
        order: 2,
        agents: ['marketing_auditor', 'sales_auditor', 'tech_auditor', 'strategy_auditor'],
        systemPrompt: `Tu es un auditeur expert en marketing digital, ventes, technologie et stratégie. Analyse ${url} et fournis:
1. Efficacité marketing actuelle
2. Performance commerciale
3. Stack technique
4. Alignement stratégique
Identifie les points forts et axes d'amélioration.`
      },
      {
        name: 'specialized_analysis',
        order: 3,
        agents: ['seo_specialist', 'content_analyzer', 'ux_auditor', 'conversion_optimizer'],
        systemPrompt: `Tu es un spécialiste en SEO, contenu, UX et conversion. Analyse ${url} pour:
1. Optimisation SEO
2. Qualité du contenu
3. Expérience utilisateur
4. Taux de conversion
Fournis des recommandations concrètes.`
      }
    ];

    // Process each phase sequentially
    for (const phase of phases) {
      console.log(`Starting phase: ${phase.name}`);
      
      // Update current phase
      await supabase
        .from('agent_orchestrations')
        .update({
          current_phase: phase.name,
          progress: (phase.order / phases.length) * 100
        })
        .eq('id', orchestration.id);

      // Call Lovable AI for this phase
      const aiResponse = await fetch('https://api.lovable.app/v1/ai/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages: [
            { role: 'system', content: phase.systemPrompt },
            { role: 'user', content: `Analyse approfondie pour: ${JSON.stringify(companyInfo || {})}` }
          ],
          max_tokens: 2000
        }),
      });

      if (!aiResponse.ok) {
        const error = await aiResponse.text();
        console.error(`AI error in phase ${phase.name}:`, error);
        throw new Error(`AI analysis failed: ${error}`);
      }

      const aiResult = await aiResponse.json();
      const analysis = aiResult.choices?.[0]?.message?.content || '';

      // Store phase result
      await supabase
        .from('agent_results')
        .insert({
          orchestration_id: orchestration.id,
          agent_name: phase.name,
          phase: phase.name,
          result_data: {
            analysis,
            agents: phase.agents,
            timestamp: new Date().toISOString()
          },
          confidence_score: 85,
          execution_time_ms: 0
        });

      console.log(`Phase ${phase.name} completed`);
    }

    // Final synthesis
    console.log('Starting synthesis phase');
    
    // Get all phase results
    const { data: phaseResults } = await supabase
      .from('agent_results')
      .select('*')
      .eq('orchestration_id', orchestration.id);

    const synthesisPrompt = `En tant que synthétiseur expert, compile ces analyses en un rapport cohérent:

${phaseResults?.map(r => `${r.phase}: ${JSON.stringify(r.result_data.analysis).substring(0, 500)}`).join('\n\n')}

Fournis une synthèse structurée avec:
1. Résumé exécutif
2. Points clés par domaine
3. Recommandations prioritaires
4. Plan d'action`;

    const synthesisResponse = await fetch('https://api.lovable.app/v1/ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: 'Tu es un synthétiseur expert qui compile des analyses en rapports structurés.' },
          { role: 'user', content: synthesisPrompt }
        ],
        max_tokens: 3000
      }),
    });

    const synthesisResult = await synthesisResponse.json();
    const finalSynthesis = synthesisResult.choices?.[0]?.message?.content || '';

    // Store synthesis
    await supabase
      .from('agent_results')
      .insert({
        orchestration_id: orchestration.id,
        agent_name: 'synthesizer',
        phase: 'synthesis',
        result_data: {
          synthesis: finalSynthesis,
          timestamp: new Date().toISOString()
        },
        confidence_score: 90,
        execution_time_ms: 0
      });

    // Update orchestration as completed
    await supabase
      .from('agent_orchestrations')
      .update({
        status: 'completed',
        progress: 100,
        current_phase: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', orchestration.id);

    console.log('Multi-agent orchestration completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        orchestrationId: orchestration.id,
        message: 'Multi-agent orchestration completed successfully',
        synthesis: finalSynthesis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in orchestrate-multi-agent:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
