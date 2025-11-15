// ============================================================================
// EDGE FUNCTION : send-audit-limit-warning
// ============================================================================
// Objectif : Envoyer un email d'alerte quand un utilisateur atteint sa limite d'audits gratuits
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schéma de validation
const emailNotificationSchema = z.object({
  user_id: z.string().uuid(),
  notification_type: z.enum(['audit_limit_reached', 'audit_limit_warning']),
});

interface EmailData {
  user_id: string;
  notification_type: 'audit_limit_reached' | 'audit_limit_warning';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Créer client admin pour récupérer les infos user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    
    // Valider les données
    const validation = emailNotificationSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid payload', details: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, notification_type }: EmailData = validation.data;

    // Récupérer les informations de l'utilisateur
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, firstname, lastname, free_audits_used')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userName = profile.firstname 
      ? `${profile.firstname} ${profile.lastname || ''}`.trim() 
      : profile.email.split('@')[0];

    // Préparer le contenu de l'email selon le type
    let subject = '';
    let htmlContent = '';

    if (notification_type === 'audit_limit_reached') {
      subject = '🚀 Limite d\'audits gratuits atteinte - IMOTION';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Vous avez utilisé vos 3 audits gratuits !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              
              <p>Vous avez utilisé <strong>les 3 audits gratuits</strong> inclus avec votre compte IMOTION.</p>
              
              <p>Pour continuer à bénéficier de nos audits digitaux et accéder à des analyses encore plus poussées, nous vous invitons à découvrir nos offres premium :</p>
              
              <ul>
                <li>✅ Audits illimités</li>
                <li>✅ Rapports détaillés exportables en PDF</li>
                <li>✅ Recommandations personnalisées</li>
                <li>✅ Suivi de progression dans le temps</li>
                <li>✅ Support prioritaire</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="https://imotion.fr/pricing" class="cta-button">Découvrir nos offres</a>
              </div>
              
              <p>Vous avez des questions ? Notre équipe est là pour vous aider :</p>
              <p>📧 <a href="mailto:contact@imotion.fr">contact@imotion.fr</a></p>
              
              <p>À très bientôt,<br><strong>L'équipe IMOTION</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 IMOTION - Audit Digital & Transformation IA<br>
              <a href="https://imotion.fr/rgpd">Politique de confidentialité</a> | 
              <a href="https://imotion.fr/cgu">CGU</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Warning à 2 audits utilisés
      subject = '⚠️ Bientôt la fin de vos audits gratuits - IMOTION';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Il vous reste 1 audit gratuit</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              
              <div class="warning-box">
                <strong>Attention :</strong> Vous avez utilisé ${profile.free_audits_used} audits sur les 3 gratuits inclus.
              </div>
              
              <p>Profitez de votre dernier audit gratuit, puis découvrez nos offres premium pour continuer à optimiser votre présence digitale !</p>
              
              <p>Cordialement,<br><strong>L'équipe IMOTION</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Envoyer l'email via Resend
    const emailResult = await resend.emails.send({
      from: 'IMOTION <no-reply@imotion.fr>',
      to: [profile.email],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResult);

    // Logger l'envoi dans une table dédiée (optionnel)
    try {
      await supabaseAdmin.from('email_notifications').insert({
        user_id,
        email: profile.email,
        notification_type,
        sent_at: new Date().toISOString(),
        resend_id: emailResult.data?.id,
      });
    } catch (logErr) {
      console.warn('Failed to log email notification:', logErr);
    }

    return new Response(
      JSON.stringify({ success: true, email_id: emailResult.data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-audit-limit-warning:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email notification',
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
