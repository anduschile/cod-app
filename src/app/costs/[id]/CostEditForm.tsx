"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { updateAdSpend } from '../actions'

export function CostEditForm({ initialData, products }: { initialData: any, products: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [product, setProduct] = useState(initialData.product_id || 'global_option_999')
    const [platform, setPlatform] = useState(initialData.plataforma || '')

    const dateStr = initialData.fecha ? new Date(initialData.fecha + 'T12:00:00Z').toISOString().split('T')[0] : ''

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.set('product_id', product)
        formData.set('plataforma', platform)

        const res = await updateAdSpend(initialData.id, formData)

        setLoading(false)
        if (res.success) {
            toast.success('Gasto publicitario actualizado')
            router.push('/costs')
            router.refresh()
        } else {
            toast.error('Error: ' + res.error)
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-4">

            {/* CAMPOS MÍNIMOS OBLIGATORIOS */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Obligatorios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Fecha</Label>
                        <Input name="fecha" type="date" defaultValue={dateStr} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Producto Asignado</Label>
                        <Select value={product} onValueChange={setProduct} required>
                            <SelectTrigger><SelectValue placeholder="Global / Marca" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="global_option_999">Ninguno (Global)</SelectItem>
                                {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Plataforma</Label>
                        <Select value={platform} onValueChange={setPlatform} required>
                            <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                                <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                                <SelectItem value="Google Ads">Google Ads</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Inversión (Monto $)</Label>
                        <Input name="monto" type="number" step="0.01" defaultValue={initialData.monto} required />
                    </div>
                </div>
            </div>

            {/* MÉTRICAS OPCIONALES */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Métricas del Embudo (Opcional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label>Campaña</Label>
                        <Input name="campana" type="text" placeholder="Nombre campaña..." defaultValue={initialData.campana || ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Conjunto</Label>
                        <Input name="conjunto" type="text" placeholder="Adset..." defaultValue={initialData.conjunto || ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Anuncio</Label>
                        <Input name="anuncio" type="text" placeholder="Ad name..." defaultValue={initialData.anuncio || ''} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label>Compras</Label>
                        <Input name="compras" type="number" step="1" placeholder="Ej: 5" defaultValue={initialData.compras || ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label>CPA ($)</Label>
                        <Input name="cpa" type="number" step="0.01" defaultValue={initialData.cpa || ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Alcance</Label>
                        <Input name="alcance" type="number" step="1" defaultValue={initialData.alcance || ''} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Observaciones</Label>
                    <Input name="observaciones" placeholder="Ej: Día 1 testeando hook A" defaultValue={initialData.observaciones || ''} />
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" asChild><Link href="/costs">Cancelar</Link></Button>
                <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />Actualizar Registro</Button>
            </div>
        </form>
    )
}
