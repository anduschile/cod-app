import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, TrendingDown, CheckCircle, Truck, Calculator, XCircle, RotateCcw } from 'lucide-react'
import { calculateProductScore } from '@/lib/utils/score-helper'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: orders } = await supabase
        .from('codpi_orders')
        .select('id, estado, precio_venta_unidad, cantidad, costo_producto_unidad, costo_envio, costo_recaudo, comuna, codpi_products(nombre, comision_pasarela, costo_embalaje, costo_producto, costo_envio_estimado, costo_recaudo_estimado)')

    const now = new Date()
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(now)
    const firstDayOfMonth = `${todayStr.substring(0, 7)}-01`

    const [
        { data: allAds },
        { data: todayAds },
        { data: opCostsMes }
    ] = await Promise.all([
        supabase.from('codpi_ad_spend_daily').select('monto, compras'),
        supabase.from('codpi_ad_spend_daily').select('monto').eq('fecha', todayStr),
        supabase.from('codpi_operational_costs').select('monto').gte('mes', firstDayOfMonth)
    ])

    // Gastos fijos (Mes)
    const totalOpCostsMes = opCostsMes?.reduce((acc, c) => acc + (c.monto || 0), 0) || 0

    // Gasto Ads (Diario y Acumulado)
    const gastoAdHoy = todayAds?.reduce((acc, a) => acc + (a.monto || 0), 0) || 0
    let gastoAdAcumulado = 0
    let totalComprasAds = 0
    if (allAds) {
        allAds.forEach(a => {
            gastoAdAcumulado += (a.monto || 0)
            if (a.compras) totalComprasAds += a.compras
        })
    }

    // Pedidos Metrics
    let pedidosCreados = 0
    let pedidosConfirmados = 0
    let pedidosCobrados = 0
    let pedidosDevueltos = 0
    let despachosTotales = 0 // Suma de todos los envios (cobrados y devueltos suelen tener costo logistico)
    let ingresosCobrados = 0
    let costoMercaderiaVendida = 0
    let comisionesTotales = 0
    let costoCodTotal = 0

    if (orders) {
        pedidosCreados = orders.length
        orders.forEach(o => {
            const pData: any = o.codpi_products
            const product = Array.isArray(pData) ? pData[0] : pData
            
            // Si el estado es "confirmado", lo contamos
            if (o.estado === 'confirmado') pedidosConfirmados++

            // Lógica de cálculo estricta por pedido
            // NOTA: En `codpi_orders`, los campos numéricos vacíos se están guardando como `0` en lugar de `null`.
            // Por lo tanto, si el valor en la orden es `0`, DEBEMOS hacer fallback al producto. Solo si
            // el producto NO existe (es decir, fue borrado o no tiene costo) asignamos 0.
            const isMissingOrZero = (val: any) => val === null || val === undefined || val === 0;
            const cantidad = o.cantidad || 1;
            
            // Prioridad: 1. Costo real guardado en pedido (si no es 0). 2. Costo base del producto. 3. Cero.
            const costoProveedorUnidad = !isMissingOrZero(o.costo_producto_unidad) ? Number(o.costo_producto_unidad) : (!isMissingOrZero(product?.costo_producto) ? Number(product.costo_producto) : 0);
            const costoEnvio = !isMissingOrZero(o.costo_envio) ? Number(o.costo_envio) : (!isMissingOrZero(product?.costo_envio_estimado) ? Number(product.costo_envio_estimado) : 0);
            
            // EXCEPCIÓN: costo_recaudo sí puede ser 0 legítimamente si pasarela asume el gasto. 
            // Sin embargo, en el dashboard, si fallamos a buscar el costo base, tenemos información más completa.
            // Para proteger el dashboard de utilidades falsas, asuminos el costo base a menos que la orden afirme costo específico > 0.
            const costoCod = !isMissingOrZero(o.costo_recaudo) ? Number(o.costo_recaudo) : (!isMissingOrZero(product?.costo_recaudo_estimado) ? Number(product.costo_recaudo_estimado) : 0);
            
            // Estos vienen explícitamente del producto (ya que la DB de ordenes no los tiene)
            const costoEmbalaje = !isMissingOrZero(product?.costo_embalaje) ? Number(product.costo_embalaje) : 0;
            const comisionPasarela = !isMissingOrZero(product?.comision_pasarela) ? Number(product.comision_pasarela) : 0;

            // Si el estado es "cobrado"
            if (o.estado === 'cobrado') {
                pedidosCobrados++
                ingresosCobrados += (!isMissingOrZero(o.precio_venta_unidad) ? Number(o.precio_venta_unidad) : 0) * cantidad;
                costoMercaderiaVendida += costoProveedorUnidad * cantidad;
                despachosTotales += costoEnvio; // El envio ya suele estar calculado en total
                costoCodTotal += costoCod * cantidad;
                comisionesTotales += (comisionPasarela + costoEmbalaje) * cantidad;
            }

            // Si el estado es "devuelto" o "rechazado" o "siniestro"
            if (o.estado === 'devuelto' || o.estado === 'rechazado' || o.estado === 'siniestro') {
                pedidosDevueltos++
                despachosTotales += costoEnvio // El flete se paga igual si no se entrega
            }

            // Sumar fletes de enviados tambien, considerando que enviados ya se invirtió el dinero
            if (o.estado === 'enviado') {
                despachosTotales += costoEnvio
            }
        })
    }

    const cpaPromedio = (allAds && allAds.length > 0 && pedidosCreados > 0) ? (gastoAdAcumulado / pedidosCreados) : 0

    // CPA basado en el campo compras si el usuario lo llenó consistentemente
    const cpaReportado = (totalComprasAds > 0) ? (gastoAdAcumulado / totalComprasAds) : 0

    const costoLogisticoPromedio = pedidosCreados > 0 ? (despachosTotales / pedidosCreados) : 0

    // UTILIDAD ESTIMADA
    // = Ingresos Cobrados - (Todo Ad Spend + Despachos Totales + Comisiones Totales + Costo Mercaderia Vendida (solo de los cobrados)) - Gastos fijos operativos del mes
    const utilidadEstimada = ingresosCobrados - (gastoAdAcumulado + despachosTotales + comisionesTotales + costoCodTotal + costoMercaderiaVendida + totalOpCostsMes)

    // Top 5 Productos (Evaluación Teórica)
    const [{ data: allCriteria }, { data: allScores }, { data: allProducts }] = await Promise.all([
        supabase.from('codpi_evaluation_criteria').select('*').eq('activo', true),
        supabase.from('codpi_product_scores').select('*'),
        supabase.from('codpi_products').select('id, nombre')
    ])

    let evaluatedRanking: any[] = []
    if (allProducts && allCriteria && allScores) {
        evaluatedRanking = allProducts.map(p => {
            const productScores = allScores.filter(s => s.product_id === p.id)
            const evalResult = calculateProductScore(productScores, allCriteria)
            return {
                nombre: p.nombre,
                ...evalResult
            }
        }).filter(r => r.hasScores).sort((a, b) => b.porcentaje - a.porcentaje).slice(0, 5)
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Analíticas COD (Producción)</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilidad Estimada Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${utilidadEstimada >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.round(utilidadEstimada).toLocaleString('es-CL')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ingresos - Gastos Totales
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gasto Ads (Hoy)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">${Math.round(gastoAdHoy).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total histórico: ${Math.round(gastoAdAcumulado).toLocaleString('es-CL')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Costo por pedido creado</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Math.round(cpaPromedio).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalComprasAds > 0 ? `CPA Reportado: $${Math.round(cpaReportado).toLocaleString('es-CL')}` : 'Sin compras reportadas en ads'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Logística Promedio</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Math.round(costoLogisticoPromedio).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Costo total de envíos ({despachosTotales > 0 ? 'Detectado' : 'Sin datos'})
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="col-span-1 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-800">Total Pedidos (Histórico)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{pedidosCreados}</div>
                    </CardContent>
                </Card>
                <Card className="col-span-1 border-yellow-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-800">Confirmados/Enviados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 text-3xl font-bold text-yellow-900">
                            {pedidosConfirmados}
                            {pedidosCreados > 0 && <span className="text-sm font-medium text-muted-foreground mb-1">({Math.round((pedidosConfirmados / pedidosCreados) * 100)}%)</span>}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1 border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-800 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Cobrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 text-3xl font-bold text-green-900">
                            {pedidosCobrados}
                            {pedidosCreados > 0 && <span className="text-sm font-medium text-green-700/70 mb-1">({Math.round((pedidosCobrados / pedidosCreados) * 100)}%)</span>}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1 border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-800 flex items-center gap-2"><XCircle className="w-4 h-4" /> Devueltos/Rech.</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 text-3xl font-bold text-red-900">
                            {pedidosDevueltos}
                            {pedidosCreados > 0 && <span className="text-sm font-medium text-red-700/70 mb-1">({Math.round((pedidosDevueltos / pedidosCreados) * 100)}%)</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top 5 Evaluados Teóricos</CardTitle>
                        <CardDescription>Scorecard inicial de productos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {evaluatedRanking.map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{i + 1}. {p.nombre}</span>
                                        <span className={`text-[10px] font-semibold mt-0.5 w-fit px-1.5 py-0.5 rounded-md border ${p.colorRecomendacion}`}>
                                            {p.recomendacion}
                                        </span>
                                    </div>
                                    <span className="font-mono font-bold text-sm">
                                        {p.porcentaje.toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                            {evaluatedRanking.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">Aún no hay evaluación teórica</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Desglose Analítico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Ingresos (Solo Cobrados)</span>
                                <span className="font-semibold text-green-600">${Math.round(ingresosCobrados).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Costo de Mercadería (CMV)</span>
                                <span className="text-red-500">-${Math.round(costoMercaderiaVendida).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Costo Ad Spend Total</span>
                                <span className="text-red-500">-${Math.round(gastoAdAcumulado).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Despachos Totales</span>
                                <span className="text-red-500">-${Math.round(despachosTotales).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Comisiones, Embalaje y COD</span>
                                <span className="text-red-500">-${Math.round(comisionesTotales + costoCodTotal).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Costos Fijos (Mes Actual)</span>
                                <span className="text-red-500">-${Math.round(totalOpCostsMes).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="font-bold">Utilidad Estimada Neta</span>
                                <span className={`font-bold ${utilidadEstimada >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Math.round(utilidadEstimada).toLocaleString('es-CL')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
