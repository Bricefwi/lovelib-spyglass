import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: load-plan-profile
 * Charge la configuration complète d'un plan tarifaire
 * Usage: Orchestrateur multi-agents pour adapter comportement selon tier
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Loading plan profile...");

    // Parse request
    const { tier, organization_id } = await req.json();

    if (!tier) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: tier" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client (service role pour lecture admin)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Charger configuration du plan
    console.log(`📋 Fetching plan profile for tier: ${tier}`);
    const { data: planProfile, error: planError } = await supabase
      .from('plan_profiles')
      .select('*')
      .eq('tier', tier)
      .single();

    if (planError || !planProfile) {
      console.error("❌ Plan profile not found:", planError);
      return new Response(
        JSON.stringify({ error: `Plan profile not found for tier: ${tier}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`✅ Plan profile loaded: ${planProfile.display_name}`);

    // 2. Si organization_id fourni, charger branding
    let branding = null;
    if (organization_id) {
      console.log(`🎨 Fetching branding for org: ${organization_id}`);
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('branding, name')
        .eq('id', organization_id)
        .single();

      if (!orgError && org) {
        branding = org.branding || {
          primary_color: "#d8232a",
          logo_url: null,
          company_name: org.name || "IMOTION",
          accent_color: null,
          footer_text: null,
        };
        console.log(`✅ Branding loaded for: ${branding.company_name}`);
      }
    }

    // 3. Construire réponse complète
    const response = {
      success: true,
      plan_profile: {
        ...planProfile,
        // Parse JSON fields
        modules_config: planProfile.modules_config,
      },
      branding: branding || {
        primary_color: "#d8232a",
        logo_url: null,
        company_name: "IMOTION",
        accent_color: null,
        footer_text: null,
      },
      orchestration_config: {
        max_agents: getMaxAgents(planProfile.tier),
        parallel_execution: planProfile.tier !== 'starter',
        enable_caching: true,
        timeout_ms: getTierTimeout(planProfile.tier),
      },
    };

    console.log("✅ Plan profile loaded successfully");

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error loading plan profile:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to load plan profile",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Détermine le nombre max d'agents en parallèle selon tier
 */
function getMaxAgents(tier: string): number {
  switch (tier) {
    case 'starter':
      return 3; // Sequential mostly
    case 'agency':
      return 6; // Moderate parallel
    case 'enterprise':
    case 'one_shot':
      return 10; // Full parallel
    default:
      return 3;
  }
}

/**
 * Timeout orchestration selon tier
 */
function getTierTimeout(tier: string): number {
  switch (tier) {
    case 'starter':
      return 4 * 60 * 60 * 1000; // 4h
    case 'agency':
      return 8 * 60 * 60 * 1000; // 8h
    case 'enterprise':
      return 14 * 60 * 60 * 1000; // 14h
    case 'one_shot':
      return 6 * 60 * 60 * 1000; // 6h
    default:
      return 4 * 60 * 60 * 1000;
  }
}
