INSERT INTO public.codpi_internal_documents (titulo, contenido, categorias, is_pinned)
VALUES (
'Criterio operativo de decisión',
'# Criterio operativo de decisión

Este documento define la regla de negocio para proceder o pausar la prueba de un producto en base a su **evaluación teórica** del *Scorecard*.

## Rangos de Decisión
* **Puntaje >= 80% (PROBAR):** El producto se alinea fuertemente con los criterios de éxito (hook visual, dolores claros, buen margen). Se autoriza fase de testeo con anuncios (Fase 1).
* **Puntaje 50% a 79% (OBSERVAR):** El producto tiene potencial pero flaquea en variables importantes. Se recomienda iterar el ángulo de venta o buscar mejores costos de proveedor antes de escalar.
* **Puntaje < 50% (DESCARTAR):** No cumple con las bases del negocio actual. Evitar lanzar campaña comercial.
* **Sin puntaje (SIN EVALUAR):** Producto preliminar. Requiere asignación de scorecard en Laboratorio.

---
**IMPORTANTE:** El score *teórico* es solo el filtro inicial. Siempre debe balancearse y validarse con la realidad en la calle (Fase de Test):

1. **Utilidad real neta:** ¿El producto soporta el CPA (Costo por Adquisición) que impone la pauta publicitaria?
2. **Tasa de cobro esperada:** Un producto teóricamente perfecto genera pérdidas absolutas si el ratio de pago en puerta es irrealmente bajo.
3. **Riesgo logístico y de retornos:** Considera volumetría, peso, fragilidad o susceptibilidad a fallas que disparen los reclamos y rechazos pos-despacho.',
ARRAY['producto', 'estrategia', 'scorecard'],
true
);
