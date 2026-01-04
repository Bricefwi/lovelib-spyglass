import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ConversationAlex() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [auditId, setAuditId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCompleted, setConversationCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = searchParams.get('audit_id');
    if (!id) {
      navigate('/');
      return;
    }
    setAuditId(id);
    
    // Add welcome message from Alex
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Bonjour ! Je suis Alex, votre analyste stratégique dédié chez MANUS IA. Pour garantir la sécurité et la pertinence de votre audit, j'ai quelques questions rapides pour vous. Cela ne prendra que 2-3 minutes. Êtes-vous prêt(e) à commencer ?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [searchParams, navigate]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !auditId || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('conversational-agent-alex', {
        body: {
          audit_id: auditId,
          message: inputMessage,
          conversation_history: messages
        }
      });

      if (error) {
        console.error('Conversation error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: "Désolé, une erreur est survenue. Pouvez-vous répéter votre message ?",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const alexMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, alexMessage]);

      if (data.conversation_completed) {
        setConversationCompleted(true);
        
        // Redirect to audit progress page after 5 seconds
        setTimeout(() => {
          navigate(`/audit-progress?audit_id=${auditId}`);
        }, 5000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Une erreur inattendue est survenue. Veuillez réessayer.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[700px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 bg-blue-500">
              <AvatarFallback className="text-white font-bold">A</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Alex - Analyste Stratégique</CardTitle>
              <CardDescription>
                {conversationCompleted 
                  ? "Conversation terminée - Audit en cours..." 
                  : "MANUS IA - Audit Conversationnel"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
              </div>
            </div>
          )}

          {conversationCompleted && (
            <div className="flex justify-center">
              <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Conversation terminée !</p>
                  <p className="text-sm text-green-700">
                    Votre audit complet est en cours de génération. Redirection automatique...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {!conversationCompleted && (
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tapez votre message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Appuyez sur Entrée pour envoyer
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
