# Directiva: Transición a Operación Manual Real en COD Intel

## Contexto
El objetivo es transformar la aplicación demo actual de COD Intel en una herramienta operativa, manual y simplificada para operaciones en el mundo real.

## Fases y Pasos de Ejecución

1. **Limpieza de Datos:**
   - Detectar e inactivar la carga de datos ficticios (mocks/seeds) en todas las vistas (Dashboard, Pedidos, Publicidad).
   - Limpiar la base de datos o proveer mecanismos para vaciar datos demo para un "clean state".

2. **Pedidos Manuales (CRUD Completo):**
   - Asegurar que la pantalla "Pedidos Manuales" opere 100% sobre base de datos (Supabase).
   - Implementar acciones Editar y Eliminar con confirmación de borrado.
   - Refinar campos requeridos (fecha, producto, cliente, ubicación, estado, tracking total, obs).
   - Añadir filtros por fecha, producto, estado, y zona.

3. **Costos y Publicidad (Diario):**
   - Implementar CRUD completo para los registros diarios de Ads.
   - Guardar datos reales en Supabase referenciando campañas, inversión y eventos del embudo.
   - Permitir editar/eliminar. Recalcular las tarjetas de resumen basándose en datos reales.

4. **Estructura de Productos (Economía):**
   - Incorporar métricas unitarias de viabilidad en productos (Costo producto, envío, embalaje, pasarela, etc.).
   - Calcular CPA máximo y Margen Bruto, de forma automática.

5. **Bitácora / Observaciones:**
   - Crear sistema simple para registrar hipótesis/cambios diarios en campañas y productos.

6. **Panel Resumen:**
   - Desplegar métricas core agregadas desde fuentes reales (Ads Gasto, Acumulado, Pedidos confirmados, cobrados, utilidades, CPA).

## Restricciones y Casos Borde
- No inventar integraciones de API.
- Mantener diseño limpio y robusto (basado en Tailwind/Shadcn).
- Todos los cálculos deben provenir de la suma de registros ingresados manualmente.
- No romper la UI existente, incorporar mejoras fluidas.
