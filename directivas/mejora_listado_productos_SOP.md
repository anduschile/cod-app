# SOP: Mejora Listado de Productos (COD App)

## 1. Objetivo
Modificar `src/app/products/page.tsx` para mostrar información de **Validación Comercial** (porcentaje y recomendación) junto al scorecard, e implementar acciones de **Archivar**, **Eliminar**, y filtros en el listado.

## 2. Entradas Generales
- `codpi_products`: Listado principal de productos. Nuevo campo `is_archived` necesario.
- `codpi_evaluation_criteria` y `codpi_product_scores`: Para el cálculo del Score de Matriz actual.
- `codpi_product_market_checks` y `codpi_product_supplier_snapshots`: Entradas de la ficha de Validación Comercial para aplicar el `market-validation-helper.ts`.

## 3. Salida Esperada
1. Tabla de productos enriquecida con columnas de Validación Comercial, Riesgo de abastecimiento y Experiencia previa.
2. Filtros activos en el Listado para alternar vistas (Ej. Solo finalistas, Archivados).
3. Botones/Menú de acciones por fila para Archivar, Eliminar y Editar.

## 4. Lógica
1.  **Migración SQL**: Añadir `is_archived BOOLEAN DEFAULT false` a `codpi_products`.
2.  **Data Fetching**: Extender las Promises de `page.tsx` para obtener registros de `_market_checks` y `_supplier_snapshots` referenciados a los productos actuales. 
3.  **Client Component**: Transformar la renderización de la tabla a un "Client Component" (`ProductsTableClient.tsx`) que reciba la data fresca. Esto permitirá habilitar un input de búsqueda y botones de filtro sin recargas lentas.
4.  **Acciones por Fila**:
    - *Archivar*: Actualiza el registro de Supabase seteando `is_archived = true` (vía Sever Action o fetch REST del cliente al router de Supabase).
    - *Eliminar*: Pide validación. Si existen órdenes, se aborta y alerta. Si es seguro, hace DELETE en Supabase y el cliente refresca data local.
5.  **Regla de Negocio**: Nunca borrar `codpi_orders`.

## 5. Restricciones / Casos Borde (El Bucle de Memoria)
- *Restricción*: Si `codpi_products` se borra en cascada, eliminará dependencias, pero `codpi_orders` no tiene `ON DELETE CASCADE` (tiene `ON DELETE RESTRICT` o la omisión que equivale a `RESTRICT`).
  - *Mitigación*: Envolver el borrado físico en un bloque Try/Catch. Si es un 'Foreign Key Constraint Error' proveniente de órdenes o gastos, mostrar toast de error y solicitar Archivar en su lugar.
- *Atención UI*: No mezclar validación y matriz en un solo número global; mantenerlos separados visualmente.
