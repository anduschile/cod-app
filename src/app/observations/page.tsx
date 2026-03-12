import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LogActions } from './LogActions'
import { LogForm } from './LogForm'

export default async function ObservationsPage() {
    const supabase = await createClient()

    const [{ data: logs }, { data: products }] = await Promise.all([
        supabase.from('codpi_campaign_logs').select('*, codpi_products(nombre)').order('fecha', { ascending: false }).limit(100),
        supabase.from('codpi_products').select('id, nombre').eq('activo', true)
    ])

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Bitácora Mkt & Operaciones</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nueva Observación</CardTitle>
                            <CardDescription>Registra cambios en campañas, testeos o eventos importantes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LogForm products={products || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Bitácora</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="min-w-[800px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Fecha</TableHead>
                                            <TableHead className="w-[150px]">Contexto</TableHead>
                                            <TableHead className="min-w-[200px]">Cambio y Motivo</TableHead>
                                            <TableHead>Hipótesis / Resultado Esperado</TableHead>
                                            <TableHead className="w-[70px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs && logs.length > 0 ? (
                                            logs.map((log: any) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="align-top whitespace-nowrap text-sm font-medium">
                                                        {new Date(log.fecha + 'T12:00:00Z').toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-sm">
                                                                {log.codpi_products?.nombre || <Badge variant="outline" className="text-xs">Global</Badge>}
                                                            </span>
                                                            {(log.campana || log.anuncio) && (
                                                                <span className="text-xs text-muted-foreground truncate w-[140px]" title={`${log.campana} - ${log.anuncio}`}>
                                                                    {log.campana} {log.anuncio && `> ${log.anuncio}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium text-blue-900 bg-blue-50 px-2 py-1 rounded-md w-fit">
                                                                {log.cambio_realizado}
                                                            </span>
                                                            {log.motivo && <span className="text-xs text-muted-foreground mt-1">{log.motivo}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top text-xs text-muted-foreground">
                                                        <div className="flex flex-col gap-1">
                                                            {log.hipotesis && <p><strong>H:</strong> {log.hipotesis}</p>}
                                                            {log.resultado_esperado && <p><strong>E:</strong> {log.resultado_esperado}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top text-right">
                                                        <LogActions id={log.id} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No hay observaciones registradas. Utiliza el formulario para añadir una.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
