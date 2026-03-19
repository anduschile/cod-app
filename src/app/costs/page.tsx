import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CostActions } from './CostActions'
import { DashboardViewSelector } from '../dashboard/DashboardViewSelector'

export default async function CostsPage({
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

    // 2. Fetch History with Filters
    let adSpendQuery = supabase.from('codpi_ad_spend_daily').select('*, codpi_products(nombre), codpi_tests_campaigns(test_name)').order('fecha', { ascending: false })
    let opCostsQuery = supabase.from('codpi_operational_costs').select('*, codpi_tests_campaigns(test_name)').order('mes', { ascending: false })

    if (viewMode === 'active_test' && testId) {
        adSpendQuery = adSpendQuery.eq('test_id', testId)
        opCostsQuery = opCostsQuery.eq('test_id', testId)
    } else if (viewMode === 'product' && productId) {
        adSpendQuery = adSpendQuery.eq('product_id', productId)
        opCostsQuery = opCostsQuery.eq('product_id', productId)
    } else if (viewMode === 'historical') {
        adSpendQuery = adSpendQuery.not('test_id', 'is', null)
        opCostsQuery = opCostsQuery.not('test_id', 'is', null)
    }

    const [{ data: adSpend }, { data: allOpCosts }] = await Promise.all([
        adSpendQuery.limit(100),
        opCostsQuery.limit(100)
    ])

    const now = new Date()
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(now)
    const firstDayOfMonth = `${todayStr.substring(0, 7)}-01`

    // Today/Month summary stats (Filtered if applicable)
    let todayAdsQuery = supabase.from('codpi_ad_spend_daily').select('monto').eq('fecha', todayStr)
    let mesCostsQuery = supabase.from('codpi_operational_costs').select('monto').gte('mes', firstDayOfMonth)
    let ordersQuery = supabase.from('codpi_orders').select('costo_envio')

    if (viewMode === 'active_test' && testId) {
        todayAdsQuery = todayAdsQuery.eq('test_id', testId)
        mesCostsQuery = mesCostsQuery.eq('test_id', testId)
        ordersQuery = ordersQuery.eq('test_id', testId)
    } else if (viewMode === 'product' && productId) {
        todayAdsQuery = todayAdsQuery.eq('product_id', productId)
        mesCostsQuery = mesCostsQuery.eq('product_id', productId)
        ordersQuery = ordersQuery.eq('product_id', productId)
    }

    const [
        { data: todayAds },
        { data: opCostsMes },
        { data: orders }
    ] = await Promise.all([
        todayAdsQuery,
        mesCostsQuery,
        ordersQuery
    ])

    const totalAdsHoy = todayAds?.reduce((acc: number, a: any) => acc + (a.monto || 0), 0) || 0
    const totalOpCostsMes = opCostsMes?.reduce((acc: number, c: any) => acc + (c.monto || 0), 0) || 0

    let totalEnvio = 0
    if (orders) {
        orders.forEach((o: any) => totalEnvio += (o.costo_envio || 0))
    }
    const costoLogisticoPromedio = orders && orders.length > 0 ? (totalEnvio / orders.length) : 0

    // Unified History
    let unifiedHistory: any[] = []

    if (adSpend) {
        adSpend.forEach((s: any) => unifiedHistory.push({ ...s, type: 'ad_spend', sortDate: s.fecha }))
    }
    if (allOpCosts) {
        allOpCosts.forEach((c: any) => unifiedHistory.push({ ...c, type: 'operational_cost', sortDate: c.mes }))
    }

    unifiedHistory.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

    const selectorTests = allTests?.map((t: any) => ({
        id: t.id,
        test_name: t.test_name,
        product_name: (t.codpi_products as any)?.nombre
    })) || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Costos y Publicidad</h1>
                <Button asChild>
                    <Link href="/costs/new">Registrar Costo</Link>
                </Button>
            </div>

            <DashboardViewSelector 
                products={allProducts || []} 
                activeTests={selectorTests}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gasto Ads (Hoy / Filtro)</CardTitle>
                        <CardDescription>
                            {viewMode === 'global' ? `Consolidado global en ${todayStr}` : 'Gasto acumulado según filtros'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ${Math.round(viewMode === 'global' ? totalAdsHoy : adSpend?.reduce((acc: number, s: any) => acc + (s.monto || 0), 0) || 0).toLocaleString('es-CL')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Costo Logístico Promedio</CardTitle>
                        <CardDescription>Segmentado por el filtro actual ({orders?.length || 0} peds)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${Math.round(costoLogisticoPromedio).toLocaleString('es-CL')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Costos Operativos</CardTitle>
                        <CardDescription>
                            {viewMode === 'active_test' ? 'Filt. (Sin ajustes hist.)' : 'Suma de registros filtrados'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ${Math.round(allOpCosts?.reduce((acc: number, c: any) => {
                                if (viewMode === 'active_test' && ['ajuste_historico', 'perdida_arrastrada', 'cierre_test'].includes(c.tipo || '')) return acc;
                                return acc + (c.monto || 0);
                            }, 0) || 0).toLocaleString('es-CL')}
                        </div>
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
                                <TableHead className="w-[180px]">Campaña / Test</TableHead>
                                <TableHead className="w-[120px]">Plataforma</TableHead>
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
                                                    <span className="text-sm font-semibold text-purple-700">
                                                        {item.codpi_tests_campaigns?.test_name || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">{item.plataforma}</span>
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
                                        const badgeColor = 
                                            item.tipo === 'ajuste_historico' ? 'text-red-600 bg-red-50 border-red-200' :
                                            item.tipo === 'perdida_arrastrada' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                            'text-amber-600 bg-amber-50 border-amber-200';
                                        
                                        return (
                                            <TableRow key={`op-${item.id}`}>
                                                <TableCell className="whitespace-nowrap font-medium text-sm">
                                                    {new Date(item.mes + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                </TableCell>
                                                <TableCell><Badge variant="outline" className={badgeColor}>{item.tipo || 'Fijo Mensual'}</Badge></TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-sm truncate max-w-[150px]">
                                                        {item.concepto}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.codpi_tests_campaigns?.test_name || '-'}
                                                    </span>
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
