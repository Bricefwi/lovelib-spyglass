import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import logoImotion from "@/assets/logo-imotion.png";
import { UserMenu } from "@/components/UserMenu";
import { ArrowLeft, LayoutDashboard, FileText, Plus } from "lucide-react";

export const ClientHeader = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname === '/veille-ia';
  const dashboardPath = isAdminPath ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Back button */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(dashboardPath)}
            >
              <img
                src={logoImotion}
                alt="IMOTION Logo"
                className="h-12 w-auto"
              />
            </div>

            <div className="h-8 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(dashboardPath)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au tableau de bord
            </Button>
          </div>

          {/* Right: Navigation + User menu */}
          <div className="flex items-center gap-3">
            {/* Client navigation */}
            {!isAdminPath && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/client/audits")}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Mes Audits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/client/new-project")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Projet
                </Button>
              </>
            )}

            {/* Admin navigation */}
            {isAdminPath && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/audits")}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Audits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/dashboard")}
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </>
            )}

            {/* User menu */}
            {session && <UserMenu session={session} />}
          </div>
        </div>
      </div>
    </header>
  );
};
