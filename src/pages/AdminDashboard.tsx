import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ClientHeader } from "@/components/ClientHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Loader2, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  Eye
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface DashboardStats {
  totalAudits: number;
  pendingAudits: number;
  completedAudits: number;
  errorAudits: number;
  totalUsers: number;
  unreadMessages: number;
}

interface RecentAudit {
  id: string;
  url: string;
  company_guess: string | null;
  status: string;
  created_at: string;
  confidence: number | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAudits: 0,
    pendingAudits: 0,
    completedAudits: 0,
    errorAudits: 0,
    totalUsers: 0,
    unreadMessages: 0,
  });
  const [recentAudits, setRecentAudits] = useState<RecentAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Statistiques des audits
      const { data: audits, error: auditsError } = await supabase
        .from("pre_audits")
        .select("id, status, url, company_guess, created_at, confidence")
        .order("created_at", { ascending: false });

      if (auditsError) throw auditsError;

      const totalAudits = audits?.length || 0;
      const pendingAudits = audits?.filter(a => 
        a.status === 'new' || a.status === 'collecting' || a.status === 'ai_running'
      ).length || 0;
      const completedAudits = audits?.filter(a => a.status === 'consolidated').length || 0;
      const errorAudits = audits?.filter(a => a.status === 'error').length || 0;

      // Statistiques des utilisateurs
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });

      // Messages non lus (à implémenter selon votre logique)
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .is("read_at", null);

      setStats({
        totalAudits,
        pendingAudits,
        completedAudits,
        errorAudits,
        totalUsers: usersCount || 0,
        unreadMessages: messagesCount || 0,
      });

      setRecentAudits(audits?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      new: { label: "Nouveau", variant: "secondary" },
      collecting: { label: "En cours", variant: "default" },
      ai_running: { label: "Analyse IA", variant: "default" },
      consolidated: { label: "Terminé", variant: "outline" },
      error: { label: "Erreur", variant: "destructive" },
    };
    return config[status] || { label: status, variant: "secondary" };
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col">
      <ClientHeader />
      <div className="flex flex-1">
        <AdminSidebar 
          pendingCount={stats.pendingAudits} 
          unreadMessages={stats.unreadMessages}
        />

        <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
            <p className="text-muted-foreground mt-2">
              Vue d'ensemble de l'activité et des demandes en cours
            </p>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Audits</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalAudits}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                Tous les audits
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-3xl font-bold mt-2">{stats.pendingAudits}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-orange-500">
                <Activity className="h-3 w-3 mr-1" />
                À traiter
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terminés</p>
                  <p className="text-3xl font-bold mt-2">{stats.completedAudits}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complétés
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-blue-500">
                <Users className="h-3 w-3 mr-1" />
                Total inscrits
              </div>
            </Card>
          </div>

          {/* Alertes et actions rapides */}
          {stats.pendingAudits > 0 && (
            <Card className="p-6 border-l-4 border-l-orange-500 bg-orange-50/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {stats.pendingAudits} demande{stats.pendingAudits > 1 ? 's' : ''} en attente de traitement
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Des audits nécessitent votre attention
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate("/admin/audits")} variant="outline" size="sm">
                  Voir les audits
                </Button>
              </div>
            </Card>
          )}

          {/* Audits récents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Audits Récents</h2>
              <Button onClick={() => navigate("/admin/audits")} variant="ghost" size="sm">
                Voir tout
              </Button>
            </div>

            <div className="space-y-4">
              {recentAudits.length > 0 ? (
                recentAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-foreground">
                          {audit.company_guess || audit.url}
                        </h4>
                        <Badge variant={getStatusBadge(audit.status).variant}>
                          {getStatusBadge(audit.status).label}
                        </Badge>
                        {audit.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(audit.confidence)}% confiance
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{audit.url}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(audit.created_at).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(audit.created_at).toLocaleTimeString("fr-FR")}
                      </p>
                    </div>
                    {audit.status === "consolidated" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/audits`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun audit récent
                </p>
              )}
            </div>
          </Card>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/audits")}>
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Gérer les Audits</h3>
              <p className="text-sm text-muted-foreground">
                Consulter, relancer et envoyer les audits
              </p>
            </Card>

            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/users")}>
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Gérer les Utilisateurs</h3>
              <p className="text-sm text-muted-foreground">
                Voir et administrer les comptes clients
              </p>
            </Card>

            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/veille-ia")}>
              <Activity className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Veille IA</h3>
              <p className="text-sm text-muted-foreground">
                Consulter les dernières actualités IA
              </p>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
