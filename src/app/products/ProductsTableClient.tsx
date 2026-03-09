'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Archive, Trash2, Edit, ArchiveRestore } from 'lucide-react'
import { archiveProduct, unarchiveProduct, deleteProductSafe } from './actions'

type ProductWithEvals = {
    id: string;
    nombre: string;
    categoria: string;
    estado: string;
    costo_producto: number;
    precio_venta_sugerido: number;
    moneda: string;
    is_archived: boolean;
    evalResult: {
        hasScores: boolean;
        porcentaje: number;
        recomendacion: string;
        colorRecomendacion: string;
        badgeVariant?: string;
    };
    valResult: {
        hasValidation: boolean;
        score: number | null;
        recommendation: string;
        isNegativeExperienceWarning: boolean;
        risk: string;
        rotation: string;
        prior_experience: string;
    };
}

export function ProductsTableClient({ initialProducts }: { initialProducts: ProductWithEvals[] }) {
    const [search, setSearch] = useState('')
    const [showArchived, setShowArchived] = useState(false)
    const [filterValRec, setFilterValRec] = useState<string>('ALL')

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

    const getValRecColor = (rec: string) => {
        switch (rec) {
            case 'PROBAR': return 'bg-green-100 text-green-800 hover:bg-green-100'
            case 'OBSERVAR': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            case 'DESCARTAR': return 'bg-red-100 text-red-800 hover:bg-red-100'
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        }
    }

    const filteredProducts = initialProducts.filter(p => {
        // Filter by archived status
        if (!showArchived && p.is_archived) return false
        if (showArchived && !p.is_archived) return false

        // Filter by validation recommendation
        if (filterValRec !== 'ALL' && p.valResult.recommendation !== filterValRec) return false

        // Text search
        if (search) {
            const term = search.toLowerCase()
            return p.nombre.toLowerCase().includes(term) || (p.categoria && p.categoria.toLowerCase().includes(term))
        }

        return true
    })

    const handleArchive = async (id: string, isArchived: boolean) => {
        const result = isArchived ? await unarchiveProduct(id) : await archiveProduct(id)
        if (!result.success) {
            alert(result.error)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) {
            const result = await deleteProductSafe(id)
            if (!result.success) {
                alert(result.error)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 p-4 rounded-md border">
                <div className="flex flex-1 items-center gap-2 w-full max-w-sm">
                    <Input
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    <Button
                        variant={filterValRec === 'ALL' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValRec('ALL')}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filterValRec === 'PROBAR' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValRec('PROBAR')}
                    >
                        Probar
                    </Button>
                    <Button
                        variant={filterValRec === 'OBSERVAR' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValRec('OBSERVAR')}
                    >
                        Observar
                    </Button>
                    <Button
                        variant={filterValRec === 'DESCARTAR' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterValRec('DESCARTAR')}
                    >
                        Descartar
                    </Button>
                    <div className="h-6 w-px bg-border mx-1"></div>
                    <Button
                        variant={showArchived ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowArchived(!showArchived)}
                    >
                        {showArchived ? 'Viendo Archivados' : 'Mostrar Archivados'}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <div className="p-3 bg-muted/30 border-b text-xs text-muted-foreground flex flex-wrap items-center gap-4">
                    <span className="font-semibold">Leyenda de Scorecard:</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Probar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Observar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Descartar</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Sin evaluar</span>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-center">Matriz (Scorecard)</TableHead>
                            <TableHead className="text-center">Validación Comercial</TableHead>
                            <TableHead>Info Extra</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                                <TableRow key={p.id} className={p.is_archived ? "opacity-60" : ""}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col gap-1">
                                            <Link href={`/products/${p.id}`} className="hover:underline font-semibold flex items-center gap-2">
                                                {p.nombre}
                                                {p.is_archived && <Badge variant="outline" className="text-[10px] h-4 px-1">Archivado</Badge>}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">{p.categoria || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusColor(p.estado)} hover:${getStatusColor(p.estado)} whitespace-nowrap`}>
                                            {p.estado.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-mono font-semibold">
                                                {p.evalResult.hasScores ? `${p.evalResult.porcentaje.toFixed(0)}%` : '-'}
                                            </span>
                                            <Badge variant={p.evalResult.badgeVariant as any} className={`${p.evalResult.colorRecomendacion} text-[10px] h-4 px-1`}>
                                                {p.evalResult.recomendacion}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-mono font-semibold">
                                                {p.valResult.hasValidation && p.valResult.score !== null ? `${p.valResult.score.toFixed(0)}%` : '-'}
                                            </span>
                                            <Badge variant="outline" className={`${getValRecColor(p.valResult.recommendation)} border-transparent text-[10px] h-4 px-1`}>
                                                {p.valResult.recommendation}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="text-muted-foreground">Riesgo:</span>
                                                <span className={p.valResult.risk === 'Alto' ? 'text-red-500 font-medium' : p.valResult.risk === 'Bajo' ? 'text-green-500 font-medium' : ''}>
                                                    {p.valResult.risk}
                                                </span>
                                            </div>
                                            {(p.valResult.prior_experience && p.valResult.prior_experience !== 'untested' && p.valResult.hasValidation) && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-muted-foreground">Exp:</span>
                                                    <span className={p.valResult.prior_experience === 'negative' ? 'text-red-500 font-medium' : p.valResult.prior_experience === 'positive' ? 'text-green-500 font-medium' : ''}>
                                                        {p.valResult.prior_experience === 'positive' ? 'Positiva' : p.valResult.prior_experience === 'negative' ? 'Negativa' : 'Neutral'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="p-0">
                                                    <Link href={`/products/${p.id}`} className="cursor-pointer flex flex-1 items-center px-2 py-1.5 w-full">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Editar</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleArchive(p.id, p.is_archived)}
                                                    className="cursor-pointer flex items-center"
                                                >
                                                    {p.is_archived ? (
                                                        <>
                                                            <ArchiveRestore className="mr-2 h-4 w-4" />
                                                            <span>Desarchivar</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            <span>Archivar</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(p.id, p.nombre)}
                                                    className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No se encontraron productos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
