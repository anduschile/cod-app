import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function ProductsPage() {
    const supabase = await createClient()
    const { data: products, error } = await supabase
        .from('codpi_products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'idea': return 'bg-gray-500'
            case 'evaluando': return 'bg-blue-500'
            case 'listo_para_test': return 'bg-yellow-500'
            case 'testeando': return 'bg-purple-500'
            case 'ganador': return 'bg-green-500'
            case 'descartado': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Product Lab</h1>
                <Button asChild>
                    <Link href="/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Costo Est.</TableHead>
                            <TableHead className="text-right">Precio Sugerido</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.length > 0 ? (
                            products.map((p: any) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/products/${p.id}`} className="hover:underline">
                                            {p.nombre}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{p.categoria || '-'}</TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusColor(p.estado)} hover:${getStatusColor(p.estado)}`}>
                                            {p.estado.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${p.costo_producto} {p.moneda}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${p.precio_venta_sugerido} {p.moneda}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/products/${p.id}`}>Evaluar</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay productos registrados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
