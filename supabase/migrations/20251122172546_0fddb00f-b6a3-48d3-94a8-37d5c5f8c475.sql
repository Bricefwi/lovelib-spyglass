-- ============================================
-- SYSTÈME DE CHAT EN TEMPS RÉEL CLIENT-ADMIN
-- ============================================

-- Modifier la table messages pour supporter le chat
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_audit_id_fkey;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID DEFAULT gen_random_uuid();
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'support', 'notification'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE messages ALTER COLUMN subject DROP NOT NULL;
ALTER TABLE messages ALTER COLUMN sender_email DROP NOT NULL;

-- Index pour améliorer les performances du chat
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Activer RLS sur messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres messages (envoyés ou reçus)
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" 
ON messages 
FOR SELECT 
USING (
  auth.uid() = sender_id 
  OR 
  auth.uid() = recipient_id
  OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Politique: Les utilisateurs peuvent envoyer des messages
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" 
ON messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Politique: Les utilisateurs peuvent marquer leurs messages comme lus
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" 
ON messages 
FOR UPDATE 
USING (auth.uid() = recipient_id OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = recipient_id OR has_role(auth.uid(), 'admin'::app_role));

-- Activer Realtime pour les messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;