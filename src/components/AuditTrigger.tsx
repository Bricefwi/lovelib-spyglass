import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export const AuditTrigger = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLaunchAudit = async () => {
    if (!url.trim()) {
      toast.error('Veuillez saisir une URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // 2. Insérer un nouveau pre_audit
      const { data: preAudit, error: insertError } = await supabase
        .from('pre_audits')
        .insert({
          url: url.trim(),
          status: 'pending',
          created_by: user.id,
          current_phase: 'PHASE_0_INIT'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Pre-audit créé:', preAudit);

      // 3. Appeler l'Edge Function orchestrate-multi-agent
      const { data: orchestrationResult, error: functionError } = await supabase.functions.invoke(
        'orchestrate-multi-agent',
        {
          body: {
            audit_id: preAudit.id,
            action: 'start'
          }
        }
      );

      if (functionError) throw functionError;

      console.log('Résultat orchestration:', orchestrationResult);

      setResult(orchestrationResult);
      toast.success('🚀 Orchestration Démarrée');

    } catch (err: any) {
      console.error('Erreur lors du lancement de l\'audit:', err);
      setError(err.message || 'Une erreur est survenue');
      toast.error('Erreur lors du lancement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Lancer un Audit Stratégique
        </CardTitle>
        <CardDescription>
          Analysez une entreprise avec MANUS IA 2.0 (17 agents IA)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audit-url">URL de l'entreprise</Label>
          <Input
            id="audit-url"
            type="url"
            placeholder="https://www.example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleLaunchAudit}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Lancement en cours...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Lancer l'Audit Stratégique
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Erreur:</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <Label className="text-primary">Résultat de l'orchestration:</Label>
            <pre className="p-3 rounded-md bg-muted text-muted-foreground text-xs overflow-x-auto border border-border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
