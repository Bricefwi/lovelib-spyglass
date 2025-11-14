import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

    // SÉCURITÉ: Utiliser ANON_KEY au lieu de SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    
    const { data, error } = await supabase
      .from('audit_reports')
      .select('html')
      .eq('id', reportId)
      .single();
    
    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Rapport non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(data.html, { 
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
