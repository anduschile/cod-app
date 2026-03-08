-- Supabase Schema para COD Product Intelligence

-- Extensión para IDs fáciles (opcional, usaremos gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TIPO DE MÚLTIPLES ESTADOS
-- ==========================================
CREATE TYPE codpi_order_status AS ENUM (
  'creado',
  'confirmado',
  'enviado',
  'entregado',
  'cobrado',
  'rechazado',
  'devuelto',
  'no_localizado',
  'anulado'
);

CREATE TYPE codpi_product_status AS ENUM (
  'idea',
  'evaluando',
  'listo_para_test',
  'testeando',
  'descartado',
  'ganador'
);

-- ==========================================
-- 2. PRODUCT LAB (codpi_products)
-- ==========================================
CREATE TABLE codpi_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoria TEXT,
  microcategoria TEXT,
  proveedor TEXT,
  sku_proveedor TEXT,
  costo_producto NUMERIC(10, 2) DEFAULT 0,
  costo_envio_estimado NUMERIC(10, 2) DEFAULT 0,
  costo_recaudo_estimado NUMERIC(10, 2) DEFAULT 0,
  precio_venta_sugerido NUMERIC(10, 2) DEFAULT 0,
  moneda TEXT DEFAULT 'CLP',
  descripcion_corta TEXT,
  riesgo_logistico TEXT,
  riesgo_devolucion TEXT,
  facilidad_demo TEXT,
  intensidad_dolor TEXT,
  wow_factor TEXT,
  saturacion_competencia TEXT,
  posibilidad_upsell TEXT,
  notas TEXT,
  estado codpi_product_status DEFAULT 'idea',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. EVIDENCE HUB (codpi_product_evidence)
-- ==========================================
CREATE TABLE codpi_product_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES codpi_products(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'imagen', 'link_competencia', 'nota', 'hook_publicitario', 'hipotesis'
  url TEXT,
  descripcion TEXT,
  archivo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. SCORECARD (Criterios y puntajes)
-- ==========================================
CREATE TABLE codpi_evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  peso NUMERIC(5, 2) DEFAULT 1.0,  
  escala_maxima INTEGER DEFAULT 5, 
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE codpi_product_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES codpi_products(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES codpi_evaluation_criteria(id) ON DELETE CASCADE,
  puntaje NUMERIC(5, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, criteria_id)
);

-- ==========================================
-- 5. ORDERS MANUAL HUB (codpi_orders)
-- ==========================================
CREATE TABLE codpi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID REFERENCES codpi_products(id),
  nombre_cliente TEXT,
  telefono TEXT,
  comuna TEXT,
  region TEXT,
  direccion TEXT,
  cantidad INTEGER DEFAULT 1,
  precio_venta_unidad NUMERIC(10, 2) DEFAULT 0,
  costo_producto_unidad NUMERIC(10, 2) DEFAULT 0,
  costo_envio NUMERIC(10, 2) DEFAULT 0,
  costo_recaudo NUMERIC(10, 2) DEFAULT 0,
  gasto_ads_asociado NUMERIC(10, 2) DEFAULT 0,
  estado codpi_order_status DEFAULT 'creado',
  tracking_number TEXT,
  carrier TEXT,
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  fecha_cobro TIMESTAMP WITH TIME ZONE,
  motivo_rechazo TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. COSTOS Y ADS (Ad Spend y Operativos)
-- ==========================================
CREATE TABLE codpi_ad_spend_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  product_id UUID REFERENCES codpi_products(id) ON DELETE RESTRICT,
  plataforma TEXT, -- Ej: 'Facebook Ads', 'TikTok Ads'
  monto NUMERIC(10, 2) NOT NULL DEFAULT 0,
  impresiones INTEGER DEFAULT 0,
  clics INTEGER DEFAULT 0,
  cpa_plataforma NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fecha, product_id, plataforma)
);

CREATE TABLE codpi_operational_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes DATE NOT NULL, -- Para agrupar costos mensuales (ej: 2026-03-01)
  concepto TEXT NOT NULL,
  monto NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. SOP / DOCUMENTACIÓN (codpi_internal_documents)
-- ==========================================
CREATE TABLE codpi_internal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contenido TEXT,
  categoria TEXT,
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers de updated_at para tablas clave
CREATE OR REPLACE FUNCTION codpi_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER codpi_update_products_modtime BEFORE UPDATE ON codpi_products FOR EACH ROW EXECUTE PROCEDURE codpi_update_updated_at_column();
CREATE TRIGGER codpi_update_orders_modtime BEFORE UPDATE ON codpi_orders FOR EACH ROW EXECUTE PROCEDURE codpi_update_updated_at_column();
CREATE TRIGGER codpi_update_documents_modtime BEFORE UPDATE ON codpi_internal_documents FOR EACH ROW EXECUTE PROCEDURE codpi_update_updated_at_column();
