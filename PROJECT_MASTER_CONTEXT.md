PROJECT MASTER CONTEXT
1. Identidad del proyecto

Nombre del proyecto
Andus / COD Intel / Shopify / Meta Ads

Propósito
Construir un sistema operativo real para testeo y venta de productos físicos bajo modalidad COD (pago contra entrega), combinando tienda online, pauta pagada y una aplicación interna de control para medir utilidad real y decidir continuidad o descarte de productos.

Problema que resuelve
Evitar tomar decisiones de ecommerce y publicidad solo por intuición, volumen de clics o “sensación de venta”. El proyecto busca medir con lógica financiera real si un producto soporta pauta, logística y operación diaria.

Usuario objetivo
Operador/emprendedor que testea productos COD y necesita una estructura simple pero rigurosa para:

lanzar productos

medir anuncios

controlar pedidos

registrar costos

calcular utilidad neta real

decidir si seguir, escalar o matar un producto

2. Objetivo general

Qué se busca construir
Un flujo integrado y reutilizable para testear productos físicos COD usando:

Shopify como storefront

Meta Ads como adquisición

COD Intel como sistema interno de control y decisión

Supabase como base de datos operativa

Vercel como despliegue de la app interna

Dropi/transportadora como parte logística del despacho y tracking.

Qué no es el proyecto

No es solo una tienda Shopify

No es solo una campaña de Meta Ads

No es un dashboard cosmético

No es una operación basada en “ventas brutas”

No es un experimento de branding; es una máquina de prueba y decisión

Alcance real
El alcance real incluye:

selección y carga de producto

construcción de oferta

publicación en tienda

pauta pagada

seguimiento postventa

carga de datos reales en COD Intel

lectura financiera y decisión operativa

3. Estado actual

Etapa del proyecto
Etapa operativa-analítica post primer test real.

Qué está implementado

tienda Shopify funcional

dominio propio operativo: anduschile.store

producto actual cargado

conexión Meta / pixel / data sharing configurada

campaña de ventas lanzada y medida

COD Intel operativo en cod.anduschile.com

dashboard con cálculo de utilidad real corregido

módulos CRUD funcionales para pedidos, costos/publicidad y bitácora

mensajes tipo de WhatsApp ya trabajados

etiquetas de WhatsApp Business ya creadas por etapa operacional.

Qué está en progreso

depuración/validación final de eventos Meta (especialmente AddToCart vs Purchase)

consolidación documental del proyecto

transición desde el primer producto testeado hacia la búsqueda del siguiente candidato

Qué está pendiente

limpiar definitivamente la medición de eventos en Meta sin duplicidades con Shopify

documentar el aprendizaje del primer test como insumo oficial

seleccionar y evaluar nuevos productos candidatos

construir la segunda iteración de test con mejor criterio desde el inicio

Estado del primer producto testado
El primer producto testado fue la Picadora Eléctrica Premium para Cocina. Tenía señales positivas arriba del embudo y logró una compra inicial, pero después de 72 horas y una fase adicional de depuración de campaña no logró validarse como ganador cómodo ni escalable por pauta fría. El contexto inicial ya advertía que el producto no era un “ganador cómodo” y que debía confirmarse con datos reales.

4. Arquitectura / estructura técnica

Stack

Shopify: tienda online

Meta Ads: adquisición y testeo publicitario

COD Intel: app interna

Supabase: backend / base de datos

Vercel: deploy de la app

GitHub + Git: control de versiones / deploy

Hostinger: DNS / dominio

Antigravity: modificación directa del código

Dropi / transportadora: logística y tracking.

Backend

Supabase como repositorio principal de datos operativos

lógica de negocio enfocada en utilidad real, no solo ventas

Frontend

Shopify para canal de venta

COD Intel para operación y análisis interno

Integraciones

Shopify ↔ Meta/Facebook & Instagram channel

Shopify ↔ pixel / data sharing

COD Intel ↔ Supabase

App ↔ Vercel deploy

logística vía Dropi / transportadora

Fuentes de datos

datos manuales de pedidos

gasto ads

costos fijos

datos del producto

métricas exportadas desde Meta Ads

seguimiento logístico

Ambientes

producción tienda: anduschile.store

producción app: cod.anduschile.com

5. Modelo de datos / estructura lógica

Nota importante
La estructura lógica funcional está clara, pero el detalle exacto de tablas no quedó completamente explicitado en este chat. Donde no esté confirmado, se marca como pendiente.

Entidades principales confirmadas

Producto

Pedido manual

Costo / gasto publicitario

Costo mensual / fijo

Bitácora

Campaña / anuncio (al menos a nivel lógico)

Métricas de producto / utilidad

Relaciones clave

Un producto puede tener muchos pedidos

Un producto puede tener muchos registros de gasto/costo

La bitácora registra cambios vinculados a producto y/o campaña

El dashboard consolida ingresos cobrados + costos variables + ads + costos fijos

Capas o áreas lógicas

Laboratorio de productos

Pedidos manuales

