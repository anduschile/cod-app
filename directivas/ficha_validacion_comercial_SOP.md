# Directiva: Ficha de Validación Comercial

## Objetivo
Agregar dentro del MVP una Ficha de Validación Comercial para cada producto, con foco en decidir rápidamente qué producto conviene lanzar, basándose en señales de mercado y stock de proveedores ingresadas manualmente.

## Entradas
- Formularios manuales de "Chequeo de mercado".
- Formularios manuales de "Snapshots de proveedores / stock".

## Salidas
- Datos estructurados en `codpi_product_market_checks` y `codpi_product_supplier_snapshots`.
- Visualización de la Ficha (Último chequeo, Resumen de stock y proveedores, Score y Recomendación).
- Badges de Score y Recomendación en el listado general de productos.

## Restricciones y Casos Borde
- **Falso positivo de automatización:** Todo el ingreso es manual-first. NO integrar APIs externas.
- **Interferencia:** No romper el scorecard existente.
- **Lógica Fuerte:** Si `prior_experience = negative`, el sistema NO debe dejar el producto automáticamente en “PROBAR”. Se fuerza a “OBSERVAR” y se muestra una bandera de advertencia.
- **Terminología estricta:** Llamar a los cambios de stock "Señal de rotación" y "Riesgo de abastecimiento". NO llamarlo "Ventas".
- **Prefijos en Base de datos:** Todas las tablas nuevas deben empezar con `codpi_`.
- **Agrupación de Snapshots:** `codpi_product_supplier_snapshots` DEBE incluir `capture_batch_id UUID NOT NULL` para comparar el último batch contra el batch anterior, no filas sueltas.
- **Validaciones de Integridad en DB:** Añadir CHECK constraints para `meta_ads_signal_score`, `tiktok_signal_score`, etc. (0 al 5), `unit_cost >= 0`, `shipping_cost >= 0` y `stock_qty >= 0`. `prior_experience` debe estar en `('positive', 'neutral', 'negative', 'untested')`.
- **Seguridad (RLS):** Las tablas nuevas deben respetar el patrón RLS exacto que el resto del proyecto para no romper lectura/escritura desde la app.

*(Actualizar esta sección con cualquier trampa nueva que surja durante la ejecución)*
