import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  verification_token: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { verification_token }: VerifyRequest = await req.json()

    console.log('=== Verify Email & Start Conversation ===')
    console.log('Token:', verification_token)

    if (!verification_token) {
      return new Response(
        JSON.stringify({ error: 'Missing verification_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find audit by verification token
    const { data: audit, error: findError } = await supabaseClient
      .from('pre_audits')
      .select('*')
      .eq('verification_token', verification_token)
      .single()

    if (findError || !audit) {
      console.error('Audit not found:', findError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired verification token',
          details: 'The verification link may have expired or is invalid'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(audit.verification_token_expires_at)
    const now = new Date()

    if (now > expiresAt) {
      console.error('Token expired:', { expiresAt, now })
      return new Response(
        JSON.stringify({ 
          error: 'Verification token has expired',
          details: 'Please request a new audit to receive a fresh verification link'
        }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already verified
    if (audit.email_verified) {
      console.log('Email already verified, returning conversation config')
      
      // If conversation is already completed, trigger orchestrator
      if (audit.conversation_completed) {
        return new Response(
          JSON.stringify({
            success: true,
            audit_id: audit.id,
            message: 'Email already verified and conversation completed',
            next_step: 'audit_in_progress',
            status: audit.status
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return conversation config
      return new Response(
        JSON.stringify({
          success: true,
          audit_id: audit.id,
          message: 'Email already verified',
          next_step: 'start_conversation',
          conversation_config: {
            agent_name: 'Alex',
            agent_role: 'Analyste Stratégique MANUS IA',
            user_name: audit.user_name,
            user_email: audit.user_email,
            target_url: audit.target_url,
            subscription_tier: audit.subscription_tier
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark email as verified
    const { error: updateError } = await supabaseClient
      .from('pre_audits')
      .update({
        email_verified: true,
        status: 'pending_conversation',
        conversation_started_at: new Date().toISOString()
      })
      .eq('id', audit.id)

    if (updateError) {
      console.error('Error updating audit:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify email', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Email verified for audit:', audit.id)

    // Return conversation configuration
    return new Response(
      JSON.stringify({
        success: true,
        audit_id: audit.id,
        message: 'Email verified successfully. Ready to start conversation.',
        next_step: 'start_conversation',
        conversation_config: {
          agent_name: 'Alex',
          agent_role: 'Analyste Stratégique MANUS IA',
          user_name: audit.user_name,
          user_email: audit.user_email,
          target_url: audit.target_url,
          subscription_tier: audit.subscription_tier,
          welcome_message: `Bonjour ${audit.user_name || 'cher client'} ! Je suis Alex, votre analyste stratégique dédié chez MANUS IA. Pour garantir la sécurité et la pertinence de votre audit ${audit.subscription_tier.toUpperCase()} pour ${audit.target_url}, j'ai quelques questions rapides pour vous. Cela ne prendra que 2-3 minutes. Êtes-vous prêt(e) à commencer ?`
        }
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