Costos y publicidad

Bitácora

Dashboard consolidado.

Pendiente de validar

listado exacto de tablas físicas en Supabase

nombres definitivos de tablas

relaciones SQL exactas

si existe una separación formal adicional entre staging y tablas operativas

6. Lógica de negocio

Regla principal
La utilidad real no se mide como:

ingresos – publicidad

La utilidad real se mide como:

ingresos cobrados

menos CMV

menos despachos

menos COD / embalaje / pasarela

menos ads

menos costos fijos.

Restricciones principales

No tomar decisiones por intuición

No considerar “venta” como sinónimo de “negocio”

No bajar precio solo por ansiedad sin evidencia de mejora real en conversión

No mover varias variables a la vez en un test

No mezclar campañas o estructuras al punto de perder lectura causal

Supuestos operativos

Los pedidos COD requieren validación y seguimiento operativo por WhatsApp

El rendimiento real del producto se confirma solo cuando se cruza pauta + logística + margen

La app COD Intel debe ser la fuente de verdad financiera interna

Excepciones / matices importantes

Un producto puede “tener vida” sin ser ganador escalable

Un anuncio puede generar clics baratos sin sostener compras

Un conjunto con mejor CTR no necesariamente es el mejor para convertir

Un presupuesto Advantage a nivel campaña no equivale a presupuesto por conjunto

7. Flujo de funcionamiento

Entrada de datos

Selección de producto candidato

Carga de economía unitaria en Laboratorio

Creación/carga del producto en Shopify

Desarrollo de copy, creativos y landing

Lanzamiento de campaña en Meta

Registro de pedidos, gastos y costos en COD Intel

Exportación y análisis de métricas

Procesamiento

Shopify recibe tráfico y pedidos

Meta distribuye presupuesto según configuración

COD Intel consolida ingresos, costos y gastos

Se compara CPA real contra margen bruto y utilidad neta

Resultados esperados

Determinar si el producto:

se mantiene

se ajusta

se escala

se descarta

Outputs principales

utilidad neta real

lectura por campaña / conjunto / anuncio

decisión operativa

aprendizaje reutilizable para siguiente producto

8. Módulos o componentes
8.1 Dashboard

Propósito
Consolidar utilidad real del negocio.

Estado actual
Operativo y corregido. Antes inflaba utilidad al restar solo ads; ahora descuenta CMV, despachos, ads, costos fijos y componentes relevantes sobre pedidos cobrados.

8.2 Laboratorio de Productos

Propósito
Definir economía unitaria, estado del producto y criterio de testeo.

Estado actual
Operativo. Calcula margen bruto unitario y CPA máximo aceptable.

8.3 Pedidos Manuales

Propósito
Registrar y administrar pedidos reales.

Estado actual
Operativo. CRUD funcional, filtros y lectura para dashboard.

8.4 Costos y Publicidad

Propósito
Registrar gasto ads y costos mensuales/fijos.

Estado actual
Operativo. Histórico unificado, edición, eliminación e impacto correcto en dashboard.

8.5 Bitácora

Propósito
Registrar cambios, hipótesis y resultados esperados.

Estado actual
Operativa. Se corrigió la ausencia de tabla.

8.6 Manual Operativo

Propósito
Acompañar la operación con instrucciones.

Estado actual
Disponible como módulo, pero pendiente de consolidación documental más estricta.

8.7 WhatsApp Business

Propósito
Confirmación, seguimiento y control operativo del pedido.

Estado actual
Respuestas rápidas diseñadas y etiquetas creadas. Flujo definido:

nuevo pedido

pendiente confirmación

confirmado

despachado

entrega hoy

entregado

incidencia

no responde

postventa

9. Decisiones importantes ya tomadas
Arquitectura / operación

COD Intel queda como herramienta interna oficial de control y decisión

Shopify queda como canal de venta

Meta Ads queda como canal de adquisición para test de productos

El análisis financiero manda por sobre vanity metrics

Producto actual

El producto trabajado fue la Picadora Eléctrica Premium para Cocina

Ángulo comercial correcto: práctico, no técnico

Referencias trabajadas:

precio sugerido: $29.990

costo proveedor: $7.990

costo envío promedio: $7.500

margen bruto unitario: $14.500

CPA máximo aceptable: $14.500.

Decisiones de análisis

No bajar precio de forma anticipada sin evidencia

No escalar un producto por una sola venta

No seguir premiando conjuntos que traen clic pero no compra

No duplicar una campaña defectuosa solo para “probar con más presupuesto”

No confundir presupuesto total de campaña Advantage con presupuesto por conjunto

Decisiones derivadas del primer test

El conjunto Pur3 Scl fue el único defendible

Pur2 Wom quedó como el más débil en eficiencia real

La estructura inicial de 3 conjuntos no quedó validada

La limpieza posterior de campaña no rescató el producto

La decisión final fue cerrar el test pagado del producto actual como producto principal de pauta fría

El producto se clasifica como:
“Producto con interés, pero no validado para pauta fría escalable.”

