/**
 * Supabase Edge Function: orchestrate-multi-agent (MANUS IA Version)
 * 
 * Déclenche le système d'orchestration MANUS IA 2.0 avec 17 agents spécialisés
 * Remplace l'ancien workflow N8N par le backend Python MANUS IA
 * 
 * Architecture:
 * 1. Crée un enregistrement d'orchestration dans Supabase
 * 2. Appelle le backend MANUS IA (Python FastAPI)
 * 3. Le backend exécute les 17 agents en 4 phases
 * 4. Le backend appelle le callback Supabase pour les mises à jour
 * 5. L'UI Lovable affiche la progression en temps réel
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestrationRequest {
  preAuditId: string;
  url: string;
  companyInfo?: {
    name?: string;
    sector?: string;
    size?: string;
    employees?: number;
    revenue?: number;
    description?: string;
  };
}

interface ManusClientContext {
  client: {
    company: {
      name: string;
      website: string;
      legal_entity?: string;
    };
    business: {
      sector: string;
      business_model?: string;
      description?: string;
    };
    size?: {
      category?: string;
      employees?: number;
      revenue?: number;
    };
    objectives?: {
      primary: string[];
    };
  };
  metadata: {
    request_id: string;
    timestamp: string;
    source: string;
  };
  orchestrationId: string;
  callbackUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preAuditId, url, companyInfo }: OrchestrationRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Configuration MANUS IA Backend
    const manusBackendUrl = Deno.env.get('MANUS_BACKEND_URL');
    const manusApiKey = Deno.env.get('MANUS_API_KEY');
    
    console.log('=== MANUS IA Configuration Check ===');
    console.log('MANUS_BACKEND_URL from env:', manusBackendUrl);
    console.log('MANUS_BACKEND_URL is defined:', !!manusBackendUrl);
    console.log('MANUS_API_KEY is defined:', !!manusApiKey);

    if (!manusBackendUrl) {
      console.error('CRITICAL: MANUS_BACKEND_URL not configured in secrets');
      throw new Error('MANUS_BACKEND_URL not configured. Please set it in Supabase secrets.');
    }

    if (!manusApiKey) {
      console.error('CRITICAL: MANUS_API_KEY not configured in secrets');
      throw new Error('MANUS_API_KEY not configured. Please set it in Supabase secrets.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting MANUS IA multi-agent orchestration for pre-audit: ${preAuditId}`);

    // Create orchestration record with MANUS IA phases
    const { data: orchestration, error: orchError } = await supabase
      .from('agent_orchestrations')
      .insert({
        pre_audit_id: preAuditId,
        status: 'running',
        started_at: new Date().toISOString(),
        current_phase: 'initialization',
        progress: 0,
        phases: [
          { 
            name: 'initialization', 
            order: 0, 
            status: 'running',
            agents: ['A01 - MANUS IA Orchestrator']
          },
          { 
            name: 'market_study', 
            order: 1, 
            status: 'pending',
            agents: [
              'A02 - Data Hunter',
              'A03 - PESTEL Analyst',
              'A04 - Porter Strategy Expert',
              'A05 - Competitive Intelligence Officer',
              'A06 - Benchmark Specialist 2025',
              'A07 - SWOT Synthesizer'
            ]
          },
          { 
            name: 'conversational_audits', 
            order: 2, 
            status: 'pending',
            agents: [
              'A08 - Marketing Audit Conversationalist',
              'A09 - Sales Audit Specialist'
            ]
          },
          { 
            name: 'specialized_analyses', 
            order: 3, 
            status: 'pending',
            agents: [
              'A10 - SEO/SEM Expert',
              'A11 - Content Marketing Strategist',
              'A12 - Social Media Manager',
              'A13 - Email Marketing Automation Expert',
              'A14 - Data Analytics Scientist',
              'A15 - Pricing Intelligence Analyst'
            ]
          },
          { 
            name: 'synthesis_verification', 
            order: 4, 
            status: 'pending',
            agents: [
              'A16 - Report Designer & Data Visualizer',
              'A17 - Truth Guardian (Anti-Hallucination)'
            ]
          }
        ]
      })
      .select()
      .single();

    if (orchError) {
      console.error('Error creating orchestration:', orchError);
      throw orchError;
    }

    console.log('Orchestration created:', orchestration.id);

    // Construire le contexte client pour MANUS IA
    const manusContext: ManusClientContext = {
      client: {
        company: {
          name: companyInfo?.name || 'Entreprise inconnue',
          website: url,
          legal_entity: 'SAS' // Default, peut être enrichi
        },
        business: {
          sector: companyInfo?.sector || 'Non spécifié',
          business_model: 'B2B', // Default, peut être enrichi
          description: companyInfo?.description || ''
        },
        size: companyInfo?.size ? {
          category: companyInfo.size,
          employees: companyInfo.employees,
          revenue: companyInfo.revenue
        } : undefined,
        objectives: {
          primary: [
            'Améliorer la visibilité en ligne',
            'Optimiser le taux de conversion',
            'Augmenter le ROI marketing'
          ]
        }
      },
      metadata: {
        request_id: orchestration.id,
        timestamp: new Date().toISOString(),
        source: 'lovable-spyglass'
      },
      orchestrationId: orchestration.id,
      callbackUrl: `${supabaseUrl}/functions/v1/n8n-callback`
    };

    console.log('=== Starting MANUS IA Backend Call ===');
    console.log('MANUS Backend URL:', manusBackendUrl);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Payload size:', JSON.stringify(manusContext).length, 'bytes');
    console.log('Full payload:', JSON.stringify(manusContext, null, 2));

    // Appel asynchrone au backend MANUS IA - ne pas attendre la réponse
    console.log('Initiating fetch to MANUS IA Backend...');
    fetch(`${manusBackendUrl}/api/v1/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${manusApiKey}`
      },
      body: JSON.stringify(manusContext),
    })
      .then(async (response) => {
        console.log('=== MANUS IA Backend Response Received ===');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
        
        const responseText = await response.text();
        console.log('Response body length:', responseText.length);
        console.log('Response body:', responseText);

        if (!response.ok) {
          console.error('MANUS IA backend error:', responseText);
          
          // Update orchestration status to error
          await supabase
            .from('agent_orchestrations')
            .update({
              status: 'error',
              error: `MANUS IA backend failed (${response.status}): ${responseText}`,
              completed_at: new Date().toISOString()
            })
            .eq('id', orchestration.id);
        } else {
          let manusResult;
          try {
            manusResult = JSON.parse(responseText);
          } catch (e) {
            manusResult = { raw: responseText };
          }
          
          console.log('MANUS IA backend response:', manusResult);

          // Update orchestration with MANUS execution ID
          await supabase
            .from('agent_orchestrations')
            .update({
              n8n_execution_id: manusResult.audit_id || manusResult.id || 'manus-' + orchestration.id
            })
            .eq('id', orchestration.id);
        }
      })
      .catch(async (error) => {
        console.error('=== MANUS IA Backend Fetch Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        await supabase
          .from('agent_orchestrations')
          .update({
            status: 'error',
            error: `MANUS IA backend unreachable: ${error.message}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', orchestration.id);
      });

    // Répondre immédiatement au client
    return new Response(
      JSON.stringify({
        success: true,
        orchestrationId: orchestration.id,
        message: 'MANUS IA 2.0 multi-agent orchestration started successfully. Processing 17 specialized agents across 4 phases.',
        system: 'MANUS IA 2.0',
        agents: 17,
        phases: 4,
        qualityGates: true,
        antiHallucination: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in orchestrate-multi-agent (MANUS IA):', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        system: 'MANUS IA 2.0'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
