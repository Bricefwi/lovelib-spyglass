import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const domain = url.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0];
    const websiteUrl = `https://${domain}`;
    
    // Chercher d'abord une company existante avec ce website
    let company: any;
    const { data: existingCompany } = await supabase.from('companies').select().eq('website', websiteUrl).maybeSingle();
    
    if (existingCompany) {
      company = existingCompany;
    } else {
      // Créer une nouvelle company avec un nom temporaire
      const { data: newCompany } = await supabase.from('companies').insert({ 
        name: domain, 
        website: websiteUrl,
        city: 'Unknown' // required field
      }).select().single();
      company = newCompany;
    }
    
    const { data: pre } = await supabase.from('pre_audits').insert({ company_id: company.id, url, status: 'collecting', timeline: [{at: new Date().toISOString(), label: 'Création'}] }).select().single();

    const prompt = `Analyse Marketing & Commercial de ${domain} en JSON avec summary, company{name,country,industry}, marketing{channels,stack}, sales{motions}, competitors[], kpis{current,suggested}, scenarios[{type,benefits,risks,prob_succes,effort{jours,budget_eur}}]`;
    
    const providers = await Promise.all([
      fetch('https://api.perplexity.ai/chat/completions', { method:'POST', headers:{'Authorization':`Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,'Content-Type':'application/json'}, body:JSON.stringify({model:'llama-3.1-sonar-small-128k-online',messages:[{role:'user',content:prompt}],temperature:0.2}) }).then(r=>r.json()).then(d=>({provider:'perplexity',ok:true,content:d?.choices?.[0]?.message?.content})).catch(e=>({provider:'perplexity',ok:false,error:String(e)})),
      fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Authorization':`Bearer ${Deno.env.get('OPENAI_API_KEY')}`,'Content-Type':'application/json'}, body:JSON.stringify({model:'gpt-4o-mini',temperature:0.2,messages:[{role:'user',content:prompt}]}) }).then(r=>r.json()).then(d=>({provider:'gpt',ok:true,content:d?.choices?.[0]?.message?.content})).catch(e=>({provider:'gpt',ok:false,error:String(e)})),
      fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.2}}) }).then(r=>r.json()).then(d=>({provider:'gemini',ok:true,content:d?.candidates?.[0]?.content?.parts?.[0]?.text})).catch(e=>({provider:'gemini',ok:false,error:String(e)}))
    ]);

    const jsons = providers.filter(p=>p.ok && 'content' in p).map(p=>{try{const s=(p as any).content;const i=s.indexOf('{'),j=s.lastIndexOf('}');return i>=0&&j>i?JSON.parse(s.slice(i,j+1)):null}catch{return null}}).filter(Boolean);
    const pick = (path:string[]) => { for(const j of jsons){let c:any=j;for(const k of path)c=c?.[k];if(c&&((Array.isArray(c)&&c.length)||(!Array.isArray(c)&&String(c).trim())))return c}};
    const consolidated = { summary:pick(['summary'])||`Audit ${domain}`, company:pick(['company'])||{name:'',country:'',industry:''}, marketing:pick(['marketing'])||{channels:[],stack:[]}, sales:pick(['sales'])||{motions:[]}, tech:pick(['tech'])||{}, competitors:pick(['competitors'])||[], kpis:pick(['kpis'])||{current:[],suggested:[]}, scenarios:(()=>{const m=new Map();jsons.forEach(j=>(j?.scenarios||[]).forEach((s:any)=>m.set(s.type,s)));return['ambitieux','raisonnable','opportuniste','mix'].map(t=>m.get(t)||{type:t,benefits:'',risks:'',prob_succes:60,kpis:[],effort:{jours:0,budget_eur:0}})})() };
    const confidence = Math.min(90, 30 + 20*providers.filter(p=>p.ok).length + (consolidated.company.name?10:0));

    await supabase.from('pre_audits').update({ status:'consolidated', confidence, sources_raw:providers, consolidated, timeline:[...pre.timeline,{at:new Date().toISOString(),label:'Consolidé'}] }).eq('id',pre.id);

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Rapport ${domain}</title><style>body{font-family:Inter,sans-serif;background:#fff;margin:0}.top{background:#E53935;color:#fff;padding:16px 24px;display:flex;justify-content:space-between}.container{max-width:1120px;margin:24px auto;padding:0 16px}.card{border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:16px}.badge{background:#fee;color:#B71C1C;padding:4px 8px;border-radius:8px;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:768px){.grid{grid-template-columns:1fr}}.tag{background:#f3f3f3;padding:4px 8px;border-radius:8px;margin:2px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #eee;padding:8px;text-align:left}th{background:#f9f9f9}</style></head><body><div class="top"><strong>IMOTION</strong> · Rapport ${domain}<div>Confiance ${confidence}%</div></div><div class="container"><div class="card"><h2>Résumé</h2><p>${consolidated.summary}</p><span class="badge">Confiance ${confidence}%</span></div><div class="grid"><div class="card"><h3>Entreprise</h3><p>${consolidated.company.name||'—'} · ${consolidated.company.industry||'—'}</p></div><div class="card"><h3>Concurrents</h3>${consolidated.competitors.map((c:string)=>`<span class="tag">${c}</span>`).join('')||'—'}</div></div><div class="grid"><div class="card"><h3>Marketing</h3><p>Canaux: ${consolidated.marketing.channels.map((c:string)=>`<span class="tag">${c}</span>`).join('')||'—'}</p></div><div class="card"><h3>Commercial</h3><p>${consolidated.sales.motions.map((m:string)=>`<span class="tag">${m}</span>`).join('')||'—'}</p></div></div><div class="card"><h3>Scénarios</h3><table><tr><th>Type</th><th>Prob</th><th>Effort</th><th>Bénéfices</th></tr>${consolidated.scenarios.map((s:any)=>`<tr><td>${s.type}</td><td>${s.prob_succes}%</td><td>${s.effort.jours}j/${s.effort.budget_eur}€</td><td>${s.benefits||'—'}</td></tr>`).join('')}</table></div></div></body></html>`;
    
    const { data: rep } = await supabase.from('audit_reports').insert({ pre_audit_id:pre.id, title:`Rapport ${domain}`, html }).select().single();

    return new Response(JSON.stringify({ ok:true, report_id:rep.id, pre_audit_id:pre.id }), { headers:{...corsHeaders,'Content-Type':'application/json'} });
  } catch(e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:500, headers:{...corsHeaders,'Content-Type':'application/json'} });
  }
});
