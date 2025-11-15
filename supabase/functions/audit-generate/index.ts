import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const generateAuditSchema = z.object({
  pre_audit_id: z.string().uuid({ message: "Invalid pre-audit ID" })
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Use POST", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = generateAuditSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const { pre_audit_id } = validation.data;

    console.log("Generating audit for pre_audit_id:", pre_audit_id);

    // Utiliser service_role pour bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Récupération consolidated et report_id
    const { data: preAudit, error: fetchError } = await supabase
      .from("pre_audits")
      .select("consolidated,confidence,url")
      .eq("id", pre_audit_id)
      .maybeSingle();

    // 2) Récupérer le report_id associé
    const { data: reportData } = await supabase
      .from("audit_reports")
      .select("id")
      .eq("pre_audit_id", pre_audit_id)
      .maybeSingle();

    if (fetchError || !preAudit) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Pre-audit not found" }), 
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const consolidated = preAudit.consolidated || {};
    const targetUrl = preAudit.url || "";

    console.log("Consolidated data retrieved, calling Lovable AI...");

    // 2) Prompt Orchestrateur (anti-hallucination)
    const sys = `Tu es un consultant senior. Tu rédiges un pré-audit d'entreprise B2B en FRANÇAIS.
Règles:
- Base-toi UNIQUEMENT sur le JSON fourni.
- Si une donnée manque, écris "Donnée non disponible".
- Chaque métrique renvoie une source (url) si elle existe.
- Propose 4 scénarios: ambitieux, raisonnable, opportuniste, mix. Pour chacun: bénéfices, risques, probabilité de réussite (%), principaux KPIs, effort estimé (jours + budget), et hypothèses explicites.
- Donne des scores [0..100] pour maturité digitale, marketing, sales, data, IA, tech, et justifie.
- Style: clair, pragmatique, orienté décision.`;

    const user = `JSON ENTREPRISE:
${JSON.stringify(consolidated).slice(0, 65000)}

ATTENDU (JSON):
{
 "summary":"200-400 mots",
 "scores":{"maturite":0,"marketing":0,"sales":0,"data":0,"ia":0,"tech":0},
 "kpis":{"actuels":[], "suggestions":[]},
 "scenarios":[
   {"type":"ambitieux","benefices":"","risques":"","prob_succes":0,"kpis":[],"effort":{"jours":0,"budget_eur":0},"hypotheses":[]},
   {"type":"raisonnable","benefices":"","risques":"","prob_succes":0,"kpis":[],"effort":{"jours":0,"budget_eur":0},"hypotheses":[]},
   {"type":"opportuniste","benefices":"","risques":"","prob_succes":0,"kpis":[],"effort":{"jours":0,"budget_eur":0},"hypotheses":[]},
   {"type":"mix","benefices":"","risques":"","prob_succes":0,"kpis":[],"effort":{"jours":0,"budget_eur":0},"hypotheses":[]}
 ],
 "sections": [
   {"title":"Profil & positionnement","content_md":"..."},
   {"title":"Présence digitale & stack","content_md":"..."},
   {"title":"Forces / Faiblesses","content_md":"..."},
   {"title":"Opportunités prioritaires (90j)","content_md":"..."},
   {"title":"Roadmap 12 mois","content_md":"..."}
 ],
 "sources":[{"url":"","label":"","reliability":0.0}],
 "confidence": 0.0
}`;

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${LOVABLE_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: "google/gemini-2.5-flash", 
        temperature: 0.1, 
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user }
        ]
      })
    });

    if (!ai.ok) {
      const errorText = await ai.text();
      console.error("Lovable AI error:", ai.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const j = await ai.json();
    const content = j.choices?.[0]?.message?.content || "{}";
    let data;
    try { 
      data = JSON.parse(content); 
    } catch { 
      data = { summary: content }; 
    }

    console.log("AI generation completed");

    // 3) Construction Markdown
    const md = `# Pré-audit IMOTION – ${targetUrl}

${data.summary || ""}

## Scores
- Maturité digitale: ${data.scores?.maturite ?? "NA"}/100
- Marketing: ${data.scores?.marketing ?? "NA"}/100
- Sales: ${data.scores?.sales ?? "NA"}/100
- Data: ${data.scores?.data ?? "NA"}/100
- IA: ${data.scores?.ia ?? "NA"}/100
- Tech: ${data.scores?.tech ?? "NA"}/100

${(data.sections || []).map((s:any)=>`## ${s.title}\n\n${s.content_md}\n`).join("\n")}

## Scénarios

${(data.scenarios || []).map((s:any)=>`### ${s.type}
- Bénéfices: ${s.benefices}
- Risques: ${s.risques}
- Probabilité de succès: ${s.prob_succes}%
- KPIs: ${(s.kpis||[]).join(', ')}
- Effort: ${s.effort?.jours || "?"} jours • ${s.effort?.budget_eur || "?"} €
- Hypothèses: ${(s.hypotheses||[]).join('; ')}
`).join("\n")}

## Sources
${(data.sources||[]).map((s:any)=>`- [${s.label||s.url}](${s.url}) • fiabilité ${Math.round((s.reliability||0)*100)}%`).join("\n")}

> Confiance globale: ${Math.round((data.confidence||0)*100)}%
`;

    // 4) Sauvegarde
    const { data: saved, error: insertError } = await supabase
      .from("audit_results")
      .insert({
        pre_audit_id,
        summary: data.summary || "",
        report_md: md,
        scores: data.scores || {},
        scenarios: data.scenarios || [],
        kpis: data.kpis || {},
        sources: data.sources || [],
        confidence: data.confidence ?? 0.0
      })
      .select()
      .single();

    if (insertError || !saved) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save audit result" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Audit result saved with id:", saved.id);

    // 5) Envoi email avec le rapport
    try {
      console.log("Calling send-audit-results function...");
      
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-audit-results', {
        body: {
          auditResultId: saved.id,
          website: targetUrl,
          reportMarkdown: md,
          scores: data.scores,
          reportId: reportData?.id
        }
      });

      if (emailError) {
        console.error("Failed to send email:", emailError);
      } else {
        console.log("Email sent successfully:", emailData);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue même si l'email échoue
    }

    return new Response(
      JSON.stringify({ audit_result_id: saved.id }), 
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (e) {
    console.error("Audit generation error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
