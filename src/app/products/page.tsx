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
import { calculateProductScore } from '@/lib/utils/score-helper'

export default async function ProductsPage() {
    const supabase = await createClient()
    const [{ data: products, error }, { data: allCriteria }, { data: allScores }] = await Promise.all([
        supabase.from('codpi_products').select('*').order('created_at', { ascending: false }),
        supabase.from('codpi_evaluation_criteria').select('*').eq('activo', true),
        supabase.from('codpi_product_scores').select('*')
    ])

    if (error) {
        console.error('Error fetching products:', error)
    }

    const productsWithScores = products?.map(p => {
        const productScores = allScores?.filter(s => s.product_id === p.id) || []
        const evalResult = calculateProductScore(productScores, allCriteria || [])
        return { ...p, evalResult }
    }).sort((a, b) => {
        if (a.evalResult.hasScores && !b.evalResult.hasScores) return -1
        if (!a.evalResult.hasScores && b.evalResult.hasScores) return 1
        return b.evalResult.porcentaje - a.evalResult.porcentaje
    })

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
                <h1 className="text-3xl font-bold tracking-tight">Laboratorio de Productos</h1>
                <Button asChild>
                    <Link href="/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="p-3 bg-muted/30 border-b text-xs text-muted-foreground flex items-center gap-4 overflow-x-auto">
                    <span className="font-semibold">Leyenda de Evaluación:</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Probar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Observar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Descartar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Sin evaluar</span>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Puntaje</TableHead>
                            <TableHead>Recomendación</TableHead>
                            <TableHead className="text-right">Costo Est.</TableHead>
                            <TableHead className="text-right">Precio Sug.</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productsWithScores && productsWithScores.length > 0 ? (
                            productsWithScores.map((p: any) => (
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
                                    <TableCell className="text-right font-mono text-sm">
                                        {p.evalResult.hasScores ? `${p.evalResult.porcentaje.toFixed(0)}%` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={p.evalResult.badgeVariant as any} className={p.evalResult.colorRecomendacion}>
                                            {p.evalResult.recomendacion}
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
                                <TableCell colSpan={8} className="h-24 text-center">
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
