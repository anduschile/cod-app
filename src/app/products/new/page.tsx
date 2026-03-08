"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [categoria, setCategoria] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const nombre = formData.get('nombre') as string
        const cat = categoria
        const microcategoria = formData.get('microcategoria') as string
        const proveedor = formData.get('proveedor') as string
        const sku_proveedor = formData.get('sku_proveedor') as string
        const descripcion_corta = formData.get('descripcion_corta') as string
        const precio = Number(formData.get('precio_venta_sugerido'))
        const costo = Number(formData.get('costo_producto'))
        const costo_envio_estimado = Number(formData.get('costo_envio_estimado')) || 0
        const costo_recaudo_estimado = Number(formData.get('costo_recaudo_estimado')) || 0

        if (!nombre || !cat || !microcategoria || !proveedor || isNaN(precio) || isNaN(costo)) {
            toast.error("Por favor completa los campos obligatorios: Nombre, Categoría, Microcategoría, Proveedor, Costo y Precio.")
            setLoading(false)
            return
        }

        const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        const { error } = await supabase.from('codpi_products').insert({
            nombre,
            slug,
            categoria: cat,
            microcategoria,
            proveedor,
            sku_proveedor: sku_proveedor || null,
            descripcion_corta: descripcion_corta || null,
            precio_venta_sugerido: precio,
            costo_producto: costo,
            costo_envio_estimado,
            costo_recaudo_estimado,
            estado: 'idea'
        })

        setLoading(false)

        if (error) {
            toast.error('Error al crear producto: ' + error.message)
        } else {
            toast.success('Producto creado exitosamente')
            router.push('/products')
            router.refresh()
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/products"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre del Producto *</Label>
                                <Input id="nombre" name="nombre" required placeholder="Ej: Smartwatch XY" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripcion_corta">Descripción Corta</Label>
                                <Input id="descripcion_corta" name="descripcion_corta" placeholder="Breve descripción..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="categoria">Categoría *</Label>
                                <Select value={categoria} onValueChange={(val) => setCategoria(val || '')} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tecnologia">Tecnología</SelectItem>
                                        <SelectItem value="hogar">Hogar</SelectItem>
                                        <SelectItem value="belleza">Belleza y Salud</SelectItem>
                                        <SelectItem value="mascotas">Mascotas</SelectItem>
                                        <SelectItem value="indumentaria">Indumentaria</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="microcategoria">Microcategoría *</Label>
                                <Input id="microcategoria" name="microcategoria" required placeholder="Ej: Relojes Inteligentes" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="proveedor">Proveedor *</Label>
                                <Input id="proveedor" name="proveedor" required placeholder="Nombre del proveedor o fábrica" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sku_proveedor">SKU Proveedor (Opcional)</Label>
                                <Input id="sku_proveedor" name="sku_proveedor" placeholder="Código de fábrica" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="costo_producto">Costo Prod. ($) *</Label>
                                <Input id="costo_producto" name="costo_producto" type="number" step="0.01" defaultValue="0" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="costo_envio_estimado">Envío Est. ($)</Label>
                                <Input id="costo_envio_estimado" name="costo_envio_estimado" type="number" step="0.01" defaultValue="0" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="costo_recaudo_estimado">Recaudo Est. ($)</Label>
                                <Input id="costo_recaudo_estimado" name="costo_recaudo_estimado" type="number" step="0.01" defaultValue="0" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="precio_venta_sugerido">Precio Sug. ($) *</Label>
                                <Input id="precio_venta_sugerido" name="precio_venta_sugerido" type="number" step="0.01" defaultValue="0" required />
                            </div>
                        </div>

                        <Button type="submit" className="mt-4 w-full md:w-auto self-start" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
