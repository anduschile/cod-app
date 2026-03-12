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

    const [costs, setCosts] = useState({
        costo_producto: product.costo_producto || 0,
        costo_envio_estimado: product.costo_envio_estimado || 0,
        costo_recaudo_estimado: product.costo_recaudo_estimado || 0,
        precio_venta_sugerido: product.precio_venta_sugerido || 0,
        costo_embalaje: product.costo_embalaje || 0,
        comision_pasarela: product.comision_pasarela || 0
    })

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCosts(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }))
    }

    const margen_bruto_unitario = costs.precio_venta_sugerido - costs.costo_producto - costs.costo_envio_estimado - costs.costo_recaudo_estimado - costs.costo_embalaje - costs.comision_pasarela
    const cpa_maximo_aceptable = margen_bruto_unitario

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const microcategoria = formData.get('microcategoria') as string
        const proveedor = formData.get('proveedor') as string
        const sku_proveedor = formData.get('sku_proveedor') as string
        const descripcion_corta = formData.get('descripcion_corta') as string

        if (!microcategoria || !proveedor || isNaN(costs.costo_producto) || isNaN(costs.precio_venta_sugerido)) {
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
                costo_producto: costs.costo_producto,
                costo_envio_estimado: costs.costo_envio_estimado,
                costo_recaudo_estimado: costs.costo_recaudo_estimado,
                precio_venta_sugerido: costs.precio_venta_sugerido,
                costo_embalaje: costs.costo_embalaje,
                comision_pasarela: costs.comision_pasarela,
                margen_bruto_unitario,
                cpa_maximo_aceptable
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

            <div className="bg-muted/10 p-4 rounded-md border text-sm">
                <h3 className="font-semibold text-lg mb-4">Economía Unitarias (Unit Economics)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-6 border-b">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="precio_venta_sugerido">Precio Venta Sugerido *</Label>
                        <Input id="precio_venta_sugerido" name="precio_venta_sugerido" type="number" step="0.01" value={costs.precio_venta_sugerido} onChange={handleCostChange} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="costo_producto">Costo Proveedor Base *</Label>
                        <Input id="costo_producto" name="costo_producto" type="number" step="0.01" value={costs.costo_producto} onChange={handleCostChange} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="costo_envio_estimado">Costo Envío Promedio</Label>
                        <Input id="costo_envio_estimado" name="costo_envio_estimado" type="number" step="0.01" value={costs.costo_envio_estimado} onChange={handleCostChange} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="costo_recaudo_estimado">Costo COD (Recaudo)</Label>
                        <Input id="costo_recaudo_estimado" name="costo_recaudo_estimado" type="number" step="0.01" value={costs.costo_recaudo_estimado} onChange={handleCostChange} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="costo_embalaje">Costo Embalaje Base</Label>
                        <Input id="costo_embalaje" name="costo_embalaje" type="number" step="0.01" value={costs.costo_embalaje} onChange={handleCostChange} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="comision_pasarela">Comisión Pasarela / Misc</Label>
                        <Input id="comision_pasarela" name="comision_pasarela" type="number" step="0.01" value={costs.comision_pasarela} onChange={handleCostChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-card p-4 rounded shadow-sm border flex justify-between items-center">
                        <span className="font-medium">Margen Bruto Unitario</span>
                        <span className="text-xl font-bold text-green-600">${Math.round(margen_bruto_unitario).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="bg-card p-4 rounded shadow-sm border flex justify-between items-center">
                        <span className="font-medium text-muted-foreground">CPA Máximo Aceptable</span>
                        <span className="text-xl font-bold text-blue-600">${Math.round(cpa_maximo_aceptable).toLocaleString('es-CL')}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    )
}
