import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ClientHeader } from "@/components/ClientHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, 
  Mail, 
  MailOpen,
  Send,
  Search,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  conversation_id: string | null;
  sender_id: string | null;
  recipient_id: string | null;
  sender_email: string | null;
  subject: string | null;
  content: string;
  message_type: string | null;
  status: string | null;
  read_at: string | null;
  created_at: string | null;
  company_id: string | null;
  audit_id: string | null;
}

interface Conversation {
  conversation_id: string;
  messages: Message[];
  unreadCount: number;
  lastMessage: Message;
  senderEmail: string | null;
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchMessages();
    
    // Écoute en temps réel des nouveaux messages
    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload);
          fetchMessages(); // Recharger les messages
          toast.info("Nouveau message reçu");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Grouper par conversation
      const conversationsMap = new Map<string, Message[]>();
      
      data?.forEach((message: Message) => {
        const convId = message.conversation_id || message.id;
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, []);
        }
        conversationsMap.get(convId)!.push(message);
      });

      // Créer les objets conversation
      const convs: Conversation[] = Array.from(conversationsMap.entries()).map(([convId, messages]) => {
        const sortedMessages = messages.sort((a, b) => 
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        
        const unreadCount = messages.filter(m => !m.read_at && m.sender_id !== null).length;
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        
        return {
          conversation_id: convId,
          messages: sortedMessages,
          unreadCount,
          lastMessage,
          senderEmail: lastMessage.sender_email || "Client anonyme"
        };
      });

      // Trier par date du dernier message
      convs.sort((a, b) => 
        new Date(b.lastMessage.created_at || 0).getTime() - 
        new Date(a.lastMessage.created_at || 0).getTime()
      );

      setConversations(convs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (conversation: Conversation) => {
    try {
      const unreadMessages = conversation.messages.filter(m => !m.read_at && m.sender_id !== null);
      
      for (const message of unreadMessages) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString(), status: 'read' })
          .eq("id", message.id);
      }

      fetchMessages();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setReplyContent("");
    
    // Marquer comme lu automatiquement
    if (conversation.unreadCount > 0) {
      await markConversationAsRead(conversation);
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) {
      toast.error("Veuillez saisir un message");
      return;
    }

    try {
      setSending(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const lastMessage = selectedConversation.lastMessage;
      
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.conversation_id,
          sender_id: user.id,
          recipient_id: lastMessage.sender_id,
          sender_email: user.email,
          subject: lastMessage.subject ? `Re: ${lastMessage.subject}` : "Réponse",
          content: replyContent,
          message_type: "admin_reply",
          status: "sent",
          company_id: lastMessage.company_id,
          audit_id: lastMessage.audit_id,
        });

      if (error) throw error;

      toast.success("Réponse envoyée");
      setReplyContent("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations
    .filter(conv => {
      // Filtre par statut
      if (filterStatus === "unread" && conv.unreadCount === 0) return false;
      if (filterStatus === "read" && conv.unreadCount > 0) return false;
      
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          conv.senderEmail?.toLowerCase().includes(query) ||
          conv.lastMessage.subject?.toLowerCase().includes(query) ||
          conv.lastMessage.content.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col">
      <ClientHeader />
      <div className="flex flex-1">
        <AdminSidebar unreadMessages={totalUnread} />

        <main className="flex-1 flex flex-col">
        <div className="border-b border-border p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Messages Clients</h1>
                <p className="text-muted-foreground mt-2">
                  {conversations.length} conversation{conversations.length > 1 ? 's' : ''} • {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg bg-background"
                >
                  <option value="all">Tous</option>
                  <option value="unread">Non lus</option>
                  <option value="read">Lus</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Liste des conversations */}
          <div className="w-96 border-r border-border bg-background overflow-y-auto">
            {filteredConversations.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.conversation_id}
                    onClick={() => selectConversation(conv)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversation?.conversation_id === conv.conversation_id
                        ? "bg-muted border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {conv.unreadCount > 0 ? (
                          <Mail className="h-5 w-5 text-primary" />
                        ) : (
                          <MailOpen className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`font-medium ${conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                          {conv.senderEmail}
                        </span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="h-5 min-w-5 px-1.5">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className={`text-sm mb-1 ${conv.unreadCount > 0 ? "font-semibold" : ""}`}>
                      {conv.lastMessage.subject || "Sans sujet"}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {conv.lastMessage.content}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(conv.lastMessage.created_at || 0).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(conv.lastMessage.created_at || 0).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune conversation trouvée</p>
              </div>
            )}
          </div>

          {/* Vue de la conversation sélectionnée */}
          <div className="flex-1 flex flex-col bg-background">
            {selectedConversation ? (
              <>
                {/* En-tête de conversation */}
                <div className="border-b border-border p-6">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">
                          {selectedConversation.senderEmail}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.messages.length} message{selectedConversation.messages.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-4xl mx-auto space-y-4">
                    {selectedConversation.messages.map((message, idx) => {
                      const isAdmin = message.message_type === "admin_reply";
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <Card className={`max-w-2xl p-4 ${isAdmin ? "bg-primary/5 border-primary/20" : ""}`}>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}>
                                  <User className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {isAdmin ? "IMOTION Admin" : message.sender_email || "Client"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(message.created_at || 0).toLocaleDateString("fr-FR")} à{" "}
                                    {new Date(message.created_at || 0).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              {!isAdmin && !message.read_at && (
                                <Badge variant="default" className="text-xs">Nouveau</Badge>
                              )}
                            </div>
                            
                            {message.subject && idx === 0 && (
                              <h3 className="font-semibold mb-2 text-foreground">
                                {message.subject}
                              </h3>
                            )}
                            
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {message.content}
                            </p>

                            {message.audit_id && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  <span>Lié à un audit</span>
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Zone de réponse */}
                <div className="border-t border-border p-6 bg-muted/30">
                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Écrire une réponse..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={sendReply}
                          disabled={sending || !replyContent.trim()}
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Envoyer la réponse
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm mt-2">
                    Choisissez une conversation dans la liste pour voir les messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
