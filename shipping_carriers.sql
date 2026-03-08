-- Creación de tabla para transportadoras (Shipping Carriers)
CREATE TABLE IF NOT EXISTS public.codpi_shipping_carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    priority_order INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed de transportadoras iniciales
INSERT INTO public.codpi_shipping_carriers (code, name, priority_order, is_active)
VALUES 
    ('BLUE', 'BLUE', 1, true),
    ('VELOCES', 'VELOCES', 2, true),
    ('WIILOG', 'WIILOG', 3, true),
    ('STARKEN', 'STARKEN', 4, true)
ON CONFLICT (code) DO UPDATE 
SET 
    name = EXCLUDED.name,
    priority_order = EXCLUDED.priority_order,
    is_active = EXCLUDED.is_active;
