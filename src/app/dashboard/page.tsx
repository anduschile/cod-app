import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, TrendingDown, CheckCircle, Truck, Calculator, XCircle, RotateCcw } from 'lucide-react'
import { calculateProductScore } from '@/lib/utils/score-helper'
import { DashboardViewSelector } from './DashboardViewSelector'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()
    const params = await searchParams
    
    const viewMode = (params.viewMode as string) || 'global'
    const productId = params.productId as string
    const testId = params.testId as string

    // 1. Fetch products and tests for the selector
    const [
        { data: allProducts },
        { data: allTests }
    ] = await Promise.all([
        supabase.from('codpi_products').select('id, nombre').order('nombre'),
        supabase.from('codpi_tests_campaigns').select('id, test_name, status, product_id, codpi_products(nombre)').order('created_at', { ascending: false })
    ])

    // 2. Determine effective filtering
    let effectiveTestId = testId
    let effectiveProductId = productId
    let currentTest: any = null

    if (viewMode === 'active_test') {
        if (!effectiveTestId) {
            // Find the only active test if none selected
            const activeTest = allTests?.find((t: any) => t.status === 'active')
            if (activeTest) {
                effectiveTestId = activeTest.id
                currentTest = activeTest
            }
        } else {
            currentTest = allTests?.find((t: any) => t.id === effectiveTestId)
        }
    } else if (viewMode === 'product' && effectiveProductId) {
        // Just used for filtering orders/ads
    }

    // 3. Fetch Data with Filters
    let ordersQuery = supabase.from('codpi_orders').select('id, estado, precio_venta_unidad, cantidad, costo_producto_unidad, costo_envio, costo_recaudo, test_id, product_id, comuna, codpi_products(nombre, comision_pasarela, costo_embalaje, costo_producto, costo_envio_estimado, costo_recaudo_estimado)')
    let adsQuery = supabase.from('codpi_ad_spend_daily').select('monto, compras, test_id, product_id, fecha')
    let opCostsQuery = supabase.from('codpi_operational_costs').select('monto, tipo, test_id, product_id, mes')

    if (viewMode === 'active_test' && effectiveTestId) {
        ordersQuery = ordersQuery.eq('test_id', effectiveTestId)
        adsQuery = adsQuery.eq('test_id', effectiveTestId)
        opCostsQuery = opCostsQuery.eq('test_id', effectiveTestId)
    } else if (viewMode === 'product' && effectiveProductId) {
        ordersQuery = ordersQuery.eq('product_id', effectiveProductId)
        adsQuery = adsQuery.eq('product_id', effectiveProductId)
        opCostsQuery = opCostsQuery.eq('product_id', effectiveProductId)
    } else if (viewMode === 'historical') {
        // Historical view shows comparison, but for the basic cards we might show "All Tests"
        ordersQuery = ordersQuery.not('test_id', 'is', null)
        adsQuery = adsQuery.not('test_id', 'is', null)
        opCostsQuery = opCostsQuery.not('test_id', 'is', null)
    }

    const [
        { data: orders },
        { data: allAds },
        { data: opCosts }
    ] = await Promise.all([
        ordersQuery,
        adsQuery,
        opCostsQuery
    ])

    const now = new Date()
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(now)
    const firstDayOfMonth = `${todayStr.substring(0, 7)}-01`

    // Gastos fijos (Mes actual o filtrados)
    // En vista "Active Test", excluimos ajustes_historicos y perdidas_arrastradas
    const filteredOpCosts = opCosts?.filter((c: any) => {
        if (viewMode === 'active_test') {
            return !['ajuste_historico', 'perdida_arrastrada', 'cierre_test'].includes(c.tipo || '')
        }
        return true
    }) || []

    const totalOpCosts = filteredOpCosts.reduce((acc: number, c: any) => acc + (c.monto || 0), 0) || 0

    // Gasto Ads (Hoy y Acumulado filtrado)
    const gastoAdHoy = allAds?.filter((a: any) => a.fecha === todayStr).reduce((acc: number, a: any) => acc + (a.monto || 0), 0) || 0
    let gastoAdAcumulado = 0
    let totalComprasAds = 0
    if (allAds) {
        allAds.forEach((a: any) => {
            gastoAdAcumulado += (a.monto || 0)
            if (a.compras) totalComprasAds += a.compras
        })
    }

    // Pedidos Metrics
    let pedidosCreados = 0
    let pedidosConfirmados = 0
    let pedidosCobrados = 0
    let pedidosDevueltos = 0
    let despachosTotales = 0
    let ingresosCobrados = 0
    let costoMercaderiaVendida = 0
    let comisionesTotales = 0
    let costoCodTotal = 0

    if (orders) {
        pedidosCreados = orders.length
        orders.forEach((o: any) => {
            const pData: any = o.codpi_products
            const product = Array.isArray(pData) ? pData[0] : pData
            
            if (o.estado === 'confirmado') pedidosConfirmados++

            const isMissingOrZero = (val: any) => val === null || val === undefined || val === 0;
            const cantidad = o.cantidad || 1;
            
            const costoProveedorUnidad = !isMissingOrZero(o.costo_producto_unidad) ? Number(o.costo_producto_unidad) : (!isMissingOrZero(product?.costo_producto) ? Number(product.costo_producto) : 0);
            const costoEnvio = !isMissingOrZero(o.costo_envio) ? Number(o.costo_envio) : (!isMissingOrZero(product?.costo_envio_estimado) ? Number(product.costo_envio_estimado) : 0);
            const costoCod = !isMissingOrZero(o.costo_recaudo) ? Number(o.costo_recaudo) : (!isMissingOrZero(product?.costo_recaudo_estimado) ? Number(product.costo_recaudo_estimado) : 0);
            const costoEmbalaje = !isMissingOrZero(product?.costo_embalaje) ? Number(product.costo_embalaje) : 0;
            const comisionPasarela = !isMissingOrZero(product?.comision_pasarela) ? Number(product.comision_pasarela) : 0;

            if (o.estado === 'cobrado') {
                pedidosCobrados++
                ingresosCobrados += (!isMissingOrZero(o.precio_venta_unidad) ? Number(o.precio_venta_unidad) : 0) * cantidad;
                costoMercaderiaVendida += costoProveedorUnidad * cantidad;
                despachosTotales += costoEnvio;
                costoCodTotal += costoCod * cantidad;
                comisionesTotales += (comisionPasarela + costoEmbalaje) * cantidad;
            }

            if (o.estado === 'devuelto' || o.estado === 'rechazado' || o.estado === 'siniestro' || o.estado === 'enviado') {
                if (o.estado !== 'enviado') pedidosDevueltos++
                despachosTotales += costoEnvio
            }
        })
    }

    const cpaPromedio = (allAds && allAds.length > 0 && pedidosCreados > 0) ? (gastoAdAcumulado / pedidosCreados) : 0
    const cpaReportado = (totalComprasAds > 0) ? (gastoAdAcumulado / totalComprasAds) : 0
    const costoLogisticoPromedio = pedidosCreados > 0 ? (despachosTotales / pedidosCreados) : 0

    const utilidadEstimada = ingresosCobrados - (gastoAdAcumulado + despachosTotales + comisionesTotales + costoCodTotal + costoMercaderiaVendida + totalOpCosts)

    // Top 5 Productos (Solo en vista Global)
    let evaluatedRanking: any[] = []
    if (viewMode === 'global') {
        const [{ data: allCriteria }, { data: allScores }] = await Promise.all([
            supabase.from('codpi_evaluation_criteria').select('*').eq('activo', true),
            supabase.from('codpi_product_scores').select('*')
        ])
        if (allProducts && allCriteria && allScores) {
            evaluatedRanking = allProducts.map((p: any) => {
                const productScores = allScores.filter((s: any) => s.product_id === p.id)
                const evalResult = calculateProductScore(productScores, allCriteria)
                return { nombre: p.nombre, ...evalResult }
            }).filter((r: any) => r.hasScores).sort((a: any, b: any) => b.porcentaje - a.porcentaje).slice(0, 5)
        }
    }

    const selectorTests = allTests?.map((t: any) => ({
        id: t.id,
        test_name: t.test_name,
        product_name: (t.codpi_products as any)?.nombre
    })) || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {viewMode === 'global' ? 'Dashboard Global' : 
                     viewMode === 'active_test' ? `Test: ${currentTest?.test_name || 'No seleccionado'}` :
                     viewMode === 'product' ? `Producto: ${allProducts?.find(p => p.id === productId)?.nombre || ''}` :
                     'Histórico de Tests'}
                </h1>
                <p className="text-muted-foreground">
                    {viewMode === 'active_test' && currentTest && `Producto: ${(currentTest.codpi_products as any)?.nombre} | Desde: ${currentTest.start_date || 'N/A'}`}
                </p>
            </div>

            <DashboardViewSelector 
                products={allProducts || []} 
                activeTests={selectorTests}
            />

            {(viewMode === 'active_test' && !effectiveTestId) ? (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                        <p className="text-yellow-800 font-medium">No hay un test seleccionado o no existe test con status "active".</p>
                        <p className="text-yellow-700 text-sm mt-1">Por favor selecciona un test específico en el selector superior.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilidad {viewMode === 'active_test' ? 'Operativa' : 'Estimada Total'}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${utilidadEstimada >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.round(utilidadEstimada).toLocaleString('es-CL')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {viewMode === 'active_test' ? 'Solo registros del test (Sin ajustes hist.)' : 'Ingresos - Gastos Totales'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gasto Ads {viewMode === 'global' ? '(Hoy)' : '(Vista)'}</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            ${Math.round(viewMode === 'global' ? gastoAdHoy : gastoAdAcumulado).toLocaleString('es-CL')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {viewMode === 'global' ? `Acumulado: $${Math.round(gastoAdAcumulado).toLocaleString('es-CL')}` : 'Total en este periodo/filtro'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPA (Costo por pedido)</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Math.round(cpaPromedio).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalComprasAds > 0 ? `CPA Reportado: $${Math.round(cpaReportado).toLocaleString('es-CL')}` : 'Sin compras reportadas'}
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
                            Envíos totales: ${Math.round(despachosTotales).toLocaleString('es-CL')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="col-span-1 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-800">Total Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{pedidosCreados}</div>
                    </CardContent>
                </Card>
                <Card className="col-span-1 border-yellow-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-800">Confirmados</CardTitle>
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
                {viewMode === 'global' && (
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
                )}
                
                <Card className={viewMode === 'global' ? 'col-span-1' : 'col-span-2'}>
                    <CardHeader>
                        <CardTitle>Desglose Analítico</CardTitle>
                        <CardDescription>Resumen financiero según filtros aplicados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
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
                                    <span className="text-muted-foreground">Costo Ad Spend Acumulado</span>
                                    <span className="text-red-500">-${Math.round(gastoAdAcumulado).toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Despachos Totales</span>
                                    <span className="text-red-500">-${Math.round(despachosTotales).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Comisiones, Embalaje y COD</span>
                                    <span className="text-red-500">-${Math.round(comisionesTotales + costoCodTotal).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">
                                        {viewMode === 'active_test' ? 'Costos Operativos Filt.' : 'Costos Fijos Totales'}
                                    </span>
                                    <span className="text-red-500">-${Math.round(totalOpCosts).toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between pt-4 border-t-2">
                            <span className="font-bold text-lg">Utilidad {viewMode === 'active_test' ? 'Operativa del Test' : 'Neta Estimada'}</span>
                            <span className={`font-bold text-lg ${utilidadEstimada >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Math.round(utilidadEstimada).toLocaleString('es-CL')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
                </>
            )}
        </div>
    )
}
