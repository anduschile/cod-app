"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export function NewOrderForm({ products, carriers }: { products: any[], carriers: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState('')
    const [selectedCarrier, setSelectedCarrier] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const orderData = {
            product_id: selectedProduct || null,
            nombre_cliente: formData.get('nombre_cliente'),
            telefono: formData.get('telefono'),
            comuna: formData.get('comuna'),
            region: formData.get('region'),
            direccion: formData.get('direccion'),
            cantidad: Number(formData.get('cantidad')),
            precio_venta_unidad: Number(formData.get('precio_venta_unidad')),
            carrier: selectedCarrier === 'unassigned' ? null : (selectedCarrier || null),
            estado: 'creado',
            observaciones: formData.get('observaciones')
        }

        const { error } = await supabase.from('codpi_orders').insert(orderData)

        setLoading(false)

        if (error) {
            toast.error('Error al registrar pedido: ' + error.message)
        } else {
            toast.success('Pedido creado exitosamente')
            router.push('/orders')
            router.refresh()
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label>Producto</Label>
                        <Select value={selectedProduct} onValueChange={(val) => setSelectedProduct(val || '')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el producto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nombre} (${p.precio_venta_sugerido})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre_cliente">Nombre Cliente *</Label>
                            <Input id="nombre_cliente" name="nombre_cliente" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" name="telefono" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="direccion">Dirección *</Label>
                            <Input id="direccion" name="direccion" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="comuna">Comuna</Label>
                            <Input id="comuna" name="comuna" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input id="cantidad" name="cantidad" type="number" defaultValue="1" min="1" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="precio_venta_unidad">Precio por Unidad ($)</Label>
                            <Input id="precio_venta_unidad" name="precio_venta_unidad" type="number" step="0.01" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Transportadora</Label>
                            <Select
                                value={selectedCarrier || 'unassigned'}
                                onValueChange={(val) => setSelectedCarrier(!val || val === 'unassigned' ? '' : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin asignar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                                    {carriers.map(c => (
                                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea id="observaciones" name="observaciones" placeholder="Ej: Entregar en conserjería..." />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Guardando...' : 'Guardar Pedido'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
