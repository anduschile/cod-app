import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function CostsPage() {
    const supabase = await createClient()

    // Ejemplo de fetch de gasto diario en general
    const { data: adSpend } = await supabase
        .from('codpi_ad_spend_daily')
        .select('*, codpi_products(nombre)')
        .order('fecha', { ascending: false })
        .limit(30)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Costos y Ad Spend</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gasto Ads (Hoy)</CardTitle>
                        <CardDescription>Consolidado Facebook y TikTok</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Costo Logístico Estimado</CardTitle>
                        <CardDescription>Promedio envíos mes actual</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">No data</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Costos Operativos Fijos</CardTitle>
                        <CardDescription>Sueldos, software, Shopify</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">$0</div>
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
