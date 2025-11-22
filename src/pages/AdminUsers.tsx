import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Ban, CheckCircle, TrendingUp, RefreshCw, UserCog, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  user_id: string;
  email: string;
  email_confirmed_at: string | null;
  firstname: string | null;
  lastname: string | null;
  company_legal_name: string | null;
  company_siret: string | null;
  account_status: string | null;
  trust_score: number | null;
  free_audits_used: number | null;
  created_at: string;
  last_audit_at: string | null;
  blocked_until: string | null;
  block_reason: string | null;
  role: 'admin' | 'consultant' | 'client' | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'block' | 'unblock' | 'trust' | 'reset' | 'role'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [trustScoreValue, setTrustScoreValue] = useState(50);
  const [blockUntilDate, setBlockUntilDate] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'consultant' | 'client'>('client');

  const fetchUsers = async () => {
    try {
      // Récupérer tous les utilisateurs depuis auth.users avec leurs profils et rôles
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Récupérer les profils
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profileError) throw profileError;

      // Récupérer les rôles
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (roleError) throw roleError;

      // Combiner les données
      const combinedUsers = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.user_id === user.id);
        const userRole = roles?.find(r => r.user_id === user.id);
        
        return {
          user_id: user.id,
          email: user.email || '',
          email_confirmed_at: user.email_confirmed_at,
          firstname: profile?.firstname || null,
          lastname: profile?.lastname || null,
          company_legal_name: profile?.company_legal_name || null,
          company_siret: profile?.company_siret || null,
          account_status: profile?.account_status || null,
          trust_score: profile?.trust_score || null,
          free_audits_used: profile?.free_audits_used || null,
          created_at: user.created_at,
          last_audit_at: profile?.last_audit_at || null,
          blocked_until: profile?.blocked_until || null,
          block_reason: profile?.block_reason || null,
          role: userRole?.role || null,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      switch (actionType) {
        case 'approve':
          await supabase.rpc('admin_approve_user', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id
          });
          toast.success('Utilisateur approuvé avec succès');
          break;

        case 'reject':
          if (!actionReason) {
            toast.error('Veuillez indiquer une raison');
            return;
          }
          await supabase.rpc('admin_reject_user', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id,
            p_reason: actionReason
          });
          toast.success('Utilisateur rejeté');
          break;

        case 'block':
          if (!actionReason || !blockUntilDate) {
            toast.error('Veuillez indiquer une raison et une date de fin');
            return;
          }
          await supabase.rpc('admin_block_user', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id,
            p_blocked_until: new Date(blockUntilDate).toISOString(),
            p_reason: actionReason
          });
          toast.success('Utilisateur bloqué');
          break;

        case 'unblock':
          await supabase.rpc('admin_unblock_user', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id
          });
          toast.success('Utilisateur débloqué');
          break;

        case 'trust':
          if (!actionReason) {
            toast.error('Veuillez indiquer une raison');
            return;
          }
          await supabase.rpc('admin_adjust_trust_score', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id,
            p_new_score: trustScoreValue,
            p_reason: actionReason
          });
          toast.success('Trust score mis à jour');
          break;

        case 'reset':
          if (!actionReason) {
            toast.error('Veuillez indiquer une raison');
            return;
          }
          await supabase.rpc('admin_reset_free_audits', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id,
            p_reason: actionReason
          });
          toast.success('Audits gratuits réinitialisés');
          break;

        case 'role':
          await supabase.rpc('admin_change_user_role', {
            p_user_id: selectedUser.user_id,
            p_admin_id: user.id,
            p_new_role: selectedRole
          });
          toast.success('Rôle mis à jour avec succès');
          break;
      }

      setActionDialogOpen(false);
      setActionReason('');
      setTrustScoreValue(50);
      setBlockUntilDate('');
      fetchUsers();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Erreur lors de l\'action');
    }
  };

  const openActionDialog = (user: UserProfile, type: typeof actionType) => {
    setSelectedUser(user);
    setActionType(type);
    setTrustScoreValue(user.trust_score || 50);
    setSelectedRole(user.role || 'client');
    setActionDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    const config = {
      active: { label: 'Actif', variant: 'default' as const },
      pending: { label: 'En attente', variant: 'secondary' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getRoleBadge = (role: string | null) => {
    const config = {
      admin: { label: 'Admin', variant: 'default' as const },
      consultant: { label: 'Consultant', variant: 'secondary' as const },
      client: { label: 'Client', variant: 'outline' as const },
    };
    return config[role as keyof typeof config] || { label: 'Aucun', variant: 'outline' as const };
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <UserCog className="inline-block mr-3 h-10 w-10 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les comptes, approuvez les demandes et ajustez les paramètres utilisateurs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs ({users.length})</CardTitle>
            <CardDescription>
              Actions disponibles : Approuver, Rejeter, Bloquer, Ajuster Trust Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>SIRET</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Audits</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const statusBadge = getStatusBadge(user.account_status);
                    return (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.firstname && user.lastname 
                                ? `${user.firstname} ${user.lastname}` 
                                : <span className="text-muted-foreground">Profil incomplet</span>
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {!user.email_confirmed_at && (
                              <Badge variant="outline" className="mt-1 text-xs">Email non confirmé</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.company_legal_name || <span className="text-muted-foreground">Non renseigné</span>}
                        </TableCell>
                        <TableCell>
                          {user.company_siret || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          {user.blocked_until && new Date(user.blocked_until) > new Date() && (
                            <Badge variant="destructive" className="ml-2">Bloqué</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const roleBadge = getRoleBadge(user.role);
                            return <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>;
                          })()}
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getTrustColor(user.trust_score || 0)}`}>
                            {user.trust_score ?? '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.free_audits_used ?? 0} / 3</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(user, 'role')}
                              title="Changer le rôle"
                            >
                              <Users className="h-4 w-4" />
                            </Button>

                            {user.account_status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(user, 'approve')}
                                title="Approuver"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(user, 'trust')}
                              title="Ajuster Trust Score"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>

                            {user.blocked_until && new Date(user.blocked_until) > new Date() ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(user, 'unblock')}
                                title="Débloquer"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openActionDialog(user, 'block')}
                                title="Bloquer"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(user, 'reset')}
                              title="Réinitialiser audits"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approuver l\'utilisateur'}
              {actionType === 'reject' && 'Rejeter l\'utilisateur'}
              {actionType === 'block' && 'Bloquer l\'utilisateur'}
              {actionType === 'unblock' && 'Débloquer l\'utilisateur'}
              {actionType === 'trust' && 'Ajuster le Trust Score'}
              {actionType === 'reset' && 'Réinitialiser les audits gratuits'}
              {actionType === 'role' && 'Modifier le rôle utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.firstname || 'Utilisateur'} ${selectedUser.lastname || ''} (${selectedUser.email})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'role' && (
              <div>
                <Label htmlFor="role">Nouveau Rôle</Label>
                <Select value={selectedRole} onValueChange={(value: 'admin' | 'consultant' | 'client') => setSelectedRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Client :</strong> Accès standard aux audits<br />
                  <strong>Consultant :</strong> Accès étendu<br />
                  <strong>Admin :</strong> Accès complet à toutes les fonctionnalités
                </p>
              </div>
            )}

            {actionType === 'trust' && (
              <div>
                <Label htmlFor="trustScore">Nouveau Trust Score (0-100)</Label>
                <Input
                  id="trustScore"
                  type="number"
                  min="0"
                  max="100"
                  value={trustScoreValue}
                  onChange={(e) => setTrustScoreValue(parseInt(e.target.value))}
                />
              </div>
            )}

            {actionType === 'block' && (
              <div>
                <Label htmlFor="blockUntil">Bloqué jusqu'au</Label>
                <Input
                  id="blockUntil"
                  type="datetime-local"
                  value={blockUntilDate}
                  onChange={(e) => setBlockUntilDate(e.target.value)}
                />
              </div>
            )}

            {actionType !== 'approve' && actionType !== 'unblock' && actionType !== 'role' && (
              <div>
                <Label htmlFor="reason">
                  Raison {actionType !== 'trust' && actionType !== 'reset' && '(obligatoire)'}
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Indiquez la raison de cette action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAction}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
