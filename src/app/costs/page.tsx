import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CostsPage() {
    const supabase = await createClient()

    // Ejemplo de fetch de gasto diario en general
    const { data: adSpend } = await supabase
        .from('codpi_ad_spend_daily')
        .select('*, codpi_products(nombre)')
        .order('fecha', { ascending: false })
        .limit(30)

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]

    const [
        { data: todayAds },
        { data: opCosts },
        { data: orders }
    ] = await Promise.all([
        supabase.from('codpi_ad_spend_daily').select('monto').eq('fecha', todayStr),
        supabase.from('codpi_operational_costs').select('monto').gte('mes', firstDayOfMonth),
        supabase.from('codpi_orders').select('costo_envio')
    ])

    const totalAdsHoy = todayAds?.reduce((acc, a) => acc + (a.monto || 0), 0) || 0
    const totalOpCostsMes = opCosts?.reduce((acc, c) => acc + (c.monto || 0), 0) || 0

    let totalEnvio = 0
    if (orders) {
        orders.forEach(o => totalEnvio += (o.costo_envio || 0))
    }
    const costoLogisticoPromedio = orders && orders.length > 0 ? (totalEnvio / orders.length) : 0

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
                    <h3 className="font-semibold text-lg">Registro Diario de Ads</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Producto Asignado</TableHead>
                            <TableHead>Plataforma</TableHead>
                            <TableHead className="text-right">Inversión (Monto)</TableHead>
                            <TableHead className="text-right">CPA Promedio</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {adSpend && adSpend.length > 0 ? (
                            adSpend.map((s: any) => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.fecha}</TableCell>
                                    <TableCell>{s.codpi_products?.nombre || <Badge variant="outline">Global</Badge>}</TableCell>
                                    <TableCell>{s.plataforma}</TableCell>
                                    <TableCell className="text-right">${s.monto}</TableCell>
                                    <TableCell className="text-right">{s.cpa_plataforma ? `$${s.cpa_plataforma}` : '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No hay registros de gasto diario. Carga un CSV.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
