-- Criação das tabelas para o sistema de LinkTree

-- Tabela link_trees
CREATE TABLE IF NOT EXISTS link_trees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    user_id INTEGER NOT NULL,
    background_color VARCHAR(7) DEFAULT '#2D1810',
    text_color VARCHAR(7) DEFAULT '#ffffff',
    accent_color VARCHAR(7) DEFAULT '#0B7A48',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Adicionar campo code se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'link_trees' AND column_name = 'code') THEN
        ALTER TABLE link_trees ADD COLUMN code VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- Adicionar campo image_url se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'link_trees' AND column_name = 'image_url') THEN
        ALTER TABLE link_trees ADD COLUMN image_url VARCHAR(500);
    END IF;
END $$;

-- Tabela link_tree_links
CREATE TABLE IF NOT EXISTS link_tree_links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(10) DEFAULT '🔗',
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    link_tree_id INTEGER NOT NULL,
    FOREIGN KEY (link_tree_id) REFERENCES link_trees(id) ON DELETE CASCADE
);

-- Adicionar campo image_url se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'link_tree_links' AND column_name = 'image_url') THEN
        ALTER TABLE link_tree_links ADD COLUMN image_url VARCHAR(255);
    END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_link_trees_user_id ON link_trees(user_id);
CREATE INDEX IF NOT EXISTS idx_link_trees_code ON link_trees(code);
CREATE INDEX IF NOT EXISTS idx_link_tree_links_link_tree_id ON link_tree_links(link_tree_id);
CREATE INDEX IF NOT EXISTS idx_link_tree_links_position ON link_tree_links(position);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_link_trees_updated_at 
    BEFORE UPDATE ON link_trees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 