import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, TrendingDown, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch básico para las cards de KPIs
    const { data: orders, error } = await supabase
        .from('codpi_orders')
        .select('id, estado, precio_venta_unidad, cantidad, costo_producto_unidad, costo_envio, costo_recaudo, gasto_ads_asociado')

    // Cálculos rudimentarios para el Dashboard MVP
    let totalPedidos = 0
    let totalCobrados = 0
    let totalRechazados = 0
    let utilidadReal = 0
    let ingresosCobrados = 0

    if (orders) {
        totalPedidos = orders.length

        orders.forEach(o => {
            if (o.estado === 'cobrado') {
                totalCobrados++
                const ingreso = (o.precio_venta_unidad || 0) * (o.cantidad || 1)
                ingresosCobrados += ingreso

                // Utilidad Neta Real = Venta - Costo Prod - Costo Envio - Costo Recaudo - Ads
                const gastos =
                    (o.costo_producto_unidad * o.cantidad) +
                    (o.costo_envio) +
                    (o.costo_recaudo) +
                    (o.gasto_ads_asociado)

                utilidadReal += (ingreso - gastos)
            } else if (o.estado === 'rechazado') {
                totalRechazados++
                // Si fue rechazado, restamos ads y envio perdidos a la utilidad real general
                utilidadReal -= (o.costo_envio + o.gasto_ads_asociado)
            } else {
                // Para los demás estados (enviado, creado), solo descontamos Ads asignados para un P&L más conservador
                if (o.gasto_ads_asociado) {
                    utilidadReal -= o.gasto_ads_asociado
                }
            }
        })
    }

    const tasaCobro = totalPedidos > 0 ? ((totalCobrados / totalPedidos) * 100).toFixed(1) : 0
    const tasaRechazo = totalPedidos > 0 ? ((totalRechazados / totalPedidos) * 100).toFixed(1) : 0

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">COD Analytics</h1>
            </div>

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
                                <span className="text-red-600 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1" /> Pérdida identificada</span>}
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
                            {totalCobrados} pedidos cobrados de {totalPedidos}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Rechazo</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${Number(tasaRechazo) > 15 ? 'text-red-500' : ''}`}>
                            {tasaRechazo}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalRechazados} pedidos rechazados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ingresos Efectivos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Math.round(ingresosCobrados).toLocaleString('es-CL')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Solo sumando los envíos cobrados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Aquí irá el Ranking de Productos y Detalle */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Ranking de Productos por Utilidad Real</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground h-32 flex items-center justify-center">
                            Próximamente: Ranking dinámico de productos basado en P&L
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
                                <TrendingDown className="h-4 w-4 mr-2" />
                                <strong>Riesgo Alto:</strong> Tasa de rechazo global supera el 20%. Revisa la calidad de tu confirmación o carrier.
                            </div>
                        )}
                        {utilidadReal < 0 && (
                            <div className="bg-orange-50 text-orange-800 p-3 rounded-md text-sm border border-orange-200 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <strong>Alerta de Capital:</strong> Tienes utilidad negativa. Detén campañas con CPA alto inmediatamente.
                            </div>
                        )}
                        {Number(tasaRechazo) <= 20 && utilidadReal >= 0 && (
                            <div className="text-sm text-green-700 flex items-center h-full">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Métricas dentro de parámetros aceptables.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
