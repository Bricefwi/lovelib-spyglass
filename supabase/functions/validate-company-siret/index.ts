// ============================================================================
// EDGE FUNCTION : validate-company-siret
// ============================================================================
// Objectif : Valider un SIRET/SIREN via l'API INSEE et retourner les données légales
// API : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types
interface InseeEtablissement {
  siret: string;
  siren: string;
  etatAdministratifEtablissement: string;
  dateCreationEtablissement: string;
  uniteLegale: {
    denominationUniteLegale: string;
    categorieJuridiqueUniteLegale: string;
  };
  adresseEtablissement: {
    numeroVoieEtablissement: string;
    typeVoieEtablissement: string;
    libelleVoieEtablissement: string;
    codePostalEtablissement: string;
    libelleCommuneEtablissement: string;
  };
}

interface InseeResponse {
  etablissement: InseeEtablissement;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  siret?: string;
  siren?: string;
  legalName?: string;
  address?: string;
  legalForm?: string;
  creationDate?: string;
  isActive?: boolean;
}

// Fonction pour valider le format SIRET
function isValidSiretFormat(siret: string): boolean {
  return /^[0-9]{14}$/.test(siret);
}

// Fonction pour valider le format SIREN
function isValidSirenFormat(siren: string): boolean {
  return /^[0-9]{9}$/.test(siren);
}

// Fonction pour extraire SIREN depuis SIRET
function extractSiren(siret: string): string {
  return siret.substring(0, 9);
}

// Fonction pour appeler l'API INSEE
async function fetchInseeData(siret: string, token: string): Promise<InseeResponse> {
  const response = await fetch(
    `https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API INSEE error (${response.status}): ${errorText}`);
  }

  return await response.json();
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
    // Récupérer le token INSEE
    const inseeToken = Deno.env.get('INSEE_API_TOKEN');
    if (!inseeToken) {
      console.error('INSEE_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Service de validation temporairement indisponible. Veuillez réessayer plus tard.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parser le body
    const { siret } = await req.json();

    if (!siret) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Le SIRET est requis' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Nettoyer le SIRET (enlever espaces et tirets)
    const cleanSiret = siret.replace(/[\s-]/g, '');

    // Validation format
    if (!isValidSiretFormat(cleanSiret)) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Format SIRET invalide. Le SIRET doit contenir exactement 14 chiffres.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Validating SIRET: ${cleanSiret}`);

    // Appel API INSEE
    let inseeData: InseeResponse;
    try {
      inseeData = await fetchInseeData(cleanSiret, inseeToken);
    } catch (error) {
      console.error('INSEE API error:', error);
      
      // Si 404, SIRET introuvable
      if (error instanceof Error && error.message.includes('404')) {
        return new Response(
          JSON.stringify({ 
            valid: false,
            error: 'SIRET introuvable dans la base INSEE. Vérifiez le numéro saisi.' 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Autre erreur API
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Erreur lors de la validation du SIRET. Veuillez réessayer.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const etablissement = inseeData.etablissement;

    // Vérifier que l'entreprise est active
    const isActive = etablissement.etatAdministratifEtablissement === 'A';
    if (!isActive) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Cette entreprise n\'est plus active selon la base INSEE.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construire l'adresse complète
    const adresse = etablissement.adresseEtablissement;
    const fullAddress = [
      adresse.numeroVoieEtablissement,
      adresse.typeVoieEtablissement,
      adresse.libelleVoieEtablissement
    ]
      .filter(Boolean)
      .join(' ') + 
      `, ${adresse.codePostalEtablissement} ${adresse.libelleCommuneEtablissement}`;

    // Extraire SIREN
    const siren = extractSiren(cleanSiret);

    // Logger le succès
    console.log(`✅ SIRET validated: ${cleanSiret} - ${etablissement.uniteLegale.denominationUniteLegale}`);

    // Créer le client Supabase pour logger
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Logger la vérification (si utilisateur authentifié)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          await supabaseClient
            .from('company_verification_logs')
            .insert({
              user_id: user.id,
              siret: cleanSiret,
              verification_type: 'insee_api',
              verification_status: 'success',
              verification_data: {
                legal_name: etablissement.uniteLegale.denominationUniteLegale,
                address: fullAddress,
                legal_form: etablissement.uniteLegale.categorieJuridiqueUniteLegale,
                creation_date: etablissement.dateCreationEtablissement,
                is_active: isActive
              }
            });
        }
      } catch (logError) {
        console.error('Error logging verification:', logError);
        // Ne pas bloquer la réponse si le logging échoue
      }
    }

    // Retourner les données structurées
    const result: ValidationResult = {
      valid: true,
      siret: cleanSiret,
      siren: siren,
      legalName: etablissement.uniteLegale.denominationUniteLegale,
      address: fullAddress,
      legalForm: etablissement.uniteLegale.categorieJuridiqueUniteLegale,
      creationDate: etablissement.dateCreationEtablissement,
      isActive: isActive
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
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: 'Erreur inattendue lors de la validation. Veuillez réessayer.' 
      }),
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
