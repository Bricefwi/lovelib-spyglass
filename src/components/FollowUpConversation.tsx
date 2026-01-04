import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface FollowUpConversationProps {
  auditId: string;
  existingHistory?: Message[];
  planTier?: string;
  onClose?: () => void;
}

const PLAN_LIMITS: Record<string, number> = {
  enterprise: 30,
  agency: 15,
  pro: 5,
  discovery: 3,
  freemium: 3
};

export default function FollowUpConversation({ 
  auditId, 
  existingHistory = [], 
  planTier = 'discovery',
  onClose 
}: FollowUpConversationProps) {
  const [messages, setMessages] = useState<Message[]>(existingHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageLimit = PLAN_LIMITS[planTier] || 3;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add welcome back message if no existing messages
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Bonjour ! Je suis Alex, votre analyste stratégique. Vous pouvez me recontacter ici pour enrichir votre demande d'audit ou ajouter des éléments. Vous disposez de ${messageLimit} messages de suivi avec votre plan ${planTier.toUpperCase()}.`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || limitReached) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('follow-up-conversation', {
        body: {
          audit_id: auditId,
          message: inputMessage
        }
      });

      if (error) {
        console.error('Follow-up error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: "Désolé, une erreur est survenue. Veuillez réessayer.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (data.error === 'Limite atteinte') {
        setLimitReached(true);
        const limitMessage: Message = {
          role: 'assistant',
          content: data.message + (data.upgrade_needed ? " Passez au plan supérieur pour plus de messages." : ""),
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, limitMessage]);
        return;
      }

      const alexMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, alexMessage]);
      setRemainingMessages(data.remaining_messages);

      if (data.remaining_messages === 0) {
        setLimitReached(true);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Une erreur inattendue est survenue.",
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
          {remainingMessages !== null && remainingMessages > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {remainingMessages}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col z-50 shadow-xl">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary">
              <AvatarFallback className="text-primary-foreground font-bold">A</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">Alex - Suivi</CardTitle>
              <CardDescription className="text-xs">
                {remainingMessages !== null 
                  ? `${remainingMessages} message${remainingMessages > 1 ? 's' : ''} restant${remainingMessages > 1 ? 's' : ''}`
                  : `Plan ${planTier.toUpperCase()}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] mt-1 opacity-70">
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
            <div className="bg-muted rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder={limitReached ? "Limite atteinte" : "Enrichir votre demande..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || limitReached}
            className="flex-1 text-sm"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || limitReached}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
