-- Migración: Ficha de Validación Comercial

CREATE TABLE IF NOT EXISTS codpi_product_market_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES codpi_products(id) ON DELETE CASCADE,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    checked_by TEXT,
    meta_ads_signal_score SMALLINT NOT NULL DEFAULT 0 CHECK (meta_ads_signal_score >= 0 AND meta_ads_signal_score <= 5),
    tiktok_signal_score SMALLINT NOT NULL DEFAULT 0 CHECK (tiktok_signal_score >= 0 AND tiktok_signal_score <= 5),
    marketplace_signal_score SMALLINT NOT NULL DEFAULT 0 CHECK (marketplace_signal_score >= 0 AND marketplace_signal_score <= 5),
    competitive_saturation_score SMALLINT NOT NULL DEFAULT 0 CHECK (competitive_saturation_score >= 0 AND competitive_saturation_score <= 5),
    differentiation_score SMALLINT NOT NULL DEFAULT 0 CHECK (differentiation_score >= 0 AND differentiation_score <= 5),
    demo_potential_score SMALLINT NOT NULL DEFAULT 0 CHECK (demo_potential_score >= 0 AND demo_potential_score <= 5),
    offer_clarity_score SMALLINT NOT NULL DEFAULT 0 CHECK (offer_clarity_score >= 0 AND offer_clarity_score <= 5),
    operational_simplicity_score SMALLINT NOT NULL DEFAULT 0 CHECK (operational_simplicity_score >= 0 AND operational_simplicity_score <= 5),
    prior_experience TEXT NOT NULL DEFAULT 'untested' CHECK (prior_experience IN ('positive', 'neutral', 'negative', 'untested')),
    meta_notes TEXT,
    tiktok_notes TEXT,
    marketplace_notes TEXT,
    general_notes TEXT,
    meta_evidence_url TEXT,
    tiktok_evidence_url TEXT,
    marketplace_evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_checks_product ON codpi_product_market_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_market_checks_date ON codpi_product_market_checks(checked_at DESC);

CREATE TABLE IF NOT EXISTS codpi_product_supplier_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capture_batch_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES codpi_products(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unit_cost NUMERIC(12,2) CHECK (unit_cost >= 0 OR unit_cost IS NULL),
    shipping_cost NUMERIC(12,2) CHECK (shipping_cost >= 0 OR shipping_cost IS NULL),
    stock_qty INTEGER CHECK (stock_qty >= 0 OR stock_qty IS NULL),
    supplier_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_snapshots_batch ON codpi_product_supplier_snapshots(capture_batch_id);
CREATE INDEX IF NOT EXISTS idx_supplier_snapshots_product ON codpi_product_supplier_snapshots(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_snapshots_date ON codpi_product_supplier_snapshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_snapshots_provider ON codpi_product_supplier_snapshots(provider_name);

-- Opcionalmente: añadir trigger para el updated_at si ya existe en el schema, ej:
-- CREATE TRIGGER codpi_update_market_checks_modtime BEFORE UPDATE ON codpi_product_market_checks FOR EACH ROW EXECUTE PROCEDURE codpi_update_updated_at_column();
-- CREATE TRIGGER codpi_update_supplier_snapshots_modtime BEFORE UPDATE ON codpi_product_supplier_snapshots FOR EACH ROW EXECUTE PROCEDURE codpi_update_updated_at_column();
