import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw } from "lucide-react";
import { UserActionsDialog } from "./UserActionsDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  company_legal_name: string | null;
  company_siret: string | null;
  trust_score: number | null;
  free_audits_used: number | null;
  account_status: string | null;
  blocked_until: string | null;
  created_at: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter((u) => u.account_status === "pending");
    } else if (activeTab === "active") {
      filtered = filtered.filter((u) => u.account_status === "active");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((u) => u.account_status === "rejected");
    } else if (activeTab === "blocked") {
      filtered = filtered.filter(
        (u) => u.blocked_until && new Date(u.blocked_until) > new Date()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstname?.toLowerCase().includes(term) ||
          u.lastname?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.company_legal_name?.toLowerCase().includes(term) ||
          u.company_siret?.includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchTerm]);

  const getTrustScoreBadge = (score: number | null) => {
    if (!score) return <Badge variant="outline">N/A</Badge>;
    if (score < 30) return <Badge variant="destructive">{score}</Badge>;
    if (score < 60) return <Badge variant="secondary" className="bg-warning text-warning-foreground">{score}</Badge>;
    return <Badge variant="default">{score}</Badge>;
  };

  const getStatusBadge = (user: UserProfile) => {
    if (user.blocked_until && new Date(user.blocked_until) > new Date()) {
      return <Badge variant="destructive">Bloqué</Badge>;
    }
    switch (user.account_status) {
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "active":
        return <Badge variant="default">Actif</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{user.account_status}</Badge>;
    }
  };

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.[0] || ""}${lastname?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Utilisateurs</CardTitle>
        <CardDescription>Modérer et gérer tous les utilisateurs</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, SIRET, entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">
              En attente ({users.filter((u) => u.account_status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Actifs ({users.filter((u) => u.account_status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejetés ({users.filter((u) => u.account_status === "rejected").length})
            </TabsTrigger>
            <TabsTrigger value="blocked">
              Bloqués (
              {
                users.filter(
                  (u) => u.blocked_until && new Date(u.blocked_until) > new Date()
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="all">Tous ({users.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Audits</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.firstname, user.lastname)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.company_legal_name || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.company_siret || "-"}
                    </TableCell>
                    <TableCell>{getTrustScoreBadge(user.trust_score)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.free_audits_used || 0}/3
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Actions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* User Actions Dialog */}
      {selectedUser && (
        <UserActionsDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </Card>
  );
}
