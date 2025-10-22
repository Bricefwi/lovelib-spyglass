import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SourceHit = { provider: string; query?: string; url?: string; snippet?: string; reliability?: number };

async function fetchSiteBasics(url: string) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    const title = (html.match(/<title>(.*?)<\/title>/i)?.[1] || "").slice(0, 200);
    const desc = (html.match(/<meta name=["']description["'] content=["'](.*?)["']/i)?.[1] || "").slice(0, 300);
    return { title, desc, htmlSample: html.slice(0, 20000) };
  } catch (e) {
    console.error("Error fetching site:", e);
    return { title: "", desc: "", htmlSample: "" };
  }
}

async function pplxSearch(query: string) {
  if (!PERPLEXITY_API_KEY) {
    console.log("Perplexity API key not set, skipping");
    return null;
  }
  try {
    const r = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "Tu es un agent de recherche. Donne des faits sourcés avec URLs." },
          { role: "user", content: `Donne profil entreprise, activité, taille, dirigeants, offres, concurrents majeurs, réseaux sociaux et sources publiques pour: ${query}. Réponds en JSON structuré avec clés: company, activity, size, leaders, offers, competitors, socials, sources.` }
        ],
        temperature: 0.2,
      }),
    });
    if (!r.ok) {
      console.error("Perplexity error:", r.status, await r.text());
      return null;
    }
    const j = await r.json();
    const content = j.choices?.[0]?.message?.content;
    try { return JSON.parse(content); } catch { return { note: content }; }
  } catch (e) {
    console.error("Perplexity search error:", e);
    return null;
  }
}

async function geminiSearch(query: string) {
  if (!GEMINI_API_KEY) {
    console.log("Gemini API key not set, skipping");
    return null;
  }
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Synthétise EN JSON (company,activity,tech_stack,marketing_channels,news,sources) les infos publiques fiables sur: ${query}. Cite les sources.` }]
        }]
      })
    });
    if (!r.ok) {
      console.error("Gemini error:", r.status, await r.text());
      return null;
    }
    const j = await r.json();
    const text = j.candidates?.[0]?.content?.parts?.[0]?.text || "";
    try { return JSON.parse(text); } catch { return { note: text }; }
  } catch (e) {
    console.error("Gemini search error:", e);
    return null;
  }
}

async function lovableAIFuse(payload: any) {
  if (!LOVABLE_API_KEY) {
    console.log("Lovable API key not set, skipping fusion");
    return null;
  }
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.1,
        messages: [
          { role: "system", content: `Tu es un validateur de données d'entreprise. 
Renvoie un JSON propre avec ce schéma:
{
  "company": {"name":"","aka":[],"website":"","hq_country":"","size_estimate":""},
  "activity":{"sectors":[],"summary":""},
  "leaders":[{"name":"","role":""}],
  "offers":[""],
  "tech_stack":[""],
  "marketing_channels":[""],
  "competitors":[{"name":"","url":""}],
  "socials":{"linkedin":"","twitter":"","youtube":"","facebook":""},
  "news":[{"title":"","url":"","date":""}],
  "numbers":{"revenue_estimate":"","employees_estimate":""},
  "sources":[{"url":"","label":"","reliability":0.0}],
  "confidence":0.0
}
Règles:
- Aucune invention : si doute -> vide.
- Fusionne les champs concordants, supprime doublons, et calcule un confidence moyen selon recoupements (0..1).
- Conserve toutes les sources (max 15).`},
          { role: "user", content: `Fusionne proprement ces inputs:\n${JSON.stringify(payload).slice(0, 60000)}` }
        ],
      }),
    });
    if (!r.ok) {
      console.error("Lovable AI error:", r.status, await r.text());
      return null;
    }
    const j = await r.json();
    const content = j.choices?.[0]?.message?.content || "{}";
    try { return JSON.parse(content); } catch { return { note: content }; }
  } catch (e) {
    console.error("Lovable AI fusion error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Use POST", { status: 405, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url required" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Starting pre-audit for:", url);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1) Crée un enregistrement
    const { data: created, error: insertError } = await supabase
      .from("pre_audits")
      .insert({ url, status: "collecting" })
      .select()
      .single();

    if (insertError || !created) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create pre-audit" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Pre-audit created with id:", created.id);

    // 2) Collecte site
    console.log("Fetching site basics...");
    const site = await fetchSiteBasics(url);
    
    // 3) Perplexity & Gemini
    console.log("Searching with Perplexity...");
    const ppx = await pplxSearch(url);
    
    console.log("Searching with Gemini...");
    const gmn = await geminiSearch(url);

    // 4) Fusion Lovable AI
    console.log("Fusing data with Lovable AI...");
    const fused = await lovableAIFuse({ site, ppx, gmn });

    // 5) Calcul confiance
    const confidence = typeof fused?.confidence === "number" ? fused.confidence : 0.6;

    // 6) Stockage complet
    const { error: updateError } = await supabase
      .from("pre_audits")
      .update({
        status: "consolidated",
        raw_sources: { site, pplx: ppx, gemini: gmn },
        consolidated: fused || { site, pplx: ppx, gemini: gmn },
        confidence,
      })
      .eq("id", created.id);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    // 7) Sauvegarde sources unitaires
    const sources: SourceHit[] = [];
    const addSrc = (url?: string, label?: string, provider?: string, rel?: number) => {
      if (url) sources.push({ provider: provider || "unknown", url, snippet: label || "", reliability: rel ?? 0.6 });
    };
    
    (ppx?.sources || []).forEach((s: any) => addSrc(s.url || s, s.label, "perplexity", 0.8));
    (gmn?.sources || []).forEach((s: any) => addSrc(s.url || s, s.label, "gemini", 0.7));
    (fused?.sources || []).forEach((s: any) => addSrc(s.url, s.label, "openai", s.reliability ?? 0.7));

    if (sources.length) {
      const sourcesWithId = sources.map(s => ({ ...s, pre_audit_id: created.id }));
      const { error: sourcesError } = await supabase
        .from("audit_sources")
        .insert(sourcesWithId);
      
      if (sourcesError) {
        console.error("Sources insert error:", sourcesError);
      }
    }

    console.log("Pre-audit completed successfully");

    return new Response(
      JSON.stringify({ pre_audit_id: created.id, status: "consolidated" }), 
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (e) {
    console.error("Pre-audit error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
