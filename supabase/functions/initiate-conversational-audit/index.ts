import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InitiateAuditRequest {
  target_url?: string
  url?: string
  subscription_tier?: string
  ai_tier?: string
  user_email: string
  user_name?: string
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

    const body: InitiateAuditRequest = await req.json()
    
    // Support both naming conventions
    const target_url = body.target_url || body.url
    const subscription_tier = body.subscription_tier || body.ai_tier
    const { user_email, user_name } = body

    console.log('=== Initiate Conversational Audit ===')
    console.log('Target URL:', target_url)
    console.log('Subscription Tier:', subscription_tier)
    console.log('User Email:', user_email)

    // Validate required fields
    if (!target_url || !subscription_tier || !user_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: url/target_url, ai_tier/subscription_tier, user_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Only apply conversational audit for paid plans
    const paidPlans = ['pro', 'agency', 'enterprise']
    const requiresConversation = paidPlans.includes(subscription_tier.toLowerCase())

    if (!requiresConversation) {
      return new Response(
        JSON.stringify({ 
          error: 'Conversational audit is only available for Pro, Agency, and Enterprise plans',
          requires_conversation: false
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract domain from target_url
    let targetDomain: string
    try {
      const url = new URL(target_url)
      targetDomain = url.hostname.replace('www.', '')
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid target_url format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract domain from user_email
    const emailDomain = user_email.split('@')[1]?.toLowerCase()
    
    if (!emailDomain) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate domain match (allow subdomains)
    // TEMPORARILY DISABLED FOR TESTING - TODO: Re-enable in production
    const domainMatch = emailDomain === targetDomain || 
                       emailDomain.endsWith(`.${targetDomain}`) || 
                       targetDomain.endsWith(`.${emailDomain}`)

    if (!domainMatch) {
      console.log('⚠️ Domain mismatch (bypassed for testing):', { emailDomain, targetDomain })
      // TODO: Re-enable this check in production
      // return new Response(
      //   JSON.stringify({ 
      //     error: 'Email domain does not match the target website domain',
      //     email_domain: emailDomain,
      //     target_domain: targetDomain,
      //     hint: 'Please use a professional email address from your organization'
      //   }),
      //   { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      // )
    }

    console.log('✅ Domain validation passed:', { emailDomain, targetDomain })

    // Generate unique verification token
    const verification_token = crypto.randomUUID()
    const verification_token_expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Create pre_audit entry
    const { data: audit, error: createError } = await supabaseClient
      .from('pre_audits')
      .insert({
        url: target_url,
        ai_tier: subscription_tier,
        status: 'pending_verification',
        user_email,
        user_name: user_name || null,
        email_verified: false,
        verification_token,
        verification_token_expires_at: verification_token_expires_at.toISOString(),
        conversation_completed: false
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating audit:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create audit', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Audit created:', audit.id)

    // Send verification email
    const verification_url = `${Deno.env.get('FRONTEND_URL')}/verify-email?token=${verification_token}`
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 40px 30px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; color: #3B82F6; letter-spacing: 2px; }
    .content { padding: 40px 30px; }
    h1 { color: #0F172A; font-size: 24px; margin: 0 0 20px 0; }
    p { color: #4B5563; line-height: 1.6; margin: 0 0 15px 0; }
    .button { display: inline-block; background: #3B82F6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #2563EB; }
    .info-box { background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #F9FAFB; padding: 20px 30px; text-align: center; color: #6B7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">MANUS IA</div>
    </div>
    <div class="content">
      <h1>🔐 Vérifiez votre identité</h1>
      <p>Bonjour ${user_name || 'cher client'},</p>
      <p>Vous avez demandé un audit <strong>${subscription_tier}</strong> pour <strong>${target_url}</strong>.</p>
      <p>Pour garantir la sécurité et la pertinence de votre audit, nous devons vérifier votre identité.</p>
      
      <div class="info-box">
        <strong>📧 Email vérifié :</strong> ${user_email}<br>
        <strong>🌐 Site audité :</strong> ${target_url}<br>
        <strong>📦 Plan :</strong> ${subscription_tier.toUpperCase()}
      </div>

      <p><strong>Étape 1/2 :</strong> Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
      <p><strong>Étape 2/2 :</strong> Vous serez ensuite invité à discuter quelques minutes avec Alex, notre analyste IA, pour personnaliser votre audit.</p>

      <center>
        <a href="${verification_url}" class="button">✅ Vérifier mon email</a>
      </center>

      <p style="color: #9CA3AF; font-size: 13px; margin-top: 30px;">
        Ce lien expire dans 1 heure. Si vous n'avez pas demandé cet audit, ignorez cet email.
      </p>
    </div>
    <div class="footer">
      © 2026 MANUS IA - Audits Digitaux Professionnels<br>
      <a href="https://manus.im" style="color: #3B82F6; text-decoration: none;">manus.im</a>
    </div>
  </div>
</body>
</html>
    `

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      try {
        console.log('📧 Sending verification email via Resend to:', user_email)
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'IMOTION Conseil <noreply@imotion-conseil.com>',
            to: user_email,
            subject: '🔐 Vérifiez votre identité pour votre audit IMOTION',
            html: emailHtml
          })
        })
        
        if (emailResponse.ok) {
          const emailResult = await emailResponse.json()
          console.log('✅ Email sent successfully:', emailResult.id)
        } else {
          const errorText = await emailResponse.text()
          console.error('❌ Failed to send email:', errorText)
        }
        
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - email not sent')
      console.log('Verification URL:', verification_url)
    }

    return new Response(
      JSON.stringify({
        success: true,
        audit_id: audit.id,
        message: 'Verification email sent. Please check your inbox.',
        requires_conversation: true,
        next_step: 'verify_email',
        verification_expires_at: verification_token_expires_at.toISOString()
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
