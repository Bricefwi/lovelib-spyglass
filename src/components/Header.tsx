import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { ImotionLogo } from "@/components/brand/ImotionLogo";
import { useUserRole } from "@/hooks/useUserRole";
import { UserMenu } from "@/components/UserMenu";

export const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useUserRole();

  // Cacher le Header sur les pages admin/client/dashboard
  if (location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/client') ||
      location.pathname.startsWith('/dashboard')) {
    return null;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartProject = () => {
    if (session) {
      if (isAdmin) {
        navigate("/admin/audits");
      } else {
        navigate("/client/audits");
      }
    } else {
      navigate("/auth");
    }
  };

  // Navigation simplifiée - seulement les liens principaux
  const baseNavigation = [
    { name: "Solutions", href: "/solutions" },
    { name: "Comment ça marche", href: "/how-it-works" },
    { name: "Tarifs", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  const adminNavigation = isAdmin ? [
    { name: "Admin", href: "/admin/dashboard" },
  ] : [];

  const navigation = [
    ...baseNavigation,
    ...adminNavigation,
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--ink-100))] bg-white/85 backdrop-blur-md"
      style={{ fontFamily: "'General Sans', Inter, sans-serif" }}
    >
      {/* Signature flame hairline */}
      <div className="h-[2px] w-full" style={{ backgroundImage: "var(--gradient-flame)" }} />
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer text-3xl"
            onClick={() => navigate("/")}
          >
            <ImotionLogo tone="dark" showTagline />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group relative text-sm font-semibold tracking-tight transition-colors ${
                    active ? "text-[hsl(var(--coral-600))]" : "text-[hsl(var(--ink-700))] hover:text-[hsl(var(--ink-900))]"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full transition-all ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{ backgroundImage: "var(--gradient-flame)" }}
                  />
                </button>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <UserMenu session={session} />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--ink-700))] hover:bg-[hsl(var(--ink-50))] hover:text-[hsl(var(--ink-900))]"
                  onClick={() => navigate("/auth")}
                >
                  Se connecter
                </Button>
                <Button
                  size="sm"
                  className="h-10 rounded-xl px-5 font-semibold text-white shadow-coral hover:shadow-glow"
                  style={{ backgroundImage: "var(--gradient-flame)" }}
                  onClick={handleStartProject}
                >
                  Démarrer
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-3">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium text-foreground hover:text-primary hover:bg-muted transition-colors text-left py-2 px-3 rounded-md"
                >
                  {item.name}
                </button>
              ))}

              <div className="border-t border-border my-2"></div>

              {session ? (
                <div className="flex flex-col gap-2 px-3 py-2">
                  <UserMenu session={session} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Se connecter
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                    onClick={() => {
                      handleStartProject();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Démarrer
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};