-- Adicionar coluna code à tabela link_trees
ALTER TABLE link_trees ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE; 