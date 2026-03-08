"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"

export function ProductEditForm({ product }: { product: any }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [estado, setEstado] = useState(product.estado)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const microcategoria = formData.get('microcategoria') as string
        const proveedor = formData.get('proveedor') as string
        const sku_proveedor = formData.get('sku_proveedor') as string
        const descripcion_corta = formData.get('descripcion_corta') as string
        const costo_producto = Number(formData.get('costo_producto'))
        const costo_envio_estimado = Number(formData.get('costo_envio_estimado'))
        const costo_recaudo_estimado = Number(formData.get('costo_recaudo_estimado'))
        const precio_venta_sugerido = Number(formData.get('precio_venta_sugerido'))

        if (!microcategoria || !proveedor || isNaN(costo_producto) || isNaN(precio_venta_sugerido)) {
            toast.error("Por favor completa Microcategoría, Proveedor, Costo y Precio.")
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from('codpi_products')
            .update({
                estado,
                microcategoria,
                proveedor,
                sku_proveedor: sku_proveedor || null,
                descripcion_corta: descripcion_corta || null,
                costo_producto,
                costo_envio_estimado,
                costo_recaudo_estimado,
                precio_venta_sugerido
            })
            .eq('id', product.id)

        setLoading(false)

        if (error) {
            toast.error('Error al actualizar: ' + error.message)
        } else {
            toast.success('Producto actualizado exitosamente')
            router.refresh()
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={estado} onValueChange={(val) => setEstado(val || '')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="evaluando">Evaluando</SelectItem>
                            <SelectItem value="listo_para_test">Listo para Test</SelectItem>
                            <SelectItem value="testeando">Testeando</SelectItem>
                            <SelectItem value="ganador">Ganador</SelectItem>
                            <SelectItem value="descartado">Descartado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="microcategoria">Microcategoría *</Label>
                    <Input id="microcategoria" name="microcategoria" defaultValue={product.microcategoria || ''} required />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="proveedor">Proveedor *</Label>
                    <Input id="proveedor" name="proveedor" defaultValue={product.proveedor || ''} required />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="sku_proveedor">SKU Proveedor</Label>
                    <Input id="sku_proveedor" name="sku_proveedor" defaultValue={product.sku_proveedor || ''} />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="descripcion_corta">Descripción Corta</Label>
                <Input id="descripcion_corta" name="descripcion_corta" defaultValue={product.descripcion_corta || ''} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="costo_producto">Costo Prod. ({product.moneda}) *</Label>
                    <Input id="costo_producto" name="costo_producto" type="number" step="0.01" defaultValue={product.costo_producto} required />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="costo_envio_estimado">Envío Est. ({product.moneda})</Label>
                    <Input id="costo_envio_estimado" name="costo_envio_estimado" type="number" step="0.01" defaultValue={product.costo_envio_estimado || 0} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="costo_recaudo_estimado">Recaudo Est. ({product.moneda})</Label>
                    <Input id="costo_recaudo_estimado" name="costo_recaudo_estimado" type="number" step="0.01" defaultValue={product.costo_recaudo_estimado || 0} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="precio_venta_sugerido">Precio Sug. ({product.moneda}) *</Label>
                    <Input id="precio_venta_sugerido" name="precio_venta_sugerido" type="number" step="0.01" defaultValue={product.precio_venta_sugerido} required />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Margen Bruto Teórico ({product.moneda})</span>
                    <span className="text-lg font-medium text-green-600">
                        ${product.precio_venta_sugerido - product.costo_producto}
                    </span>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    )
}
