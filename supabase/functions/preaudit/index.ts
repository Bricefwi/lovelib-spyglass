import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

// Endpoints API
const GPT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const PERPLEXITY_ENDPOINT = "https://api.perplexity.ai/chat/completions";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // === [IA Enrichment Phase] ===
    console.log("Starting AI enrichment with tri-model validation...");
    
    // 1. Requête Perplexity : collecte web enrichie
    let perplexityData: any = {};
    if (PERPLEXITY_API_KEY) {
      try {
        const q = `Collecte un résumé factuel de l'entreprise trouvée sur ${url}, incluant :
- Nom complet
- Secteur d'activité
- Produits/services principaux
- Positionnement ou valeur ajoutée
- Taille estimée, CA, effectif
- Présence digitale notable (réseaux, tech, canaux marketing)
Réponds uniquement avec un objet JSON structuré.`;
        
        const r = await fetch(PERPLEXITY_ENDPOINT, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [{ role: "user", content: q }],
            temperature: 0.2,
          }),
        });
        const res = await r.json();
        const content = res.choices?.[0]?.message?.content || "{}";
        try { 
          perplexityData = JSON.parse(content); 
        } catch { 
          perplexityData = { note: content }; 
        }
        console.log("Perplexity enrichment completed");
      } catch (e) {
        console.error("Perplexity enrichment failed:", e);
      }
    }

    // 2. Requête GPT : structuration et classification
    let gptProfile: any = {};
    if (OPENAI_API_KEY) {
      try {
        const gptPrompt = `Analyse le JSON suivant et normalise les données en un profil d'entreprise clair.
Retourne au format JSON strict (sans markdown) :
{
  "name": "nom de l'entreprise",
  "activity": "description de l'activité",
  "size_estimate": "TPE/PME/ETI/GE",
  "revenue_estimate": "estimation du CA",
  "employee_count": nombre estimé,
  "digital_maturity": score 0-100,
  "tech_stack": ["liste des technologies détectées"],
  "marketing_channels": ["liste des canaux marketing"],
  "ia_usage": ["usages IA détectés"]
}
Données à analyser :
${JSON.stringify({ site, perplexity: perplexityData, initial: ppx })}`;
        
        const gpt = await fetch(GPT_ENDPOINT, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: gptPrompt }],
            temperature: 0.1,
          }),
        });
        const res = await gpt.json();
        const content = res.choices?.[0]?.message?.content || "{}";
        // Nettoyer le markdown si présent
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try { 
          gptProfile = JSON.parse(cleanContent); 
        } catch { 
          console.error("Failed to parse GPT response:", cleanContent);
          gptProfile = {}; 
        }
        console.log("GPT structuration completed");
      } catch (e) {
        console.error("GPT structuration failed:", e);
      }
    }

    // 3. Requête Gemini : validation croisée
    let geminiValidation: any = {};
    if (GEMINI_API_KEY && Object.keys(gptProfile).length > 0) {
      try {
        const geminiReq = {
          contents: [{ 
            parts: [{ 
              text: `Valide ou corrige les informations suivantes sur cette entreprise. Retourne uniquement un JSON propre sans markdown :
${JSON.stringify(gptProfile)}
Vérifie la cohérence et corrige si nécessaire. Retourne le même format JSON.` 
            }] 
          }]
        };
        const resp = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiReq),
        });
        const out = await resp.json();
        const text = out?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        // Nettoyer le markdown si présent
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try { 
          geminiValidation = JSON.parse(cleanText); 
        } catch { 
          console.error("Failed to parse Gemini response:", cleanText);
          geminiValidation = {}; 
        }
        console.log("Gemini validation completed");
      } catch (e) {
        console.error("Gemini validation failed:", e);
      }
    }

    // 4. Déterminer le profil final (prioriser Gemini si validé, sinon GPT)
    const finalProfile = (geminiValidation && Object.keys(geminiValidation).length > 0) 
      ? geminiValidation 
      : gptProfile;

    // 5. Créer ou mettre à jour la company
    let companyId = null;
    if (finalProfile && finalProfile.name) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        
        // Vérifier si la company existe déjà
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .eq("website", url)
          .maybeSingle();

        if (existingCompany) {
          // Mise à jour
          const { data: updated, error: updateCompanyError } = await supabase
            .from("companies")
            .update({
              name: finalProfile.name,
              industry: finalProfile.activity || null,
              size_estimate: finalProfile.size_estimate || null,
              revenue_estimate: finalProfile.revenue_estimate || null,
              employee_count: finalProfile.employee_count || null,
              tech_stack: finalProfile.tech_stack || [],
              marketing_channels: finalProfile.marketing_channels || [],
              ia_usage: finalProfile.ia_usage || [],
            })
            .eq("id", existingCompany.id)
            .select()
            .single();

          if (updateCompanyError) {
            console.error("Company update error:", updateCompanyError);
          } else {
            companyId = updated.id;
            console.log("Company updated:", companyId);
          }
        } else {
          // Création
          const { data: newCompany, error: insertCompanyError } = await supabase
            .from("companies")
            .insert({
              name: finalProfile.name,
              website: url,
              industry: finalProfile.activity || null,
              size_estimate: finalProfile.size_estimate || null,
              revenue_estimate: finalProfile.revenue_estimate || null,
              employee_count: finalProfile.employee_count || null,
              tech_stack: finalProfile.tech_stack || [],
              marketing_channels: finalProfile.marketing_channels || [],
              ia_usage: finalProfile.ia_usage || [],
            })
            .select()
            .single();

          if (insertCompanyError) {
            console.error("Company insert error:", insertCompanyError);
          } else {
            companyId = newCompany.id;
            console.log("Company created:", companyId);
          }
        }
      } catch (e) {
        console.error("Company management error:", e);
      }
    }

    // 6) Stockage complet avec enrichissement IA
    const enrichedRawSources = { 
      site, 
      pplx: ppx, 
      gemini: gmn,
      ia_enrichment: {
        perplexity: perplexityData,
        gpt: gptProfile,
        gemini_validation: geminiValidation,
        final_profile: finalProfile
      }
    };

    const { error: updateError } = await supabase
      .from("pre_audits")
      .update({
        status: "consolidated",
        raw_sources: enrichedRawSources,
        consolidated: fused || { site, pplx: ppx, gemini: gmn },
        confidence,
        company_guess: finalProfile?.name || null,
        domain: new URL(url).hostname.replace(/^www\./, ''),
      })
      .eq("id", created.id);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    // 7. Créer la relation company_audits si on a une company
    if (companyId) {
      const { error: relationError } = await supabase
        .from("company_audits")
        .insert({
          company_id: companyId,
          pre_audit_id: created.id,
        });
      
      if (relationError) {
        console.error("Company audit relation error:", relationError);
      }
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
