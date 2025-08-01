-- Script para adicionar a coluna background_effect na tabela link_trees
-- Execute este script no seu banco de dados PostgreSQL

-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'link_trees' 
        AND column_name = 'background_effect'
    ) THEN
        -- Adicionar a coluna se ela não existir
        ALTER TABLE link_trees ADD COLUMN background_effect VARCHAR(20) DEFAULT 'none';
        RAISE NOTICE 'Coluna background_effect adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna background_effect já existe';
    END IF;
END $$; 