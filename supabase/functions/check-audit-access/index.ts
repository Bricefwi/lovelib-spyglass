// ============================================================================
// EDGE FUNCTION : check-audit-access
// ============================================================================
// Objectif : Vérifier si un utilisateur peut accéder à un audit
// Vérifications :
//   1. Email confirmé
//   2. Informations entreprise complètes (SIRET)
//   3. Audits gratuits restants
//   4. Trust score suffisant
//   5. Rate limiting par IP
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types
interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  message?: string;
  remaining_audits?: number;
  trust_score?: number;
  user_id?: string;
}

interface Profile {
  id: string;
  email: string;
  company_siret: string | null;
  company_legal_name: string | null;
  professional_email: string | null;
  company_website: string | null;
  trust_score: number;
  max_free_audits: number;
  free_audits_used: number;
}

// Fonction pour extraire le domaine d'une URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// Fonction pour extraire le domaine d'un email
function extractEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

// Fonction principale
serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Créer le client Supabase avec le token de l'utilisateur
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Créer un client avec service_role pour les opérations admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Vérifier l'authentification
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'not_authenticated',
        message: 'Vous devez être connecté pour lancer un audit.'
      };

      // Logger la tentative refusée
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await supabaseAdmin
        .from('audit_access_control')
        .insert({
          user_id: null,
          access_granted: false,
          access_reason: 'denied',
          denial_reason: 'not_authenticated',
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent')
        });

      return new Response(
        JSON.stringify(result),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Checking access for user: ${user.id} (${user.email})`);

    // Parser le body
    const { websiteUrl } = await req.json();

    // 2. Vérifier que l'email est confirmé
    if (!user.email_confirmed_at) {
      console.log(`Email not confirmed for user ${user.id}`);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'email_not_confirmed',
        message: 'Veuillez confirmer votre email avant de lancer un audit. Vérifiez votre boîte mail.',
        user_id: user.id
      };

      // Logger la tentative refusée
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await supabaseAdmin
        .from('audit_access_control')
        .insert({
          user_id: user.id,
          access_granted: false,
          access_reason: 'denied',
          denial_reason: 'email_not_confirmed',
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent')
        });

      return new Response(
        JSON.stringify(result),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. Récupérer le profil
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'profile_not_found',
        message: 'Profil utilisateur introuvable. Veuillez contacter le support.',
        user_id: user.id
      };

      return new Response(
        JSON.stringify(result),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 4. Vérifier que les informations entreprise sont remplies
    if (!profile.company_siret) {
      console.log(`Company info missing for user ${user.id}`);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'company_info_missing',
        message: 'Veuillez compléter vos informations entreprise avant de lancer un audit.',
        user_id: user.id
      };

      // Logger la tentative refusée
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await supabaseAdmin
        .from('audit_access_control')
        .insert({
          user_id: user.id,
          access_granted: false,
          access_reason: 'denied',
          denial_reason: 'company_info_missing',
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent'),
          trust_score_at_access: profile.trust_score
        });

      return new Response(
        JSON.stringify(result),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 5. Vérifier les audits gratuits restants
    if (profile.free_audits_used >= profile.max_free_audits) {
      console.log(`Free audits exhausted for user ${user.id} (${profile.free_audits_used}/${profile.max_free_audits})`);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'free_audits_exhausted',
        message: `Vous avez utilisé vos ${profile.max_free_audits} audits gratuits. Passez à la version Premium pour continuer.`,
        remaining_audits: 0,
        trust_score: profile.trust_score,
        user_id: user.id
      };

      // Logger la tentative refusée
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await supabaseAdmin
        .from('audit_access_control')
        .insert({
          user_id: user.id,
          access_granted: false,
          access_reason: 'denied',
          denial_reason: 'free_audits_exhausted',
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent'),
          trust_score_at_access: profile.trust_score
        });

      return new Response(
        JSON.stringify(result),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 6. Vérifier le trust score (seulement pour le premier audit)
    if (profile.trust_score < 30 && profile.free_audits_used === 0) {
      console.log(`Low trust score for user ${user.id}: ${profile.trust_score}`);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'low_trust_score',
        message: 'Votre compte nécessite une validation manuelle. Un administrateur vous contactera sous 24h.',
        trust_score: profile.trust_score,
        user_id: user.id
      };

      // Logger la tentative refusée
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await supabaseAdmin
        .from('audit_access_control')
        .insert({
          user_id: user.id,
          access_granted: false,
          access_reason: 'denied',
          denial_reason: 'low_trust_score',
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent'),
          trust_score_at_access: profile.trust_score
        });

      return new Response(
        JSON.stringify(result),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 7. Vérifier la correspondance email professionnel / domaine du site (warning, pas bloquant)
    if (websiteUrl && profile.professional_email) {
      const emailDomain = extractEmailDomain(profile.professional_email);
      const websiteDomain = extractDomain(websiteUrl);

      if (emailDomain && websiteDomain && emailDomain !== websiteDomain) {
        console.log(`⚠️ Email domain mismatch for user ${user.id}: ${emailDomain} vs ${websiteDomain}`);
        
        // Baisser le trust score de 10 points
        const newTrustScore = Math.max(0, profile.trust_score - 10);
        await supabaseAdmin
          .from('profiles')
          .update({ trust_score: newTrustScore })
          .eq('id', user.id);

        // Logger le warning
        await supabaseAdmin
          .from('company_verification_logs')
          .insert({
            user_id: user.id,
            siret: profile.company_siret,
            verification_type: 'email_domain_mismatch',
            verification_status: 'warning',
            verification_data: {
              professional_email: profile.professional_email,
              website_url: websiteUrl,
              email_domain: emailDomain,
              website_domain: websiteDomain,
              message: 'Email professionnel ne correspond pas au domaine du site audité'
            }
          });
      }
    }

    // 8. Rate limiting par IP (max 10 tentatives par heure)
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const { count: ipCount } = await supabaseAdmin
      .from('audit_access_control')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo);

    if (ipCount && ipCount >= 10) {
      console.log(`Rate limit exceeded for IP ${ipAddress}: ${ipCount} requests in last hour`);
      
      const result: AccessCheckResult = {
        allowed: false,
        reason: 'rate_limit_exceeded',
        message: 'Trop de requêtes depuis votre adresse IP. Veuillez réessayer dans 1 heure.',
        user_id: user.id
      };

      // Logger la tentative refusée
      await supabaseAdmin
        .from('audit_access_control')
        .insert({
          user_id: user.id,
          access_granted: false,
          access_reason: 'denied',
          denial_reason: 'rate_limit_exceeded',
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent'),
          trust_score_at_access: profile.trust_score
        });

      return new Response(
        JSON.stringify(result),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ Toutes les vérifications sont passées : accès autorisé
    console.log(`✅ Access granted for user ${user.id} - Remaining audits: ${profile.max_free_audits - profile.free_audits_used}`);

    // Logger l'accès autorisé
    await supabaseAdmin
      .from('audit_access_control')
      .insert({
        user_id: user.id,
        access_granted: true,
        access_reason: 'free_trial',
        ip_address: ipAddress,
        user_agent: req.headers.get('user-agent'),
        trust_score_at_access: profile.trust_score
      });

    const result: AccessCheckResult = {
      allowed: true,
      reason: 'free_trial',
      remaining_audits: profile.max_free_audits - profile.free_audits_used,
      trust_score: profile.trust_score,
      user_id: user.id
    };

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    const result: AccessCheckResult = {
      allowed: false,
      reason: 'internal_error',
      message: 'Erreur inattendue lors de la vérification d\'accès. Veuillez réessayer.'
    };

    return new Response(
      JSON.stringify(result),
      { 
        status: 500, 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
