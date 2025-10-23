import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  const reportId = new URL(req.url).searchParams.get('report_id');
  if (!reportId) return new Response('report_id manquant', { status: 400, headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await supabase.from('audit_reports').select('html').eq('id', reportId).single();
  
  if (error || !data) return new Response('Rapport non trouvé', { status: 404, headers: corsHeaders });
  return new Response(data.html, { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
});
