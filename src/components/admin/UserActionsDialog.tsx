import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  RefreshCw,
  TrendingUp,
  User,
  Building2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfile {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  professional_email: string | null;
  professional_phone: string | null;
  job_title: string | null;
  company_legal_name: string | null;
  company_siret: string | null;
  company_siren: string | null;
  company_address: string | null;
  company_legal_form: string | null;
  company_creation_date: string | null;
  company_website: string | null;
  trust_score: number | null;
  free_audits_used: number | null;
  account_status: string | null;
  blocked_until: string | null;
  block_reason: string | null;
  rejection_reason: string | null;
  verification_method: string | null;
  verification_document_url: string | null;
  created_at: string;
  last_login: string | null;
  last_audit_at: string | null;
}

interface UserActionsDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserActionsDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserActionsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockDuration, setBlockDuration] = useState("1day");
  const [newTrustScore, setNewTrustScore] = useState(user.trust_score || 50);
  const [trustScoreReason, setTrustScoreReason] = useState("");
  const [resetAuditsReason, setResetAuditsReason] = useState("");

  const handleApprove = async () => {
    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("admin_approve_user", {
        p_user_id: user.user_id,
        p_admin_id: currentUser.id,
      });

      if (error) throw error;

      toast.success("Utilisateur approuvé avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast.error(error.message || "Erreur lors de l'approbation");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Veuillez fournir une raison");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("admin_reject_user", {
        p_user_id: user.user_id,
        p_admin_id: currentUser.id,
        p_reason: rejectReason,
      });

      if (error) throw error;

      toast.success("Utilisateur rejeté");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error rejecting user:", error);
      toast.error(error.message || "Erreur lors du rejet");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!blockReason.trim()) {
      toast.error("Veuillez fournir une raison");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const blockedUntil = new Date();
      switch (blockDuration) {
        case "1day":
          blockedUntil.setDate(blockedUntil.getDate() + 1);
          break;
        case "7days":
          blockedUntil.setDate(blockedUntil.getDate() + 7);
          break;
        case "30days":
          blockedUntil.setDate(blockedUntil.getDate() + 30);
          break;
        case "permanent":
          blockedUntil.setFullYear(blockedUntil.getFullYear() + 100);
          break;
      }

      const { error } = await supabase.rpc("admin_block_user", {
        p_user_id: user.user_id,
        p_admin_id: currentUser.id,
        p_blocked_until: blockedUntil.toISOString(),
        p_reason: blockReason,
      });

      if (error) throw error;

      toast.success("Utilisateur bloqué");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error blocking user:", error);
      toast.error(error.message || "Erreur lors du blocage");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("admin_unblock_user", {
        p_user_id: user.user_id,
        p_admin_id: currentUser.id,
      });

      if (error) throw error;

      toast.success("Utilisateur débloqué");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      toast.error(error.message || "Erreur lors du déblocage");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustTrustScore = async () => {
    if (!trustScoreReason.trim()) {
      toast.error("Veuillez fournir une raison");
      return;
    }

    if (newTrustScore < 0 || newTrustScore > 100) {
      toast.error("Le trust score doit être entre 0 et 100");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("admin_adjust_trust_score", {
        p_user_id: user.user_id,
        p_admin_id: currentUser.id,
        p_new_score: newTrustScore,
        p_reason: trustScoreReason,
      });

      if (error) throw error;

      toast.success("Trust score ajusté");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adjusting trust score:", error);
      toast.error(error.message || "Erreur lors de l'ajustement");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAudits = async () => {
    if (!resetAuditsReason.trim()) {
      toast.error("Veuillez fournir une raison");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("admin_reset_free_audits", {
        p_user_id: user.user_id,
        p_admin_id: currentUser.id,
        p_reason: resetAuditsReason,
      });

      if (error) throw error;

      toast.success("Audits gratuits réinitialisés");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error resetting audits:", error);
      toast.error(error.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user.firstname} {user.lastname}
          </DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                <h3 className="font-semibold">Informations Personnelles</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email pro:</span>{" "}
                  <span className="font-medium">{user.professional_email || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Téléphone:</span>{" "}
                  <span className="font-medium">{user.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Téléphone pro:</span>{" "}
                  <span className="font-medium">{user.professional_phone || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fonction:</span>{" "}
                  <span className="font-medium">{user.job_title || "-"}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Company Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4" />
                <h3 className="font-semibold">Informations Entreprise</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Raison sociale:</span>{" "}
                  <span className="font-medium">{user.company_legal_name || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SIRET:</span>{" "}
                  <span className="font-mono font-medium">{user.company_siret || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SIREN:</span>{" "}
                  <span className="font-mono font-medium">{user.company_siren || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Forme juridique:</span>{" "}
                  <span className="font-medium">{user.company_legal_form || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Adresse:</span>{" "}
                  <span className="font-medium">{user.company_address || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date création:</span>{" "}
                  <span className="font-medium">
                    {user.company_creation_date
                      ? format(new Date(user.company_creation_date), "dd MMM yyyy", {
                          locale: fr,
                        })
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Site web:</span>{" "}
                  <span className="font-medium">{user.company_website || "-"}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Verification */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="font-semibold">Vérification</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Méthode:</span>{" "}
                  <Badge variant="outline">{user.verification_method || "N/A"}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Trust Score:</span>{" "}
                  <Badge
                    variant={
                      !user.trust_score || user.trust_score < 30
                        ? "destructive"
                        : user.trust_score < 60
                        ? "secondary"
                        : "default"
                    }
                  >
                    {user.trust_score || 0}/100
                  </Badge>
                </div>
                {user.verification_document_url && (
                  <div>
                    <span className="text-muted-foreground">Document:</span>{" "}
                    <a
                      href={user.verification_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Télécharger
                    </a>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4" />
              <h3 className="font-semibold">Activité</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Inscrit le:</span>{" "}
                <span className="font-medium">
                  {format(new Date(user.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Dernière connexion:</span>{" "}
                <span className="font-medium">
                  {user.last_login
                    ? format(new Date(user.last_login), "dd MMM yyyy 'à' HH:mm", { locale: fr })
                    : "Jamais"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Audits utilisés:</span>{" "}
                <Badge variant="outline">
                  {user.free_audits_used || 0}/3
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Dernier audit:</span>{" "}
                <span className="font-medium">
                  {user.last_audit_at
                    ? format(new Date(user.last_audit_at), "dd MMM yyyy 'à' HH:mm", {
                        locale: fr,
                      })
                    : "Jamais"}
                </span>
              </div>
            </div>

            {user.blocked_until && new Date(user.blocked_until) > new Date() && (
              <>
                <Separator />
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="font-semibold text-destructive mb-2">
                    Compte Bloqué
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">Jusqu'au:</span>{" "}
                      <span className="font-medium">
                        {format(new Date(user.blocked_until), "dd MMM yyyy 'à' HH:mm", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    {user.block_reason && (
                      <div>
                        <span className="text-muted-foreground">Raison:</span>{" "}
                        <span>{user.block_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {user.account_status === "rejected" && user.rejection_reason && (
              <>
                <Separator />
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="font-semibold text-destructive mb-2">Compte Rejeté</div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Raison:</span>{" "}
                    <span>{user.rejection_reason}</span>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {/* Approve/Reject (for pending users) */}
            {user.account_status === "pending" && (
              <div className="space-y-4">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver l'utilisateur
                </Button>

                <div className="space-y-2">
                  <Label>Rejeter (avec raison)</Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Raison du rejet..."
                  />
                  <Button
                    onClick={handleReject}
                    disabled={loading || !rejectReason.trim()}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </div>
            )}

            {/* Block/Unblock */}
            {user.blocked_until && new Date(user.blocked_until) > new Date() ? (
              <Button onClick={handleUnblock} disabled={loading} className="w-full">
                <Unlock className="h-4 w-4 mr-2" />
                Débloquer l'utilisateur
              </Button>
            ) : (
              <div className="space-y-2">
                <Label>Bloquer l'utilisateur</Label>
                <select
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="1day">1 jour</option>
                  <option value="7days">7 jours</option>
                  <option value="30days">30 jours</option>
                  <option value="permanent">Permanent</option>
                </select>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Raison du blocage..."
                />
                <Button
                  onClick={handleBlock}
                  disabled={loading || !blockReason.trim()}
                  variant="destructive"
                  className="w-full"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquer
                </Button>
              </div>
            )}

            <Separator />

            {/* Adjust Trust Score */}
            <div className="space-y-2">
              <Label>Ajuster le Trust Score</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newTrustScore}
                onChange={(e) => setNewTrustScore(parseInt(e.target.value))}
              />
              <Textarea
                value={trustScoreReason}
                onChange={(e) => setTrustScoreReason(e.target.value)}
                placeholder="Raison de l'ajustement..."
              />
              <Button
                onClick={handleAdjustTrustScore}
                disabled={loading || !trustScoreReason.trim()}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Ajuster le Trust Score
              </Button>
            </div>

            <Separator />

            {/* Reset Free Audits */}
            <div className="space-y-2">
              <Label>Réinitialiser les Audits Gratuits</Label>
              <Textarea
                value={resetAuditsReason}
                onChange={(e) => setResetAuditsReason(e.target.value)}
                placeholder="Raison de la réinitialisation..."
              />
              <Button
                onClick={handleResetAudits}
                disabled={loading || !resetAuditsReason.trim()}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser les Audits (0/3)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
