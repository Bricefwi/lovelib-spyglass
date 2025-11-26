import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Github, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Database,
  GitBranch,
  Server
} from "lucide-react";

const AdminSyncSettings = () => {
  const { toast } = useToast();
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Informations de synchronisation (exemple)
  const githubStatus = {
    connected: true,
    repo: "lovelib-spyglass",
    branch: "main",
    lastSync: "Il y a 2 heures",
    commits: 307,
  };

  const cloudStatus = {
    active: true,
    projectId: "gzfrcshvrktpejctlgta",
    region: "eu-west-1",
    database: "PostgreSQL 15",
    edgeFunctions: 23,
    lastDeploy: "Il y a 2 heures",
  };

  const handleRefreshSync = async () => {
    setIsRefreshing(true);
    // Simuler une synchronisation
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Synchronisation réussie",
        description: "Les modifications ont été synchronisées avec GitHub et Cloud.",
      });
    }, 2000);
  };

  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    toast({
      title: checked ? "Synchronisation automatique activée" : "Synchronisation automatique désactivée",
      description: checked 
        ? "Les modifications seront automatiquement synchronisées."
        : "Vous devrez synchroniser manuellement.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Paramètres de Synchronisation</h1>
          <p className="text-muted-foreground">
            Gérez la synchronisation entre GitHub et Lovable Cloud
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Statut GitHub */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  <CardTitle>GitHub</CardTitle>
                </div>
                {githubStatus.connected ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connecté
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Déconnecté
                  </Badge>
                )}
              </div>
              <CardDescription>Synchronisation bidirectionnelle active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Repository</span>
                  <span className="font-medium">{githubStatus.repo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    Branche
                  </span>
                  <span className="font-medium">{githubStatus.branch}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Commits</span>
                  <span className="font-medium">{githubStatus.commits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dernière sync
                  </span>
                  <span className="font-medium">{githubStatus.lastSync}</span>
                </div>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" size="sm">
                <Github className="h-4 w-4 mr-2" />
                Voir sur GitHub
              </Button>
            </CardContent>
          </Card>

          {/* Statut Lovable Cloud */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  <CardTitle>Lovable Cloud</CardTitle>
                </div>
                {cloudStatus.active ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Actif
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactif
                  </Badge>
                )}
              </div>
              <CardDescription>Backend Supabase intégré</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    Région
                  </span>
                  <span className="font-medium">{cloudStatus.region}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Base de données
                  </span>
                  <span className="font-medium">{cloudStatus.database}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Edge Functions</span>
                  <span className="font-medium">{cloudStatus.edgeFunctions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dernier déploiement
                  </span>
                  <span className="font-medium">{cloudStatus.lastDeploy}</span>
                </div>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" size="sm">
                <Cloud className="h-4 w-4 mr-2" />
                Ouvrir Cloud Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Paramètres de synchronisation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paramètres de Synchronisation</CardTitle>
            <CardDescription>
              Configurez le comportement de la synchronisation automatique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Synchronisation automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Synchroniser automatiquement les modifications entre GitHub et Lovable
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={handleToggleAutoSync}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Intervalle de synchronisation</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Fréquence de vérification des modifications (en minutes)
              </p>
              <div className="flex gap-2">
                {[1, 5, 10, 30].map((interval) => (
                  <Button
                    key={interval}
                    variant={syncInterval === interval ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSyncInterval(interval);
                      toast({
                        title: "Intervalle mis à jour",
                        description: `Synchronisation toutes les ${interval} minute(s)`,
                      });
                    }}
                  >
                    {interval} min
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Paramètres sauvegardés",
                    description: "Vos préférences ont été enregistrées.",
                  });
                }}
              >
                Enregistrer
              </Button>
              <Button
                onClick={handleRefreshSync}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "Synchronisation..." : "Synchroniser maintenant"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs de synchronisation */}
        <Card>
          <CardHeader>
            <CardTitle>Historique de Synchronisation</CardTitle>
            <CardDescription>Dernières activités de synchronisation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  time: "Il y a 2 heures",
                  action: "Correction de l'importation de l'étiquette",
                  status: "success",
                  source: "GitHub → Lovable",
                },
                {
                  time: "Il y a 2 heures",
                  action: "Changements dans publique, source, supabase",
                  status: "success",
                  source: "Lovable → GitHub",
                },
                {
                  time: "Il y a 3 jours",
                  action: "Changements dans Supabase",
                  status: "success",
                  source: "Lovable → GitHub",
                },
                {
                  time: "Il y a 2 semaines",
                  action: "Fonctionnalité: Ajout système validation d'entreprise",
                  status: "success",
                  source: "GitHub → Lovable",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{log.time}</span>
                      <span>•</span>
                      <span>{log.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSyncSettings;
