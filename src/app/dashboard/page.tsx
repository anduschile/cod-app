import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, TrendingDown, CheckCircle, Truck, Calculator } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: orders, error: errorOrders } = await supabase
        .from('codpi_orders')
        .select('id, estado, precio_venta_unidad, cantidad, costo_producto_unidad, costo_envio, costo_recaudo, gasto_ads_asociado, codpi_products(nombre)')

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: opCosts, error: errorOpCosts } = await supabase
        .from('codpi_operational_costs')
        .select('monto')
        .gte('mes', firstDayOfMonth)

    const totalOpCosts = opCosts?.reduce((acc, c) => acc + (c.monto || 0), 0) || 0

    let totalPedidos = 0
    let totalCobrados = 0
    let totalRechazados = 0
    let utilidadReal = 0
    let ingresosCobrados = 0
    let totalEnvio = 0

    const rankingMap: Record<string, { product: string, utility: number, count: number }> = {}

    if (orders) {
        totalPedidos = orders.length

        orders.forEach(o => {
            totalEnvio += (o.costo_envio || 0)

            const productName = o.codpi_products?.nombre || 'Sin Producto'
            if (!rankingMap[productName]) {
                rankingMap[productName] = { product: productName, utility: 0, count: 0 }
            }

            if (o.estado === 'cobrado') {
                totalCobrados++
                const ingreso = (o.precio_venta_unidad || 0) * (o.cantidad || 1)
                ingresosCobrados += ingreso

                const gastos =
                    (o.costo_producto_unidad * o.cantidad) +
                    (o.costo_envio || 0) +
                    (o.costo_recaudo || 0) +
                    (o.gasto_ads_asociado || 0)

                const utility = (ingreso - gastos)
                utilidadReal += utility

                rankingMap[productName].utility += utility
                rankingMap[productName].count += 1
            } else if (o.estado === 'rechazado') {
                totalRechazados++
                const loss = ((o.costo_envio || 0) + (o.gasto_ads_asociado || 0))
                utilidadReal -= loss
                rankingMap[productName].utility -= loss
            } else {
                if (o.gasto_ads_asociado) {
                    utilidadReal -= o.gasto_ads_asociado
                    rankingMap[productName].utility -= o.gasto_ads_asociado
                }
            }
        })
    }

    // Restar también los gastos fijos a la utilidad real del mes (opcional, o mostrarlo por separado. Para purismo lo restamos del general global)
    utilidadReal -= totalOpCosts

    const tasaCobro = totalPedidos > 0 ? ((totalCobrados / totalPedidos) * 100).toFixed(1) : 0
    const tasaRechazo = totalPedidos > 0 ? ((totalRechazados / totalPedidos) * 100).toFixed(1) : 0
    const costoLogisticoPromedio = totalPedidos > 0 ? (totalEnvio / totalPedidos) : 0

    const productRanking = Object.values(rankingMap).sort((a, b) => b.utility - a.utility).slice(0, 5)

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Analíticas COD</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilidad Neta Real</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${utilidadReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.round(utilidadReal).toLocaleString('es-CL')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {utilidadReal >= 0 ?
                                <span className="text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> Margen positivo</span> :
                                <span className="text-red-600 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1" /> Pérdida general</span>}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasaCobro}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalCobrados} cobrados de {totalPedidos} envíos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Costo Logístico Promedio</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Math.round(costoLogisticoPromedio).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Promedio general por envío
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Costos Operativos (Este mes)</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">${Math.round(totalOpCosts).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Impactan en la utilidad neta global
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card className="col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Ranking por Utilidad Real</CardTitle>
                        <CardDescription>Basado en costos de adición y restando rechazos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {productRanking.map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{i + 1}. {p.product}</span>
                                        <span className="text-xs text-muted-foreground">{p.count} cobrados</span>
                                    </div>
                                    <span className={`font-mono font-medium text-sm ${p.utility >= 0 ? "text-green-600" : "text-red-500"}`}>
                                        ${Math.round(p.utility).toLocaleString('es-CL')}
                                    </span>
                                </div>
                            ))}
                            {productRanking.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">Sin datos suficientes</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Alertas Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Number(tasaRechazo) > 20 && (
                            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm mb-2 border border-red-200 flex items-center">
                                <TrendingDown className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span><strong>Riesgo Alto:</strong> Rechazo supera 20% ({tasaRechazo}%).</span>
                            </div>
                        )}
                        {utilidadReal < 0 && (
                            <div className="bg-orange-50 text-orange-800 p-3 rounded-md text-sm border border-orange-200 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span><strong>Alerta de Capital:</strong> Tienes utilidad negativa. Evalúa detener ads o recortar fijos.</span>
                            </div>
                        )}
                        {Number(tasaRechazo) <= 20 && utilidadReal >= 0 && (
                            <div className="text-sm text-green-700 flex items-center h-full">
                                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>Métricas estables.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
