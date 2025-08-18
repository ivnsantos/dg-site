-- Criar tabela de endereços
CREATE TABLE IF NOT EXISTS enderecos_dg (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  cep VARCHAR(9),
  endereco VARCHAR(200) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  complemento VARCHAR(100),
  referencia VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Chave estrangeira para cliente
  FOREIGN KEY (cliente_id) REFERENCES clientes_dg(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_enderecos_cliente_id ON enderecos_dg(cliente_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_ativo ON enderecos_dg(ativo);

-- Adicionar comentários na tabela
COMMENT ON TABLE enderecos_dg IS 'Tabela para armazenar múltiplos endereços por cliente';
COMMENT ON COLUMN enderecos_dg.cliente_id IS 'ID do cliente proprietário do endereço';
COMMENT ON COLUMN enderecos_dg.cep IS 'CEP do endereço (opcional)';
COMMENT ON COLUMN enderecos_dg.endereco IS 'Endereço completo (rua, número, etc.)';
COMMENT ON COLUMN enderecos_dg.bairro IS 'Nome do bairro';
COMMENT ON COLUMN enderecos_dg.cidade IS 'Nome da cidade';
COMMENT ON COLUMN enderecos_dg.estado IS 'Sigla do estado (SP, RJ, etc.)';
COMMENT ON COLUMN enderecos_dg.complemento IS 'Complemento do endereço (apto, bloco, etc.)';
COMMENT ON COLUMN enderecos_dg.referencia IS 'Ponto de referência';
COMMENT ON COLUMN enderecos_dg.ativo IS 'Se o endereço está ativo';
COMMENT ON COLUMN enderecos_dg.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN enderecos_dg.updated_at IS 'Data da última atualização';

-- Atualizar tabela de clientes (remover colunas de endereço se existirem)
-- NOTA: Execute apenas se as colunas ainda existirem
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS cep;
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS endereco;
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS bairro;
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS cidade;
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS estado;
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS complemento;
-- ALTER TABLE clientes_dg DROP COLUMN IF EXISTS referencia;

-- Adicionar coluna ativo na tabela de clientes se não existir
ALTER TABLE clientes_dg ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Criar índice para a coluna ativo na tabela de clientes
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes_dg(ativo);
