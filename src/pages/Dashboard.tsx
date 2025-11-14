import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, FileText, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
}

const Dashboard = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalAudits, setTotalAudits] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Récupérer le profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_legal_name, company_siret, company_siren, company_address, company_website, trust_score, free_audits_used, account_status, last_audit_at')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Compter le nombre total d'audits
        const { count, error: countError } = await supabase
          .from('pre_audits')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id);

        if (countError) throw countError;
        setTotalAudits(count || 0);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreStars = (score: number) => {
    const stars = Math.floor(score / 20);
    return '⭐'.repeat(stars);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', variant: 'default' as const },
      pending: { label: 'En attente', variant: 'secondary' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const freeAuditsRemaining = Math.max(0, 3 - (profile?.free_audits_used || 0));
  const canStartAudit = freeAuditsRemaining > 0 || profile?.account_status === 'active';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground mb-8">Bienvenue sur votre espace client IMOTION</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Informations Entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations Entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="text-sm">{profile.company_address}</p>
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
                  Statut de votre Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getTrustScoreColor(profile.trust_score)}`}>
                      {profile.trust_score}/100
                    </span>
                    <span className="text-xl">{getTrustScoreStars(profile.trust_score)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Audits gratuits restants</p>
                  <p className="text-2xl font-bold">
                    {freeAuditsRemaining}/3
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  <Badge variant={getStatusBadge(profile.account_status).variant}>
                    {getStatusBadge(profile.account_status).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Vos Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Vos Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total audits réalisés</p>
                  <p className="text-2xl font-bold">{totalAudits}</p>
                </div>
                {profile.last_audit_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dernier audit</p>
                    <p className="text-sm">
                      {new Date(profile.last_audit_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {freeAuditsRemaining > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="h-4 w-4" />
                    <span>Prochain audit gratuit disponible</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions Rapides */}
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
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/audit-gratuit')}
                  disabled={!canStartAudit}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Démarrer un nouvel audit
                </Button>
                {!canStartAudit && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Vous avez utilisé vos 3 audits gratuits
                  </p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/client/audits')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Voir mes rapports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
