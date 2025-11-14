/**
 * Composant ProtectedRoute
 * 
 * Protège les routes sensibles avec vérifications multiples :
 * - Authentification
 * - Confirmation email
 * - Onboarding complété (SIRET validé)
 * - Statut du compte
 */

import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireClient?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireClient = false,
  requireOnboarding = false,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { role, loading: roleLoading, isAdmin, isClient } = useUserRole();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 1. Vérifier l'authentification
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (requireAuth || requireAdmin || requireClient || requireOnboarding) {
            toast.error("Veuillez vous connecter pour accéder à cette page");
            navigate(redirectTo);
            return;
          }
        }

        const user = session?.user;

        // 2. Vérifier la confirmation email
        if (user && requireOnboarding && !user.email_confirmed_at) {
          toast.error("Veuillez confirmer votre email avant de continuer. Vérifiez votre boîte mail.");
          navigate('/auth');
          return;
        }

        // 3. Vérifier l'onboarding (si requis)
        if (user && requireOnboarding) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_siret, account_status, blocked_until, trust_score')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error("Impossible de récupérer votre profil");
            navigate('/auth');
            return;
          }

          // 4. Vérifier que l'onboarding est complété
          if (!profile?.company_siret) {
            toast.info("Veuillez compléter votre profil entreprise pour continuer");
            navigate('/onboarding/company');
            return;
          }

          // 5. Vérifier que le compte n'est pas bloqué
          if (profile.blocked_until && new Date(profile.blocked_until) > new Date()) {
            const blockedUntilDate = new Date(profile.blocked_until).toLocaleString('fr-FR');
            toast.error(`Compte temporairement bloqué jusqu'au ${blockedUntilDate}`);
            navigate('/');
            return;
          }

          // 6. Vérifier le statut du compte
          if (profile.account_status === 'rejected') {
            toast.error("Votre demande d'accès a été rejetée. Contactez le support.");
            navigate('/');
            return;
          }

          // 7. Avertir si trust score faible (mais ne pas bloquer)
          if (profile.trust_score < 30) {
            toast.warning("Votre compte est en cours de vérification. Certaines fonctionnalités peuvent être limitées.");
          }
        }

        // Attendre que le rôle soit chargé avant de vérifier les permissions admin/client
        if (roleLoading) return;

        // Vérifier le rôle admin si requis
        if (requireAdmin && !isAdmin) {
          toast.error("Accès non autorisé - Réservé aux administrateurs");
          navigate("/");
          return;
        }

        // Vérifier le rôle client si requis
        if (requireClient && !isClient && !isAdmin) {
          toast.error("Accès non autorisé - Réservé aux clients");
          navigate("/");
          return;
        }

        // Toutes les vérifications passées
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error in ProtectedRoute:', error);
        toast.error("Une erreur est survenue lors de la vérification de vos accès");
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [roleLoading, role, isAdmin, isClient, requireAuth, requireAdmin, requireClient, requireOnboarding, navigate, redirectTo]);

  // Afficher un loader pendant la vérification
  if (isChecking || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Vérification de vos accès...</p>
        </div>
      </div>
    );
  }

  // Afficher le contenu si autorisé
  return isAuthorized ? <>{children}</> : null;
}

/**
 * HOC pour protéger une route admin
 */
export function withAdminProtection<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAuth requireAdmin>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * HOC pour protéger une route client
 */
export function withClientProtection<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAuth requireClient>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * HOC pour protéger une route authentifiée (sans rôle spécifique)
 */
export function withAuthProtection<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAuth>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
