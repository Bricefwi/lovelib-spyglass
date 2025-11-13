/**
 * Composant ProtectedRoute
 * 
 * Protège les routes sensibles en vérifiant l'authentification et les rôles.
 * Redirige automatiquement les utilisateurs non autorisés.
 */

import { ReactNode, useEffect } from "react";
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
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireClient = false,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { role, loading, isAdmin, isClient } = useUserRole();

  useEffect(() => {
    const checkAccess = async () => {
      // Attendre que le chargement soit terminé
      if (loading) return;

      // Vérifier l'authentification si requise
      if (requireAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Vous devez être connecté pour accéder à cette page");
          navigate(redirectTo);
          return;
        }
      }

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
    };

    checkAccess();
  }, [loading, role, isAdmin, isClient, requireAuth, requireAdmin, requireClient, navigate, redirectTo]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#d8232a]" />
          <p className="text-sm text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Si toutes les vérifications passent, afficher le contenu
  return <>{children}</>;
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
