-- Migración: Operación Manual y Limpieza de Demos
-- Archivo: supabase/migrations/20260311_manual_ops.sql

-- 1. Backup de datos existentes por seguridad antes de truncar
CREATE TABLE IF NOT EXISTS codpi_orders_backup AS SELECT * FROM codpi_orders;
CREATE TABLE IF NOT EXISTS codpi_ad_spend_daily_backup AS SELECT * FROM codpi_ad_spend_daily;

-- 2. Limpieza (TRUNCATE) para iniciar desde cero reales
TRUNCATE TABLE codpi_orders CASCADE;
TRUNCATE TABLE codpi_ad_spend_daily CASCADE;
TRUNCATE TABLE codpi_operational_costs CASCADE;

-- 3. Nuevos campos en la tabla de Productos (Economía)
ALTER TABLE codpi_products
ADD COLUMN IF NOT EXISTS costo_embalaje NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS comision_pasarela NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margen_bruto_unitario NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpa_maximo_aceptable NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- 4. Renovar la tabla de Ad Spend Daily eliminando la restricción antigua que impedía múltiples campañas
ALTER TABLE codpi_ad_spend_daily DROP CONSTRAINT IF EXISTS codpi_ad_spend_daily_fecha_product_id_plataforma_key;

-- 5. Nuevos campos para Ads Manuales (Embudo)
ALTER TABLE codpi_ad_spend_daily
ADD COLUMN IF NOT EXISTS campana TEXT,
ADD COLUMN IF NOT EXISTS conjunto TEXT,
ADD COLUMN IF NOT EXISTS anuncio TEXT,
ADD COLUMN IF NOT EXISTS alcance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS frecuencia NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ctr NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpc NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpm NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS clics_link INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS landing_page_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS add_to_cart INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS initiate_checkout INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS compras INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpa NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ingreso_atribuido_manual NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- 6. Crear tabla de Bitácora / Observaciones de Campaña
CREATE TABLE IF NOT EXISTS codpi_campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id UUID REFERENCES codpi_products(id) ON DELETE SET NULL,
  campana TEXT,
  anuncio TEXT,
  cambio_realizado TEXT NOT NULL,
  motivo TEXT,
  hipotesis TEXT,
  resultado_esperado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si no existe el trigger, se crea (usualmente ya existe en schema.sql)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'codpi_update_logs_modtime') THEN
        CREATE TRIGGER codpi_update_logs_modtime BEFORE UPDATE ON codpi_campaign_logs FOR EACH ROW EXECUTE PROCEDURE codpi_update_updated_at_column();
    END IF;
END
$$;
