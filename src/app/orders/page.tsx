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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderActions } from './OrderActions'

export default async function OrdersPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | any }) {
    const supabase = await createClient()

    // Support Next.js 15+ searchParams Promise, or Next <15 object gracefully
    const searchParams = props.searchParams ? await props.searchParams : {}
    const search = typeof searchParams.q === 'string' ? searchParams.q : ''
    const status = typeof searchParams.status === 'string' ? searchParams.status : ''
    const fromDate = typeof searchParams.from === 'string' ? searchParams.from : ''
    const toDate = typeof searchParams.to === 'string' ? searchParams.to : ''
    const productId = typeof searchParams.product === 'string' ? searchParams.product : ''

    // Base query
    let query = supabase
        .from('codpi_orders')
        .select(`
          *,
          codpi_products ( nombre )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    if (search) {
        query = query.or(`nombre_cliente.ilike.%${search}%,tracking_number.ilike.%${search}%,comuna.ilike.%${search}%`)
    }
    if (status && status !== 'todos') {
        query = query.eq('estado', status)
    }
    if (fromDate) {
        query = query.gte('fecha_pedido', fromDate)
    }
    if (toDate) {
        query = query.lte('fecha_pedido', toDate)
    }
    if (productId && productId !== 'todos') {
        query = query.eq('product_id', productId)
    }

    const [{ data: orders, error }, { data: products }] = await Promise.all([
        query,
        supabase.from('codpi_products').select('id, nombre').eq('activo', true)
    ])

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
                <h1 className="text-3xl font-bold tracking-tight">Pedidos Manuales</h1>
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

            <form method="GET" className="flex flex-wrap items-center gap-2 mb-2 p-4 border rounded-md bg-muted/20">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input name="q" defaultValue={search} placeholder="Buscar cliente, tracking o comuna..." className="pl-8 bg-background" />
                </div>

                <Select name="product" defaultValue={productId || 'todos'}>
                    <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Producto..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los productos</SelectItem>
                        {products?.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select name="status" defaultValue={status || 'todos'}>
                    <SelectTrigger className="w-[160px] bg-background">
                        <SelectValue placeholder="Estado..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="creado">Creado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                        <SelectItem value="cobrado">Cobrado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
                        <SelectItem value="devuelto">Devuelto</SelectItem>
                        <SelectItem value="no_localizado">No Localizado</SelectItem>
                        <SelectItem value="anulado">Anulado</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                    <Input name="from" type="date" defaultValue={fromDate} className="w-[140px] bg-background" title="Desde" />
                    <span className="text-muted-foreground text-sm">-</span>
                    <Input name="to" type="date" defaultValue={toDate} className="w-[140px] bg-background" title="Hasta" />
                </div>

                <Button type="submit" variant="secondary">Filtrar</Button>
                {(search || (status && status !== 'todos') || (productId && productId !== 'todos') || fromDate || toDate) && (
                    <Button type="button" variant="ghost" asChild>
                        <Link href="/orders">Limpiar</Link>
                    </Button>
                )}
            </form>

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
                                        <OrderActions orderId={o.id} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No hay pedidos que coincidan con la búsqueda. Usa "Nuevo Pedido" para registrar uno.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
