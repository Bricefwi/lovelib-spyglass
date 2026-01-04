import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface ConversationRequest {
  audit_id: string
  message: string
  conversation_history?: ConversationMessage[]
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

    const { audit_id, message, conversation_history = [] }: ConversationRequest = await req.json()

    console.log('=== Conversational Agent Alex ===')
    console.log('Audit ID:', audit_id)
    console.log('User Message:', message)

    // Fetch audit details
    const { data: audit, error: auditError } = await supabaseClient
      .from('pre_audits')
      .select('*')
      .eq('id', audit_id)
      .single()

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: 'Audit not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if conversation is already completed
    if (audit.conversation_completed) {
      return new Response(
        JSON.stringify({ 
          error: 'Conversation already completed',
          message: 'Your audit is already in progress.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build conversation context
    const conversationContext = conversation_history.map(msg => 
      `${msg.role === 'user' ? 'Client' : 'Alex'}: ${msg.content}`
    ).join('\n')

    // System prompt for Agent Alex
    const systemPrompt = `You are Alex, a Senior Strategic Analyst at MANUS IA, a premium digital audit company. You are conducting a pre-audit conversational interview to:

1. **Confirm the client's identity** (name, role, company)
2. **Understand their strategic objectives** (3 main goals for this audit)
3. **Identify current challenges** (pain points, friction in their digital strategy)
4. **Map the competitive landscape** (2-3 main competitors)
5. **Gather specific context** (any particular aspects to focus on)

**Your personality:**
- Professional, warm, and reassuring
- Concise but thorough (2-3 sentences max per response)
- Empathetic and curious
- Security-conscious (you're protecting the client from industrial espionage)

**Client Information:**
- Name: ${audit.user_name || 'Not provided'}
- Email: ${audit.user_email}
- Company Website: ${audit.url}
- Plan: ${(audit.ai_tier || 'pro').toUpperCase()}

**Conversation Flow:**
1. If this is the first message, greet warmly and explain the process (2-3 minutes, 5 questions)
2. Ask questions one at a time, in order
3. Acknowledge answers briefly before moving to the next question
4. After all 5 questions, thank them and confirm the audit will start

**Current Conversation:**
${conversationContext}

**Client's Latest Message:**
${message}

**Your Response Guidelines:**
- If they seem hesitant, reassure them about security and confidentiality
- If they provide vague answers, ask a gentle follow-up for clarity
- Keep track of which questions have been answered
- When all 5 questions are answered, synthesize and confirm

Respond naturally in French (the client's language).`

    // Try OpenAI first (more reliable), fallback to Gemini
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    let alexResponse: string

    if (openaiApiKey) {
      console.log('Using OpenAI API...')
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error('OpenAI API error:', errorText)
        throw new Error(`OpenAI API failed: ${openaiResponse.status}`)
      }

      const openaiData = await openaiResponse.json()
      alexResponse = openaiData.choices[0].message.content
    } else if (geminiApiKey) {
      console.log('Using Gemini API...')
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500, topP: 0.9 }
          })
        }
      )

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error('Gemini API error:', errorText)
        throw new Error(`Gemini API failed: ${geminiResponse.status}`)
      }

      const geminiData = await geminiResponse.json()
      alexResponse = geminiData.candidates[0].content.parts[0].text
    } else {
      throw new Error('No API key configured (OPENAI_API_KEY or GEMINI_API_KEY)')
    }

    console.log('Alex Response:', alexResponse)

    // Detect if conversation is complete
    const completionKeywords = [
      'audit va maintenant commencer',
      'analyse complète va',
      'nos agents vont',
      'procéder à l\'audit',
      'lancer l\'audit',
      'démarrer l\'audit',
      'merci encore pour votre confiance',
      'merci pour votre confiance',
      'rapport final',
      'nous allons maintenant procéder',
      'nous allons procéder',
      'toutes les informations nécessaires',
      'tiendrons informé'
    ]
    
    const isComplete = completionKeywords.some(keyword => 
      alexResponse.toLowerCase().includes(keyword)
    )

    // If conversation is complete, synthesize the brief
    if (isComplete) {
      console.log('🎯 Conversation completed, synthesizing brief...')

      // Extract key information from conversation
      const synthesisPrompt = `Based on this conversation, create a structured JSON brief with the following fields:

Conversation:
${conversationContext}
Client: ${message}
Alex: ${alexResponse}

Extract and structure:
{
  "client_name": "full name",
  "client_role": "role/function",
  "strategic_objectives": ["objective 1", "objective 2", "objective 3"],
  "current_challenges": ["challenge 1", "challenge 2"],
  "competitors": ["competitor 1", "competitor 2", "competitor 3"],
  "specific_focus_areas": ["area 1", "area 2"],
  "conversation_summary": "2-3 sentence summary"
}

Return ONLY valid JSON, no markdown, no explanation.`

      let briefText: string
      
      if (openaiApiKey) {
        const synthesisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: synthesisPrompt }],
            max_tokens: 1000,
            temperature: 0.3
          })
        })
        const synthesisData = await synthesisResponse.json()
        briefText = synthesisData.choices[0].message.content
      } else {
        const synthesisResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: synthesisPrompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
            })
          }
        )
        const synthesisData = await synthesisResponse.json()
        briefText = synthesisData.candidates[0].content.parts[0].text
      }
      
      // Clean up markdown if present
      briefText = briefText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      const conversationalBrief = JSON.parse(briefText)

      console.log('📝 Brief synthesized:', conversationalBrief)

      // Update audit with brief and mark as completed
      const { error: updateError } = await supabaseClient
        .from('pre_audits')
        .update({
          conversation_completed: true,
          conversation_completed_at: new Date().toISOString(),
          conversational_brief: conversationalBrief,
          status: 'ready_for_orchestration',
          user_name: conversationalBrief.client_name,
          user_role: conversationalBrief.client_role
        })
        .eq('id', audit_id)

      if (updateError) {
        console.error('Error updating audit:', updateError)
      }

      // Trigger orchestrator v6
      console.log('🚀 Triggering orchestrator v6...')
      
      try {
        const orchestratorResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/orchestrate-multi-agent-v6`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ audit_id })
          }
        )

        if (!orchestratorResponse.ok) {
          console.error('Failed to trigger orchestrator:', await orchestratorResponse.text())
        } else {
          console.log('✅ Orchestrator triggered successfully')
        }
      } catch (orchError) {
        console.error('Error triggering orchestrator:', orchError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: alexResponse,
          conversation_completed: true,
          brief: conversationalBrief,
          next_step: 'audit_in_progress'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Continue conversation
    return new Response(
      JSON.stringify({
        success: true,
        message: alexResponse,
        conversation_completed: false,
        next_step: 'continue_conversation'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
