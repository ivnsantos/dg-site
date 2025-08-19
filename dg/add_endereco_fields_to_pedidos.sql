-- Adicionar campos de endereço diretamente na tabela pedidos_dg
-- Isso evita criar endereços duplicados na tabela de endereços

-- Campos para endereço de entrega
ALTER TABLE pedidos_dg ADD COLUMN endereco_entrega VARCHAR(200);
ALTER TABLE pedidos_dg ADD COLUMN numero_entrega VARCHAR(20);
ALTER TABLE pedidos_dg ADD COLUMN bairro_entrega VARCHAR(100);
ALTER TABLE pedidos_dg ADD COLUMN cidade_entrega VARCHAR(100);
ALTER TABLE pedidos_dg ADD COLUMN estado_entrega VARCHAR(2);
ALTER TABLE pedidos_dg ADD COLUMN cep_entrega VARCHAR(9);
ALTER TABLE pedidos_dg ADD COLUMN complemento_entrega VARCHAR(100);

-- Comentários explicativos
COMMENT ON COLUMN pedidos_dg.endereco_entrega IS 'Endereço de entrega fornecido no momento do pedido';
COMMENT ON COLUMN pedidos_dg.numero_entrega IS 'Número do endereço de entrega';
COMMENT ON COLUMN pedidos_dg.bairro_entrega IS 'Bairro do endereço de entrega';
COMMENT ON COLUMN pedidos_dg.cidade_entrega IS 'Cidade do endereço de entrega';
COMMENT ON COLUMN pedidos_dg.estado_entrega IS 'Estado do endereço de entrega';
COMMENT ON COLUMN pedidos_dg.cep_entrega IS 'CEP do endereço de entrega';
COMMENT ON COLUMN pedidos_dg.complemento_entrega IS 'Complemento do endereço de entrega';