Decisiones de medición

Debe corregirse la configuración de eventos AddToCart/Purchase

Evitar duplicar eventos entre Shopify y configuración manual en Meta

Purchase solo debe representar compra/confirmación final real

AddToCart debe corresponder al paso previo correcto

Decisión documental

El proyecto se trabajará con continuidad documental estricta

El archivo maestro será la referencia oficial

Cada sesión debe dejar informe incremental reutilizable

10. Riesgos y problemas conocidos

Riesgos operativos

confundir clics con demanda real

margen demasiado estrecho para absorber errores

subestimar costos logísticos y operativos

confiar en una venta aislada como prueba de validación

Riesgos de medición

configuración incorrecta de eventos Meta

posible duplicidad de eventos si Shopify y Meta disparan lo mismo

lectura incompleta si faltan AddToCart / checkout / purchase bien diferenciados

Riesgos estratégicos

insistir demasiado en un producto tibio

bajar precio antes de validar cuello de botella real

lanzar campañas duplicadas que compiten entre sí

dispersar presupuesto en audiencias o conjuntos no validados

Problemas ya detectados

la campaña inicial no gastaba “poco”; se interpretó mal por confusión entre presupuesto Advantage a nivel campaña vs presupuesto por conjunto

el embudo superior funcionó mejor que la conversión final

la limpieza de campaña y concentración en Pur3 no generó nuevas compras suficientes

el producto actual no quedó validado como ganador de pauta pagada

11. Backlog / pendientes relevantes
Pendientes inmediatos

dejar correctamente validada la configuración de eventos:

ViewContent

AddToCart

InitiateCheckout

Purchase

documentar formalmente el cierre del test del producto actual

registrar en COD Intel todos los costos/gastos definitivos del test

Pendientes estratégicos

construir shortlist de nuevos productos candidatos

evaluar nuevos productos con matriz:

problema real

claridad visual

margen

costo logístico

facilidad de venta COD

riesgo de devolución

seleccionar siguiente producto principal de test

Pendientes de aprendizaje/documentación

dejar asentado qué anuncio, qué conjunto y qué señales fueron las únicas rescatables del test actual

definir si la picadora queda para:

remarketing

orgánico

bundle

retest futuro con otra oferta
pero no como producto principal actual

Pendientes técnicos

revisar si la instrumentación Meta debe quedar totalmente soportada por Shopify o parcialmente asistida por Event Setup Tool

validar definitivamente que no haya duplicidades en pixel / CAPI

12. Criterios de trabajo para nuevos chats

Tomar este archivo como base oficial del proyecto.

No reinterpretar desde cero decisiones ya tomadas.

Respetar la lógica principal: medir utilidad real, no solo ventas.

No reabrir debates ya cerrados sin evidencia nueva.

Diferenciar siempre entre:

decisión confirmada

hallazgo

hipótesis

pendiente

No proponer escalar productos no validados.

No mezclar demasiadas variables en una misma recomendación de test.

Al cierre de cada sesión, generar un informe incremental con:

resumen ejecutivo

avances

decisiones

hallazgos

problemas

pendientes

próximos pasos

texto listo para incorporar al archivo maestro

13. Historial resumido de sesiones
2026-03-11 a 2026-03-12

Se consolidó la infraestructura base del proyecto:

Shopify operativa

dominio anduschile.store

producto actual cargado

Meta conectado

COD Intel operativo

dashboard corregido para utilidad real

mensajes tipo de WhatsApp definidos

deploy funcional en cod.anduschile.com.

2026-03-12 a 2026-03-13

Primer corte de métricas del producto actual:

señales positivas arriba del embudo

primera compra registrada

decisión: no cambiar producto ni bajar precio todavía

recomendación: esperar a 48–72 horas y no mover varias variables a la vez.

2026-03-13 a 2026-03-14

Corte más profundo por campaña, conjunto y anuncio:

se identificó que no todos los conjuntos valían lo mismo

Pur3 Scl fue el único conjunto defendible

se entendió que el presupuesto estaba a nivel campaña por Advantage, no por conjunto

se decidió depurar la estructura

2026-03-14 a 2026-03-15

Se pausaron Pur1 y Pur2 y se dejó Pur3 con el mejor anuncio.
Resultado:

la limpieza no rescató la conversión

el producto quedó sin validación suficiente para pauta fría escalable

decisión: cerrar el test pagado como producto principal

2026-03-17

Se definió la política de continuidad documental estricta:

el archivo maestro pasa a ser referencia oficial

cada sesión debe dejar informe incremental

no se debe rediseñar el proyecto desde cero en nuevos chats

Observación final de estado

Estado oficial actual del proyecto
La infraestructura del sistema sí quedó lograda. La tienda, la app interna y el flujo operativo base están en funcionamiento. El primer producto real ya fue testeado y dejó aprendizaje útil, pero no quedó validado como ganador escalable de pauta. El proyecto entra ahora en fase de capitalización del aprendizaje + selección del siguiente producto.