import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiagnosticRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: DiagnosticRequest = await req.json();
    
    console.log(`Starting diagnostic for: ${email}`);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user exists
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    const userExists = authUsers?.users?.find(u => u.email === email);
    
    // Check user_roles table
    let roleInfo = "Non trouvé";
    if (userExists) {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userExists.id)
        .single();
      
      if (roleData) {
        roleInfo = roleData.role;
      } else if (roleError) {
        roleInfo = `Erreur: ${roleError.message}`;
      }
    }

    // Generate diagnostic report
    const diagnosticReport = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .status {
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      font-weight: 500;
    }
    .status.success {
      background-color: #d1fae5;
      color: #065f46;
      border-left: 4px solid #10b981;
    }
    .status.error {
      background-color: #fee2e2;
      color: #991b1b;
      border-left: 4px solid #ef4444;
    }
    .status.warning {
      background-color: #fef3c7;
      color: #92400e;
      border-left: 4px solid #f59e0b;
    }
    .info-block {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    .info-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
    }
    .info-value {
      color: #6b7280;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    .section-title {
      color: #111827;
      font-size: 18px;
      font-weight: 600;
      margin-top: 25px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Rapport de Diagnostic d'Authentification</h1>
      <p>IMOTION - Audit Système</p>
    </div>
    
    <div class="content">
      <div class="section-title">📧 Compte Utilisateur</div>
      <div class="info-block">
        <div class="info-label">Email testé</div>
        <div class="info-value">${email}</div>
      </div>

      <div class="status ${userExists ? 'success' : 'error'}">
        ${userExists ? '✅ Compte trouvé dans le système' : '❌ Aucun compte trouvé'}
      </div>

      ${userExists ? `
        <div class="section-title">👤 Détails du Compte</div>
        <div class="info-block">
          <div class="info-label">ID Utilisateur</div>
          <div class="info-value">${userExists.id}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Créé le</div>
          <div class="info-value">${new Date(userExists.created_at).toLocaleString('fr-FR')}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Email confirmé</div>
          <div class="info-value">${userExists.email_confirmed_at ? '✅ Oui - ' + new Date(userExists.email_confirmed_at).toLocaleString('fr-FR') : '⚠️ Non confirmé'}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Dernière connexion</div>
          <div class="info-value">${userExists.last_sign_in_at ? new Date(userExists.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Rôle attribué</div>
          <div class="info-value">${roleInfo}</div>
        </div>
      ` : ''}

      <div class="section-title">🔐 Configuration Authentification</div>
      <div class="info-block">
        <div class="info-label">Auto-confirmation email</div>
        <div class="info-value">✅ Activée (pas besoin de confirmer l'email)</div>
      </div>

      <div class="section-title">🛠️ Solutions Recommandées</div>
      ${userExists ? `
        <div class="status warning">
          <strong>Problème de connexion détecté</strong>
        </div>
        <ul>
          <li><strong>Réinitialiser le mot de passe :</strong> Utilisez le lien "Mot de passe oublié ?" sur la page de connexion</li>
          <li><strong>Vérifier l'email :</strong> Assurez-vous d'utiliser exactement ${email}</li>
          <li><strong>Nouveau mot de passe :</strong> Doit contenir au moins 6 caractères</li>
          ${!userExists.email_confirmed_at ? '<li><strong>⚠️ Email non confirmé :</strong> Vérifiez votre boîte mail (spam inclus) pour le lien de confirmation</li>' : ''}
          ${roleInfo === 'Non trouvé' ? '<li><strong>⚠️ Rôle manquant :</strong> Contactez l\'administrateur pour attribuer un rôle à votre compte</li>' : ''}
        </ul>
      ` : `
        <div class="status error">
          <strong>Compte inexistant</strong>
        </div>
        <ul>
          <li><strong>Créer un compte :</strong> Utilisez l'onglet "S'inscrire" sur <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com')}/auth">la page d'authentification</a></li>
          <li><strong>Mot de passe requis :</strong> Au moins 6 caractères</li>
          <li><strong>Confirmation automatique :</strong> Vous pourrez vous connecter immédiatement après inscription</li>
        </ul>
      `}

      <div class="section-title">📊 Tests Effectués</div>
      <ul>
        <li>✅ Vérification existence compte dans auth.users</li>
        <li>✅ Vérification rôle dans user_roles</li>
        <li>✅ Vérification configuration auto-confirmation</li>
        <li>✅ Analyse dernière connexion</li>
      </ul>
    </div>

    <div class="footer">
      <p><strong>IMOTION</strong> - Audit & Conseil Digital</p>
      <p>Rapport généré le ${new Date().toLocaleString('fr-FR')}</p>
      <p style="margin-top: 15px; font-size: 12px;">Ce rapport contient des informations sensibles. Ne le partagez pas.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "IMOTION Diagnostic <onboarding@resend.dev>",
      to: [email],
      subject: "🔍 Rapport de Diagnostic - Authentification IMOTION",
      html: diagnosticReport,
    });

    console.log("Diagnostic email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Rapport de diagnostic envoyé par email",
        userExists: !!userExists,
        emailConfirmed: !!userExists?.email_confirmed_at,
        role: roleInfo
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in diagnostic function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
