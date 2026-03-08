import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Upload, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function OrdersPage() {
    const supabase = await createClient()

    // Traer pedidos ordenados por los más recientes
    const { data: orders, error } = await supabase
        .from('codpi_orders')
        .select(`
      *,
      codpi_products ( nombre )
    `)
        .order('created_at', { ascending: false })
        .limit(50)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'creado': return 'bg-gray-300 text-black'
            case 'confirmado': return 'bg-blue-500'
            case 'enviado': return 'bg-purple-500'
            case 'entregado': return 'bg-indigo-500'
            case 'cobrado': return 'bg-green-600'
            case 'rechazado': return 'bg-red-600'
            case 'devuelto': return 'bg-orange-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders Manual Hub</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/orders/import">
                            <Upload className="mr-2 h-4 w-4" />
                            Importar CSV
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/orders/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Pedido
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por cliente, tracking o ID..." className="pl-8" />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cliente / Zona</TableHead>
                            <TableHead>Estado COD</TableHead>
                            <TableHead>Tracking</TableHead>
                            <TableHead className="text-right">Total Venta</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map((o: any) => (
                                <TableRow key={o.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {new Date(o.fecha_pedido).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{o.codpi_products?.nombre || 'Producto no asignado'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{o.nombre_cliente}</span>
                                            <span className="text-xs text-muted-foreground">{o.comuna}, {o.region}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusColor(o.estado)} hover:${getStatusColor(o.estado)}`}>
                                            {o.estado.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm">{o.tracking_number || '-'}</span>
                                            <span className="text-xs text-muted-foreground">{o.carrier}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${o.precio_venta_unidad * o.cantidad}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No hay pedidos registrados. Usa el botón "Nuevo Pedido" o "Importar CSV" para comenzar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
