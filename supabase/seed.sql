-- ==========================================
-- SEED DATA PARA COD PRODUCT INTELLIGENCE
-- ==========================================

-- 1. PRODUCTOS DE EJEMPLO
INSERT INTO codpi_products (id, nombre, slug, categoria, microcategoria, proveedor, costo_producto, costo_envio_estimado, costo_recaudo_estimado, precio_venta_sugerido, descripcion_corta, estado) VALUES
('11111111-1111-1111-1111-111111111111', 'Faja Moldeadora Post-parto', 'faja-moldeadora-1', 'Salud y Belleza', 'Fajas', 'Dropi China', 3500, 3000, 1500, 19990, 'Alta compresión, cierre lateral.', 'ganador'),
('22222222-2222-2222-2222-222222222222', 'Kit Limpiador de Oídos con Cámara', 'limpiador-oidos-cam', 'Tecnología', 'Cuidado Personal', 'Proveedor Local X', 4200, 3500, 1500, 24990, 'Cámara 1080p WIFI, incluye repuestos.', 'testeando'),
('33333333-3333-3333-3333-333333333333', 'Proyector Galaxia Astronauta', 'proyector-astronauta', 'Hogar', 'Decoración', 'Aliexpress', 6000, 4000, 1500, 29990, 'Luz LED con control remoto.', 'evaluando'),
('44444444-4444-4444-4444-444444444444', 'Cepillo Secador 3 en 1', 'cepillo-secador', 'Belleza', 'Cabello', 'Dropi Pro', 5500, 4000, 1500, 22990, 'Multiuso para cabello, fácil demo.', 'descartado'),
('55555555-5555-5555-5555-555555555555', 'Soporte Celular Auto Magnético VIP', 'soporte-magnetico-vip', 'Accesorios Auto', 'Soportes', 'Local', 1500, 3000, 1500, 14990, 'Imán de neodimio, no daña rejilla.', 'listo_para_test');

-- 2. CRITERIOS DEL SCORECARD
INSERT INTO codpi_evaluation_criteria (id, nombre, descripcion, peso, escala_maxima) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'Dolor Claro', 'El producto resuelve un dolor evidente e inmediato.', 1.5, 5),
('bbbb2222-2222-2222-2222-222222222222', 'Wow Factor', 'Genera sorpresa o asombro en los primeros 3 segundos.', 1.5, 5),
('cccc3333-3333-3333-3333-333333333333', 'Riesgo Logístico', 'Bajo riesgo de rotura, ligero de peso y pequeño (5=Muy Bueno/Poco riesgo, 1=Mucho riesgo).', 1.0, 5),
('dddd4444-4444-4444-4444-444444444444', 'Margen Teórico', 'Potencial de markup superior a 3x.', 2.0, 5);

-- 3. PEDIDOS DE EJEMPLO
INSERT INTO codpi_orders (id, fecha_pedido, product_id, nombre_cliente, telefono, comuna, region, direccion, cantidad, precio_venta_unidad, costo_producto_unidad, costo_envio, costo_recaudo, gasto_ads_asociado, estado, tracking_number, carrier) VALUES
(gen_random_uuid(), NOW() - INTERVAL '5 days', '11111111-1111-1111-1111-111111111111', 'María González', '+56912345678', 'Maipú', 'RM', 'Calle Falsa 123', 1, 19990, 3500, 3000, 1500, 4500, 'cobrado', 'TRK-001', 'Bluexpress'),
(gen_random_uuid(), NOW() - INTERVAL '4 days', '11111111-1111-1111-1111-111111111111', 'Ana Silva', '+56922223333', 'La Florida', 'RM', 'Avenida Siempre Viva 456', 2, 19990, 3500, 3000, 1500, 4500, 'cobrado', 'TRK-002', 'Starken'),
(gen_random_uuid(), NOW() - INTERVAL '3 days', '11111111-1111-1111-1111-111111111111', 'Camila Rojas', '+56944445555', 'Puente Alto', 'RM', 'Pje Los Aromos 78', 1, 19990, 3500, 3500, 1500, 4500, 'rechazado', 'TRK-003', 'Bluexpress'),
(gen_random_uuid(), NOW() - INTERVAL '2 days', '11111111-1111-1111-1111-111111111111', 'Sofía Castro', '+56966667777', 'Viña del Mar', 'Valparaíso', 'Calle 5 Norte 90', 1, 19990, 3500, 4000, 1500, 4500, 'enviado', 'TRK-004', 'Starken');

INSERT INTO codpi_orders (id, fecha_pedido, product_id, nombre_cliente, telefono, comuna, region, direccion, cantidad, precio_venta_unidad, costo_producto_unidad, costo_envio, costo_recaudo, gasto_ads_asociado, estado, tracking_number, carrier) VALUES
(gen_random_uuid(), NOW() - INTERVAL '1 days', '22222222-2222-2222-2222-222222222222', 'Juan Pérez', '+56988889999', 'Concepción', 'Biobío', 'O Higgins 100', 1, 24990, 4200, 5000, 1500, 6000, 'enviado', 'TRK-005', 'Bluexpress'),
(gen_random_uuid(), NOW() - INTERVAL '1 days', '22222222-2222-2222-2222-222222222222', 'Pedro Morales', '+56911110000', 'Santiago', 'RM', 'Alameda 234', 1, 24990, 4200, 3000, 1500, 6000, 'confirmado', NULL, NULL),
(gen_random_uuid(), NOW(), '22222222-2222-2222-2222-222222222222', 'Carlos Soto', '+56955554444', 'Temuco', 'Araucanía', 'Av Alemania 55', 1, 24990, 4200, 0, 0, 6000, 'creado', NULL, NULL);

-- 4. ADS Y GASTOS (Ad Spend)
INSERT INTO codpi_ad_spend_daily (fecha, product_id, plataforma, monto, impresiones, clics, cpa_plataforma) VALUES
(CURRENT_DATE - INTERVAL '1 days', '11111111-1111-1111-1111-111111111111', 'Facebook Ads', 25000, 10000, 250, 4500),
(CURRENT_DATE - INTERVAL '1 days', '22222222-2222-2222-2222-222222222222', 'TikTok Ads', 18000, 15000, 400, 6000),
(CURRENT_DATE, '11111111-1111-1111-1111-111111111111', 'Facebook Ads', 10000, 5000, 120, 5000);

-- 5. SOP DOCUMENTO
INSERT INTO codpi_internal_documents (titulo, contenido, categoria) VALUES
('Checklist de Evaluación de Producto COD', '1. Confirmar dolor claro.\n2. Validar peso menor a 1KG.\n3. Buscar al menos 3 videos "Wow" en TikTok.\n4. Realizar cálculo de margen teórico (Costo + Envío + Recaudo + CPA).', 'Evaluación'),
('Protocolos de Confirmación de Pedidos', '1. Llamar en primeros 30 minutos.\n2. Confirmar calle, número y depto.\n3. Advertir que deben tener efectivo o transferencia lista para pagar al repartidor.', 'Logística');
