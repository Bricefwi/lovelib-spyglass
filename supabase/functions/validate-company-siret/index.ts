// ============================================================================
// EDGE FUNCTION : validate-company-siret
// ============================================================================
// Objectif : Valider un SIRET/SIREN via l'API Recherche Entreprise (PUBLIQUE)
// API : https://recherche-entreprises.api.gouv.fr/
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Schéma de validation Zod pour les entrées
const siretValidationSchema = z.object({
  siret: z.string()
    .trim()
    .length(14, { message: "Le SIRET doit contenir exactement 14 chiffres" })
    .regex(/^[0-9]{14}$/, { message: "Le SIRET ne doit contenir que des chiffres" })
});

// Types
interface RechercheEntrepriseResult {
  siren: string;
  siret: string;
  nom_complet: string;
  nom_raison_sociale: string;
  siege: {
    siret: string;
    adresse: string;
    code_postal: string;
    commune: string;
  };
  activite_principale: string;
  nature_juridique: string;
  date_creation: string;
  etat_administratif: string;
  tranche_effectif_salarie?: string;
}

interface RechercheEntrepriseResponse {
  results: RechercheEntrepriseResult[];
  total_results: number;
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

// Fonction pour appeler l'API Recherche Entreprise (PUBLIQUE)
async function fetchEntrepriseData(siret: string): Promise<RechercheEntrepriseResponse> {
  const response = await fetch(
    `https://recherche-entreprises.api.gouv.fr/search?siret=${siret}`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Recherche Entreprise error (${response.status}): ${errorText}`);
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
    // Parser le body
    const body = await req.json();
    
    // **SÉCURITÉ : Validation Zod stricte des entrées**
    const validation = siretValidationSchema.safeParse(body);
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Données invalides';
      console.error('Validation error:', validation.error);
      
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: errorMessage
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const cleanSiret = validation.data.siret;
    console.log(`Validating SIRET: ${cleanSiret}`);

    // Appel API Recherche Entreprise
    let entrepriseData: RechercheEntrepriseResponse;
    try {
      entrepriseData = await fetchEntrepriseData(cleanSiret);
    } catch (error) {
      console.error('API Recherche Entreprise error:', error);
      
      // Si 404, SIRET introuvable
      if (error instanceof Error && error.message.includes('404')) {
        return new Response(
          JSON.stringify({ 
            valid: false,
            error: 'SIRET introuvable dans la base Sirene. Vérifiez le numéro saisi.' 
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

    // Vérifier qu'on a des résultats
    if (entrepriseData.total_results === 0 || entrepriseData.results.length === 0) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'SIRET introuvable dans la base Sirene. Vérifiez le numéro saisi.' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const etablissement = entrepriseData.results[0];

    // Vérifier que l'entreprise est active
    const isActive = etablissement.etat_administratif === 'A';
    if (!isActive) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Cette entreprise n\'est plus active selon la base Sirene.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extraire SIREN
    const siren = extractSiren(cleanSiret);

    // Logger le succès
    console.log(`✅ SIRET validated: ${cleanSiret} - ${etablissement.nom_raison_sociale}`);

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
              verification_type: 'recherche_entreprise_api',
              verification_status: 'success',
              verification_data: {
                legal_name: etablissement.nom_raison_sociale,
                address: etablissement.siege.adresse,
                legal_form: etablissement.nature_juridique,
                creation_date: etablissement.date_creation,
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
      legalName: etablissement.nom_raison_sociale,
      address: etablissement.siege.adresse,
      legalForm: etablissement.nature_juridique,
      creationDate: etablissement.date_creation,
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
