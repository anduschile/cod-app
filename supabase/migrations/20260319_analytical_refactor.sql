-- 1. Crear tabla de tests/campañas
CREATE TABLE IF NOT EXISTS codpi_tests_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES codpi_products(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  platform TEXT,
  campaign_ref TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar test_id a pedidos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='codpi_orders' AND column_name='test_id') THEN
    ALTER TABLE codpi_orders ADD COLUMN test_id UUID REFERENCES codpi_tests_campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Agregar test_id a gasto ads
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='codpi_ad_spend_daily' AND column_name='test_id') THEN
    ALTER TABLE codpi_ad_spend_daily ADD COLUMN test_id UUID REFERENCES codpi_tests_campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Agregar product_id, test_id y tipo a costos operativos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='codpi_operational_costs' AND column_name='product_id') THEN
    ALTER TABLE codpi_operational_costs ADD COLUMN product_id UUID REFERENCES codpi_products(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='codpi_operational_costs' AND column_name='test_id') THEN
    ALTER TABLE codpi_operational_costs ADD COLUMN test_id UUID REFERENCES codpi_tests_campaigns(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='codpi_operational_costs' AND column_name='tipo') THEN
    ALTER TABLE codpi_operational_costs ADD COLUMN tipo TEXT DEFAULT 'fijo_mensual';
  END IF;
END $$;

-- 5. MIGRACIÓN INICIAL DE DATOS

-- Identificar producto actual (Dispensador) y anterior (Picadora)
-- Nota: Uso slugs para ser más preciso si existen.
DO $$
DECLARE
  picadora_id UUID;
  dispensador_id UUID;
  picadora_test_id UUID;
  dispensador_test_id UUID;
BEGIN
  -- Buscar productos
  SELECT id INTO picadora_id FROM codpi_products WHERE nombre ILIKE '%Picadora%' LIMIT 1;
  SELECT id INTO dispensador_id FROM codpi_products WHERE nombre ILIKE '%Dispensador%' LIMIT 1;

  -- Crear test para Picadora (si existe)
  IF picadora_id IS NOT NULL THEN
    INSERT INTO codpi_tests_campaigns (product_id, test_name, status, notes)
    VALUES (picadora_id, 'Campaña Picadora (Inicial)', 'closed', 'Campaña cerrada para separar histórico')
    RETURNING id INTO picadora_test_id;
    
    -- Vincular pedidos y ads
    UPDATE codpi_orders SET test_id = picadora_test_id WHERE product_id = picadora_id;
    UPDATE codpi_ad_spend_daily SET test_id = picadora_test_id WHERE product_id = picadora_id;
  END IF;

  -- Crear test para Dispensador (si existe)
  IF dispensador_id IS NOT NULL THEN
    INSERT INTO codpi_tests_campaigns (product_id, test_name, status, notes)
    VALUES (dispensador_id, 'Campaña Dispensador (Activa)', 'active', 'Campaña actual en testeo')
    RETURNING id INTO dispensador_test_id;
    
    -- Vincular pedidos y ads
    UPDATE codpi_orders SET test_id = dispensador_test_id WHERE product_id = dispensador_id;
    UPDATE codpi_ad_spend_daily SET test_id = dispensador_test_id WHERE product_id = dispensador_id;
  END IF;

  -- RECLASIFICACIÓN DE COSTOS CRÍTICOS
  -- "Dropi / saldo negativo" o similares
  UPDATE codpi_operational_costs 
  SET tipo = 'ajuste_historico' 
  WHERE concepto ILIKE '%Dropi%' AND monto < 0;
  
  -- Otros ajustes históricos conocidos
  UPDATE codpi_operational_costs 
  SET tipo = 'ajuste_historico' 
  WHERE concepto ILIKE '%ajuste%' OR concepto ILIKE '%pérdida%';

END $$;
