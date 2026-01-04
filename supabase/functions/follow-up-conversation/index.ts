import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FollowUpRequest {
  audit_id?: string
  follow_up_token?: string
  message: string
}

// Message limits by plan
const PLAN_LIMITS: Record<string, number> = {
  enterprise: 30,
  agency: 15,
  pro: 5,
  discovery: 3,
  freemium: 3
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { audit_id, follow_up_token, message }: FollowUpRequest = await req.json()

    console.log('=== Follow-Up Conversation ===')
    console.log('Audit ID:', audit_id)
    console.log('Follow-up Token:', follow_up_token)
    console.log('Message:', message?.substring(0, 100))

    // Fetch audit by ID or token
    let query = supabaseClient.from('pre_audits').select('*')
    
    if (follow_up_token) {
      query = query.eq('follow_up_token', follow_up_token)
    } else if (audit_id) {
      query = query.eq('id', audit_id)
    } else {
      return new Response(
        JSON.stringify({ error: 'audit_id or follow_up_token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: audit, error: auditError } = await query.single()

    if (auditError || !audit) {
      console.error('Audit not found:', auditError)
      return new Response(
        JSON.stringify({ error: 'Conversation non trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if follow-up token has expired (30 days default)
    if (audit.follow_up_expires_at && new Date(audit.follow_up_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          error: 'Lien expiré',
          message: 'Le canal de suivi a expiré. Veuillez contacter le support pour le réactiver.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get plan tier and check message limit
    const planTier = audit.ai_tier || 'discovery'
    const messageLimit = PLAN_LIMITS[planTier] || 3
    const currentCount = audit.follow_up_messages_count || 0

    if (currentCount >= messageLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Limite atteinte',
          message: `Vous avez atteint la limite de ${messageLimit} messages de suivi pour votre plan ${planTier.toUpperCase()}.`,
          remaining: 0,
          limit: messageLimit,
          upgrade_needed: planTier !== 'enterprise'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get existing conversation history
    const conversationHistory = audit.conversation_history || []
    
    // Get existing brief
    const existingBrief = audit.conversational_brief || {}

    // Build context from existing conversation and brief
    const contextSummary = `
Client: ${audit.user_name || 'Non spécifié'}
Entreprise: ${audit.company_guess || audit.url}
Objectifs initiaux: ${existingBrief.strategic_objectives?.join(', ') || 'Non spécifiés'}
Défis identifiés: ${existingBrief.current_challenges?.join(', ') || 'Non spécifiés'}
`.trim()

    // System prompt for follow-up mode
    const systemPrompt = `Tu es Alex, Analyste Stratégique Senior chez MANUS IA.

Le client revient pour enrichir ou compléter sa demande d'audit. 

**Contexte du client:**
${contextSummary}

**Conversation précédente:**
${conversationHistory.slice(-6).map((msg: { role: string, content: string }) => 
  `${msg.role === 'user' ? 'Client' : 'Alex'}: ${msg.content}`
).join('\n')}

**Instructions:**
1. Accueille chaleureusement le client qui revient
2. Écoute attentivement ses ajouts/modifications
3. Confirme ce que tu comprends de sa demande
4. Intègre ces nouvelles informations au brief existant
5. Sois concis (2-3 phrases max)
6. Si le client veut ajouter des infos stratégiques, note-les pour enrichir l'audit

**Messages de suivi restants pour ce client:** ${messageLimit - currentCount - 1}

Réponds naturellement en français.`

    // Call AI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    
    let alexResponse: string

    if (lovableApiKey) {
      console.log('Using Lovable AI...')
      const response = await fetch('https://api.lovable.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Lovable AI failed: ${response.status}`)
      }

      const data = await response.json()
      alexResponse = data.choices[0].message.content
    } else if (openaiApiKey) {
      console.log('Using OpenAI...')
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI failed: ${response.status}`)
      }

      const data = await response.json()
      alexResponse = data.choices[0].message.content
    } else {
      throw new Error('No AI API key configured')
    }

    console.log('Alex Follow-up Response:', alexResponse)

    // Update conversation history
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: alexResponse, timestamp: new Date().toISOString() }
    ]

    // Extract any new strategic info from user message
    const enrichmentPrompt = `Analyze this follow-up message and extract any NEW strategic information to add to the brief.

Existing brief:
${JSON.stringify(existingBrief, null, 2)}

New message from client:
"${message}"

Return a JSON with ONLY new/updated fields to merge:
{
  "additional_objectives": [],
  "additional_challenges": [],
  "additional_competitors": [],
  "additional_focus_areas": [],
  "follow_up_notes": ""
}

Return ONLY valid JSON. If nothing new, return empty arrays and empty string.`

    let enrichment = {}
    
    try {
      const apiKey = lovableApiKey || openaiApiKey
      const apiUrl = lovableApiKey 
        ? 'https://api.lovable.ai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions'
      
      const enrichResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: lovableApiKey ? 'google/gemini-2.5-flash' : 'gpt-4o-mini',
          messages: [{ role: 'user', content: enrichmentPrompt }],
          max_tokens: 500,
          temperature: 0.3
        })
      })

      if (enrichResponse.ok) {
        const enrichData = await enrichResponse.json()
        let enrichText = enrichData.choices[0].message.content
        enrichText = enrichText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        enrichment = JSON.parse(enrichText)
      }
    } catch (e) {
      console.log('Could not extract enrichment:', e)
    }

    // Merge enrichment with existing brief
    const updatedBrief = {
      ...existingBrief,
      strategic_objectives: [
        ...(existingBrief.strategic_objectives || []),
        ...((enrichment as { additional_objectives?: string[] }).additional_objectives || [])
      ].filter((v, i, a) => a.indexOf(v) === i),
      current_challenges: [
        ...(existingBrief.current_challenges || []),
        ...((enrichment as { additional_challenges?: string[] }).additional_challenges || [])
      ].filter((v, i, a) => a.indexOf(v) === i),
      competitors: [
        ...(existingBrief.competitors || []),
        ...((enrichment as { additional_competitors?: string[] }).additional_competitors || [])
      ].filter((v, i, a) => a.indexOf(v) === i),
      specific_focus_areas: [
        ...(existingBrief.specific_focus_areas || []),
        ...((enrichment as { additional_focus_areas?: string[] }).additional_focus_areas || [])
      ].filter((v, i, a) => a.indexOf(v) === i),
      follow_up_notes: [
        ...(existingBrief.follow_up_notes || []),
        (enrichment as { follow_up_notes?: string }).follow_up_notes
      ].filter(Boolean),
      last_follow_up_at: new Date().toISOString()
    }

    // Update database
    const { error: updateError } = await supabaseClient
      .from('pre_audits')
      .update({
        conversation_history: newHistory,
        conversational_brief: updatedBrief,
        follow_up_messages_count: currentCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', audit.id)

    if (updateError) {
      console.error('Error updating audit:', updateError)
    }

    // ========================================
    // 📧 NOTIFICATION ADMIN - Brief enrichi
    // ========================================
    const briefWasEnriched = Object.keys(enrichment).some(k => 
      Array.isArray((enrichment as Record<string, unknown>)[k]) 
        ? ((enrichment as Record<string, string[]>)[k]).length > 0 
        : Boolean((enrichment as Record<string, unknown>)[k])
    )
    
    if (briefWasEnriched) {
      try {
        const resendKey = Deno.env.get("RESEND_API_KEY")
        if (resendKey) {
          const adminEmail = "patrice.simion@gmail.com"
          const clientEmail = audit.user_email || "Client"
          const companyName = audit.company_guess || audit.url || "Entreprise"
          
          console.log("📧 Envoi notification admin - brief enrichi")
          
          const notificationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #d8232a, #b91c1c); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 20px;">🔔 Brief Client Enrichi</h1>
              </div>
              <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="color: #475569; margin-bottom: 16px;">
                  <strong>${clientEmail}</strong> a ajouté des informations à son audit via le canal de suivi Alex.
                </p>
                
                <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #d8232a; margin-bottom: 16px;">
                  <p style="font-weight: 600; color: #1e293b; margin: 0 0 8px 0;">Entreprise : ${companyName}</p>
                  <p style="font-size: 14px; color: #64748b; margin: 0;">Tier: ${planTier}</p>
                </div>
                
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                  <p style="font-weight: 600; color: #92400e; margin: 0 0 4px 0;">💬 Nouveau message client :</p>
                  <p style="color: #78350f; font-size: 14px; margin: 0; font-style: italic;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
                </div>
                
                <div style="background: #ecfdf5; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                  <p style="font-weight: 600; color: #065f46; margin: 0 0 4px 0;">✨ Nouveaux éléments extraits :</p>
                  <pre style="color: #047857; font-size: 12px; margin: 0; white-space: pre-wrap; font-family: monospace;">${JSON.stringify(enrichment, null, 2).substring(0, 500)}</pre>
                </div>
                
                <p style="font-size: 13px; color: #64748b;">
                  Messages restants pour ce client : <strong>${messageLimit - currentCount - 1}</strong>
                </p>
                
                <a href="https://imotion-conseil.lovable.app/admin/audits" 
                   style="display: inline-block; background: #d8232a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                  Voir les audits
                </a>
              </div>
            </div>
          `
          
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "IMOTION Conseil <noreply@imotion-conseil.com>",
              to: [adminEmail],
              subject: `🔔 Brief enrichi - ${companyName}`,
              html: notificationHtml
            })
          })
          
          console.log("✅ Notification admin envoyée")
        }
      } catch (notifError) {
        console.error("⚠️ Erreur notification admin (non bloquante):", notifError)
      }
    }
    // ========================================

    return new Response(
      JSON.stringify({
        success: true,
        message: alexResponse,
        remaining_messages: messageLimit - currentCount - 1,
        message_limit: messageLimit,
        plan: planTier,
        brief_updated: briefWasEnriched
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Follow-up error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne', 
        details: error instanceof Error ? error.message : 'Unknown' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
