import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrategicOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimated_impact: 'Faible' | 'Moyen' | 'Élevé' | 'Très Élevé';
  effort: 'Faible' | 'Moyen' | 'Élevé';
  timeline: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const { audit_id, phase, context } = await req.json();
    console.log(`🎯 GENERATING STRATEGIC OPTIONS - Audit: ${audit_id}, Phase: ${phase}`);

    // 1. Récupérer l'organisation pour savoir quel modèle IA utiliser
    const { data: audit } = await supabase
      .from('pre_audits')
      .select('*, organizations(subscription_plan, ai_model_preference)')
      .eq('id', audit_id)
      .single();

    if (!audit) throw new Error('Audit not found');

    // 2. Sélection du modèle IA (DeepThink pour Premium)
    const isPremium = audit.organizations?.subscription_plan === 'agency' || 
                      audit.organizations?.subscription_plan === 'enterprise';
    
    const useDeepThink = isPremium && audit.organizations?.ai_model_preference === 'premium_o1';
    
    let aiProvider = 'lovable';
    let modelName = 'google/gemini-2.5-flash';
    
    if (isPremium) {
      aiProvider = 'openai';
      modelName = useDeepThink ? 'o1-preview' : 'gpt-4o';
      console.log(`🧠 MODE ${useDeepThink ? 'DEEPTHINK' : 'PREMIUM'} ACTIVÉ`);
    }

    // 3. Prompt Système "Directeur de Stratégie McKinsey"
    const systemPrompt = `Tu es un Directeur de Stratégie Senior chez McKinsey & Company avec 20 ans d'expérience.

**MISSION CRITIQUE :**
Sur la base des données fournies, tu dois identifier exactement 3 axes stratégiques DISTINCTS et VIABLES.

**MÉTHODOLOGIE :**
1. ANALYSE : Comprendre le contexte en profondeur
2. CRITIQUE : Identifier les fausses pistes et les hallucinations potentielles
3. SYNTHÈSE : Proposer 3 routes stratégiques radicalement différentes

**RÈGLES D'OR :**
- Chaque option doit être RÉELLEMENT applicable (pas de théorie abstraite)
- Les 3 options doivent couvrir des PHILOSOPHIES différentes (offensive/défensive/innovation)
- Utilise un langage PRÉCIS de consultant senior (évite le jargon creux)
- Chaque option doit avoir 3 avantages et 2-3 risques CONCRETS

**FORMAT JSON STRICT (obligatoire) :**
{
  "context_summary": "Résumé exécutif en 2-3 phrases",
  "options": [
    {
      "id": "option_A",
      "title": "Titre percutant (5 mots max)",
      "description": "Description détaillée (100 mots max)",
      "pros": ["Avantage concret 1", "Avantage concret 2", "Avantage concret 3"],
      "cons": ["Risque réel 1", "Risque réel 2"],
      "estimated_impact": "Très Élevé|Élevé|Moyen|Faible",
      "effort": "Élevé|Moyen|Faible",
      "timeline": "Horizon temporel (ex: 6-12 mois)"
    }
  ]
}`;

    const userPrompt = `**CONTEXTE DE L'ENTREPRISE :**
${context}

**PHASE D'ANALYSE :** ${phase}

Propose maintenant 3 axes stratégiques pour cette entreprise. Réponds UNIQUEMENT avec le JSON (pas de markdown, pas d'explication).`;

    // 4. Appel à l'IA
    let aiResponse;
    
    if (aiProvider === 'openai') {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiKey) throw new Error('OpenAI API Key not configured');

      const openaiPayload: any = {
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      };

      // O1 n'accepte pas max_tokens mais max_completion_tokens
      if (modelName === 'o1-preview') {
        openaiPayload.max_completion_tokens = 4000;
      } else {
        openaiPayload.max_tokens = 2000;
        openaiPayload.temperature = 0.7;
      }

      aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiPayload)
      });
    } else {
      // Lovable AI (Gemini)
      const lovableKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableKey) throw new Error('Lovable API Key not configured');

      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`AI Error (${aiResponse.status}):`, errorText);
      throw new Error(`AI API Error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices[0].message.content;

    // 5. Parser le JSON (nettoyage des markdown si nécessaire)
    let cleanedContent = rawContent.trim();
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    }

    const strategicData = JSON.parse(cleanedContent);

    // 6. Validation des données
    if (!strategicData.options || strategicData.options.length !== 3) {
      throw new Error('AI must return exactly 3 options');
    }

    // 7. Sauvegarder dans strategic_choices
    const { data: savedChoice, error: saveError } = await supabase
      .from('strategic_choices')
      .insert({
        audit_id,
        phase,
        context_summary: strategicData.context_summary,
        options: strategicData.options,
        created_by: user.id
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // 8. Mettre l'audit en "waiting_for_choice"
    await supabase
      .from('pre_audits')
      .update({ 
        status: 'waiting_for_choice',
        current_phase: phase 
      })
      .eq('id', audit_id);

    console.log(`✅ Strategic options generated and saved (ID: ${savedChoice.id})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        choice_id: savedChoice.id,
        options: strategicData.options,
        model_used: modelName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ ERROR generating strategic options:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});