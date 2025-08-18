-- Adicionar coluna menu_id na tabela pedidos_dg
ALTER TABLE pedidos_dg ADD COLUMN menu_id INTEGER;

-- Adicionar comentário na coluna
COMMENT ON COLUMN pedidos_dg.menu_id IS 'ID do menu relacionado ao pedido';

-- Criar índice para melhorar performance das consultas
CREATE INDEX idx_pedidos_dg_menu_id ON pedidos_dg(menu_id);
