import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Activity, BarChart3, ShieldAlert, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminAuditsTab } from "@/components/admin/AdminAuditsTab";
import { AdminLogsTab } from "@/components/admin/AdminLogsTab";
import { AdminStatsTab } from "@/components/admin/AdminStatsTab";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  blockedUsers: number;
  totalAudits: number;
  auditsToday: number;
  rateLimit Warnings: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role, loading: roleLoading, isAdmin } = useUserRole();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [roleLoading, isAdmin, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch dashboard statistics
        const [usersResult, auditsResult, accessControlResult] = await Promise.all([
          supabase.from("profiles").select("user_id, account_status, blocked_until"),
          supabase.from("pre_audits").select("id, created_at"),
          supabase
            .from("audit_access_control")
            .select("id, allowed, created_at")
            .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const totalUsers = usersResult.data?.length || 0;
        const activeUsers =
          usersResult.data?.filter((u) => u.account_status === "active").length || 0;
        const pendingUsers =
          usersResult.data?.filter((u) => u.account_status === "pending").length || 0;
        const blockedUsers =
          usersResult.data?.filter(
            (u) => u.blocked_until && new Date(u.blocked_until) > new Date()
          ).length || 0;

        const totalAudits = auditsResult.data?.length || 0;
        const today = new Date().toISOString().split("T")[0];
        const auditsToday =
          auditsResult.data?.filter((a) => a.created_at?.startsWith(today)).length || 0;

        const rateLimitWarnings =
          accessControlResult.data?.filter((a) => !a.allowed).length || 0;

        setStats({
          totalUsers,
          activeUsers,
          pendingUsers,
          blockedUsers,
          totalAudits,
          auditsToday,
          rateLimitWarnings,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">
            Gestion complète des utilisateurs, audits et surveillance
          </p>
        </div>

        {/* KPIs Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers || 0} actifs
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <ShieldAlert className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.pendingUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">À modérer</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalAudits || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.auditsToday || 0} aujourd'hui
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <Activity className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.rateLimitWarnings || 0}</div>
                  <p className="text-xs text-muted-foreground">Refus aujourd'hui</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audits
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="audits">
            <AdminAuditsTab />
          </TabsContent>

          <TabsContent value="logs">
            <AdminLogsTab />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStatsTab />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
