/**
 * AdminFooter Component
 * 
 * Footer de navigation pour les pages admin
 * Permet de retourner à l'accueil ou à la page précédente
 */

import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t bg-background mt-8">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <Button
              variant="default"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
          </div>

          {/* System Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary">MANUS IA 2.0</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Système d'orchestration multi-agents</span>
          </div>

          {/* Version Info */}
          <div className="text-xs text-muted-foreground">
            v2.0.0 • 17 agents spécialisés
          </div>
        </div>
      </div>
    </footer>
  );
}
