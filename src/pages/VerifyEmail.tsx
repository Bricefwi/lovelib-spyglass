import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Vérification de votre email en cours...');
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant. Veuillez vérifier le lien dans votre email.');
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-and-start-conversation', {
        body: { verification_token: token }
      });

      if (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Erreur lors de la vérification. Le lien a peut-être expiré.');
        return;
      }

      if (data.success) {
        setStatus('success');
        setAuditId(data.audit_id);
        setMessage('Email vérifié avec succès ! Vous allez être redirigé vers le chat avec Alex...');
        
        // Redirect to conversation page after 2 seconds
        setTimeout(() => {
          navigate(`/conversation-alex?audit_id=${data.audit_id}`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Erreur de vérification');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setStatus('error');
      setMessage('Une erreur inattendue est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === 'verifying' && 'Vérification en cours'}
            {status === 'success' && 'Email vérifié !'}
            {status === 'error' && 'Erreur de vérification'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'verifying' && 'Veuillez patienter...'}
            {status === 'success' && 'Redirection vers le chat avec Alex'}
            {status === 'error' && 'Un problème est survenu'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
            
            <p className="text-center text-muted-foreground">
              {message}
            </p>
          </div>

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/audit-gratuit'}
                className="w-full"
              >
                Demander un nouvel audit
              </Button>
              <Button 
                onClick={() => window.location.href = '/support'}
                variant="outline"
                className="w-full"
              >
                Contacter le support
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
