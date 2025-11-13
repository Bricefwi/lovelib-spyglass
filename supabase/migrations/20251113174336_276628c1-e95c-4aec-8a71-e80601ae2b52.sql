-- Migration MANUS IA 2.0 : Élimination N8N
-- Renommer la colonne n8n_execution_id → manus_execution_id
ALTER TABLE agent_orchestrations 
RENAME COLUMN n8n_execution_id TO manus_execution_id;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN agent_orchestrations.manus_execution_id IS 
'ID d''exécution retourné par le backend MANUS IA Railway. Utilisé pour tracer l''audit dans le système MANUS IA 2.0.';