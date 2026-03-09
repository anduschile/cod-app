-- 20260308_add_is_archived.sql

-- Agrega la columna is_archived a la tabla codpi_products
ALTER TABLE codpi_products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Opcional: Crear un índice para búsquedas más rápidas por estado
CREATE INDEX IF NOT EXISTS idx_codpi_products_is_archived ON codpi_products(is_archived);
