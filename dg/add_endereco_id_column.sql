-- Adicionar coluna endereco_id na tabela pedidos_dg
ALTER TABLE pedidos_dg ADD COLUMN endereco_id INT;

-- Adicionar índice para melhorar performance
CREATE INDEX idx_pedidos_dg_endereco_id ON pedidos_dg(endereco_id);

-- Adicionar chave estrangeira para enderecos_dg
ALTER TABLE pedidos_dg 
ADD CONSTRAINT fk_pedidos_dg_endereco_id 
FOREIGN KEY (endereco_id) REFERENCES enderecos_dg(id);

-- Comentário explicativo
COMMENT ON COLUMN pedidos_dg.endereco_id IS 'ID do endereço de entrega usado no pedido';
