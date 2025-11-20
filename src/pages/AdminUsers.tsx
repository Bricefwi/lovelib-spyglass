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
import { Shield, Ban, CheckCircle, TrendingUp, RefreshCw, UserCog } from 'lucide-react';

interface UserProfile {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  company_legal_name: string | null;
  company_siret: string | null;
  account_status: string;
  trust_score: number;
  free_audits_used: number;
  created_at: string;
  last_audit_at: string | null;
  blocked_until: string | null;
  block_reason: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'block' | 'unblock' | 'trust' | 'reset'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [trustScoreValue, setTrustScoreValue] = useState(50);
  const [blockUntilDate, setBlockUntilDate] = useState('');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, firstname, lastname, company_legal_name, company_siret, account_status, trust_score, free_audits_used, created_at, last_audit_at, blocked_until, block_reason')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
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
    setTrustScoreValue(user.trust_score);
    setActionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Actif', variant: 'default' as const },
      pending: { label: 'En attente', variant: 'secondary' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
    };
    return config[status as keyof typeof config] || config.pending;
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
                            <div className="font-medium">{user.firstname} {user.lastname}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
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
                          <span className={`font-semibold ${getTrustColor(user.trust_score)}`}>
                            {user.trust_score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.free_audits_used} / 3</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.account_status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(user, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(user, 'trust')}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>

                            {user.blocked_until && new Date(user.blocked_until) > new Date() ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(user, 'unblock')}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openActionDialog(user, 'block')}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(user, 'reset')}
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
            </DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.firstname} ${selectedUser.lastname} (${selectedUser.email})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            {actionType !== 'approve' && actionType !== 'unblock' && (
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
