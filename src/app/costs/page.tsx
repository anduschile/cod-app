import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CostActions } from './CostActions'

export default async function CostsPage() {
    const supabase = await createClient()

    // Fetch historico
    const [{ data: adSpend }, { data: allOpCosts }] = await Promise.all([
        supabase.from('codpi_ad_spend_daily').select('*, codpi_products(nombre)').order('fecha', { ascending: false }).limit(100),
        supabase.from('codpi_operational_costs').select('*').order('mes', { ascending: false }).limit(100)
    ])

    const now = new Date()
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(now)
    const firstDayOfMonth = `${todayStr.substring(0, 7)}-01`

    const [
        { data: todayAds },
        { data: opCostsMes },
        { data: orders }
    ] = await Promise.all([
        supabase.from('codpi_ad_spend_daily').select('monto').eq('fecha', todayStr),
        supabase.from('codpi_operational_costs').select('monto').gte('mes', firstDayOfMonth),
        supabase.from('codpi_orders').select('costo_envio')
    ])

    const totalAdsHoy = todayAds?.reduce((acc, a) => acc + (a.monto || 0), 0) || 0
    const totalOpCostsMes = opCostsMes?.reduce((acc, c) => acc + (c.monto || 0), 0) || 0

    let totalEnvio = 0
    if (orders) {
        orders.forEach(o => totalEnvio += (o.costo_envio || 0))
    }
    const costoLogisticoPromedio = orders && orders.length > 0 ? (totalEnvio / orders.length) : 0

    // Unified History
    let unifiedHistory: any[] = []

    if (adSpend) {
        adSpend.forEach(s => unifiedHistory.push({ ...s, type: 'ad_spend', sortDate: s.fecha }))
    }
    if (allOpCosts) {
        allOpCosts.forEach(c => unifiedHistory.push({ ...c, type: 'operational_cost', sortDate: c.mes }))
    }

    unifiedHistory.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Costos y Publicidad</h1>
                <Button asChild>
                    <Link href="/costs/new">Registrar Costo</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gasto Ads (Hoy)</CardTitle>
                        <CardDescription>Consolidado en la fecha {todayStr}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${Math.round(totalAdsHoy).toLocaleString('es-CL')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Costo Logístico Promedio</CardTitle>
                        <CardDescription>Histórico de envíos ({orders?.length || 0})</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${Math.round(costoLogisticoPromedio).toLocaleString('es-CL')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Costos Operativos Fijos</CardTitle>
                        <CardDescription>Suma de registros del mes en curso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${Math.round(totalOpCostsMes).toLocaleString('es-CL')}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg">Histórico de Costos y Publicidad</h3>
                </div>
                <div className="overflow-x-auto">
                    <Table className="min-w-[1100px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Fecha</TableHead>
                                <TableHead className="w-[120px]">Tipo</TableHead>
                                <TableHead className="w-[180px]">Producto / Concepto</TableHead>
                                <TableHead className="w-[150px]">Plataforma</TableHead>
                                <TableHead className="w-[180px]">Campaña / Ref.</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Compras</TableHead>
                                <TableHead className="text-right">CPA Real</TableHead>
                                <TableHead>Obs.</TableHead>
                                <TableHead className="text-right w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unifiedHistory.length > 0 ? (
                                unifiedHistory.map((item) => {
                                    if (item.type === 'ad_spend') {
                                        const cpaReal = item.compras && item.compras > 0 ? item.monto / item.compras : (item.cpa || null);
                                        return (
                                            <TableRow key={`ad-${item.id}`}>
                                                <TableCell className="whitespace-nowrap font-medium text-sm">
                                                    {new Date(item.fecha + 'T12:00:00Z').toLocaleDateString()}
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Gasto Ads</Badge></TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-sm truncate max-w-[150px]">
                                                        {item.codpi_products?.nombre || <Badge variant="outline" className="text-xs">Global</Badge>}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">{item.plataforma}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm truncate max-w-[150px]" title={item.campana}>{item.campana || '-'}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={item.conjunto}>{item.conjunto || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">${item.monto.toLocaleString('es-CL')}</TableCell>
                                                <TableCell className="text-right">{item.compras || '-'}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {cpaReal ? `$${Math.round(cpaReal).toLocaleString('es-CL')}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-xs truncate max-w-[150px]" title={item.observaciones}>
                                                    {item.observaciones || ''}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <CostActions id={item.id} type="ad_spend" />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    } else {
                                        return (
                                            <TableRow key={`op-${item.id}`}>
                                                <TableCell className="whitespace-nowrap font-medium text-sm">
                                                    {new Date(item.mes + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Fijo Mensual</Badge></TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-sm truncate max-w-[150px]">
                                                        {item.concepto}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">${item.monto.toLocaleString('es-CL')}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">-</TableCell>
                                                <TableCell className="text-right text-muted-foreground">-</TableCell>
                                                <TableCell className="text-xs truncate max-w-[150px]" title={item.notas}>
                                                    {item.notas || ''}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <CostActions id={item.id} type="operational_cost" />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                        No hay registros históricos. Usa "Registrar Costo" para agregarlos manualmente.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
