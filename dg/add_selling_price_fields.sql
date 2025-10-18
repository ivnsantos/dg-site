-- Adicionar campos de preço por unidade e por grama
ALTER TABLE products 
ADD COLUMN selling_price_per_unit DECIMAL(10,2) DEFAULT 0,
ADD COLUMN selling_price_per_gram DECIMAL(10,2) DEFAULT 0;
