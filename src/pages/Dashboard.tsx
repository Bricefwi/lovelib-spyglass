import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, FileText, Sparkles, Shield, Clock, Activity, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';
import { useUserRole } from '@/hooks/useUserRole';

interface ProfileData {
  company_legal_name: string;
  company_siret: string;
  company_siren: string;
  company_address: string;
  company_website: string;
  trust_score: number;
  free_audits_used: number;
  account_status: string;
  last_audit_at: string | null;
  firstname: string;
  lastname: string;
  email: string;
}

interface AuditData {
  id: string;
  url: string;
  status: string;
  confidence: number | null;
  created_at: string;
  company?: { name?: string; website?: string };
}

const Dashboard = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<AuditData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  // Redirection automatique des admins vers leur tableau de bord dédié
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // ✅ Récupérer le profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // ✅ Récupérer UNIQUEMENT les audits de cet utilisateur
      const { data: auditsData, error: auditsError } = await supabase
        .from('pre_audits')
        .select(`
          id,
          url,
          status,
          confidence,
          created_at,
          company:companies(name, website)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (auditsError) throw auditsError;
      setAudits(auditsData || []);

      // ✅ Calculer les statistiques personnelles
      const { data: allAudits } = await supabase
        .from('pre_audits')
        .select('status')
        .eq('created_by', user.id);

      const total = allAudits?.length || 0;
      const completed = allAudits?.filter(a => a.status === 'consolidated').length || 0;
      const inProgress = allAudits?.filter(a => 
        ['collecting', 'ai_running', 'consolidating'].includes(a.status)
      ).length || 0;
      const pending = allAudits?.filter(a => a.status === 'new' || a.status === 'pending').length || 0;

      setStats({ total, completed, inProgress, pending });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (preAuditId: string) => {
    try {
      // Vérifier que l'utilisateur possède cet audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: auditCheck } = await supabase
        .from("pre_audits")
        .select("created_by")
        .eq("id", preAuditId)
        .single();

      if (!auditCheck || auditCheck.created_by !== user.id) {
        toast.error("Accès non autorisé");
        return;
      }

      const { data, error } = await supabase
        .from("audit_reports")
        .select("id")
        .eq("pre_audit_id", preAuditId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error("Aucun rapport disponible");
        return;
      }

      window.open(`/audit-report/${data.id}`, "_blank");
    } catch (error) {
      console.error("Error viewing report:", error);
      toast.error("Erreur lors de l'ouverture du rapport");
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      consolidated: { label: 'Terminé', variant: 'default' },
      collecting: { label: 'Collecte', variant: 'secondary' },
      ai_running: { label: 'Analyse IA', variant: 'secondary' },
      consolidating: { label: 'Consolidation', variant: 'secondary' },
      new: { label: 'Nouveau', variant: 'outline' },
      pending: { label: 'En attente', variant: 'outline' },
      error: { label: 'Erreur', variant: 'destructive' },
    };
    return statusConfig[status] || { label: status, variant: 'outline' as const };
  };

  const getAccountStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      active: { label: 'Actif', variant: 'default' },
      pending: { label: 'En attente', variant: 'secondary' },
      rejected: { label: 'Rejeté', variant: 'destructive' },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const freeAuditsRemaining = Math.max(0, 3 - (profile?.free_audits_used || 0));
  const canStartAudit = freeAuditsRemaining > 0 || profile?.account_status === 'active';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Erreur : profil introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          {/* En-tête personnalisé */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, {profile.firstname} {profile.lastname}
            </h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre tableau de bord personnel IMOTION
            </p>
          </div>

          {/* Statistiques en un coup d'œil */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Audits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Terminés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Audits gratuits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {freeAuditsRemaining}/3
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Colonne gauche - Infos & Statut */}
            <div className="space-y-6">
              {/* Informations Entreprise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Votre Entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Raison sociale</p>
                    <p className="font-semibold">{profile.company_legal_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">SIRET</p>
                      <p className="font-mono text-sm">{profile.company_siret}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SIREN</p>
                      <p className="font-mono text-sm">{profile.company_siren}</p>
                    </div>
                  </div>
                  {profile.company_website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Site web</p>
                      <a
                        href={profile.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.company_website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statut du Compte */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Statut du Compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getTrustScoreColor(profile.trust_score)}`}>
                        {profile.trust_score}/100
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Statut</p>
                    <Badge variant={getAccountStatusBadge(profile.account_status).variant}>
                      {getAccountStatusBadge(profile.account_status).label}
                    </Badge>
                  </div>
                  {profile.last_audit_at && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dernier audit</p>
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(profile.last_audit_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Colonne centrale - Audits récents */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Vos Audits Récents
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/client/audits')}
                    >
                      Voir tout
                    </Button>
                  </div>
                  <CardDescription>
                    Les 5 derniers audits que vous avez réalisés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {audits.length > 0 ? (
                    <div className="space-y-3">
                      {audits.map((audit) => (
                        <div 
                          key={audit.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">
                                {audit.company?.name || audit.company?.website || audit.url}
                              </p>
                              <Badge variant={getStatusBadge(audit.status).variant} className="shrink-0">
                                {getStatusBadge(audit.status).label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(audit.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {audit.status === 'consolidated' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewReport(audit.id)}
                              className="ml-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-2">Aucun audit pour le moment</p>
                      <p className="text-sm">Lancez votre premier audit pour commencer</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Actions Rapides
              </CardTitle>
              <CardDescription>
                Démarrez un nouvel audit ou consultez vos rapports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="w-full h-20 text-lg" 
                  onClick={() => navigate('/audit-gratuit')}
                  disabled={!canStartAudit}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Nouvel Audit
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-20 text-lg"
                  onClick={() => navigate('/client/audits')}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Mes Rapports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-20 text-lg"
                  onClick={() => navigate('/contact')}
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Stratégie & Conseil
                </Button>
              </div>
              {!canStartAudit && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Vous avez utilisé vos 3 audits gratuits. Contactez-nous pour en obtenir plus.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      
      {/* 💬 Widget de Chat en Temps Réel */}
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
