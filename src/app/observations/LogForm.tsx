'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createObservation } from './actions'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export function LogForm({ products }: { products: any[] }) {
    const [loading, setLoading] = useState(false)
    const [productId, setProductId] = useState<string>('global')
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        if (productId !== 'global') {
            formData.set('product_id', productId)
        } else {
            formData.delete('product_id')
        }

        const res = await createObservation(formData)

        setLoading(false)
        if (res.success) {
            toast.success('Bitácora guardada')
            // Reset form
            const form = e.target as HTMLFormElement
            form.reset()
            setProductId('global')
        } else {
            toast.error('Error: ' + res.error)
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input id="fecha" name="fecha" type="date" defaultValue={todayStr} required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="product_id">Contexto (Producto) *</Label>
                <Select value={productId} onValueChange={(val) => setProductId(val || 'global')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="global">Ninguno (A nivel Cuenta/Global)</SelectItem>
                        {products && products.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="campana">Campaña (Ops)</Label>
                    <Input id="campana" name="campana" placeholder="Ej: ABO Test V1" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="anuncio">Conjunto / Anuncio (Ops)</Label>
                    <Input id="anuncio" name="anuncio" placeholder="Ej: Video UGC 2" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="cambio_realizado">Cambio Realizado *</Label>
                <Input id="cambio_realizado" name="cambio_realizado" placeholder="Ej: Apagué Ad 3, subí budget a V2" required />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="motivo">Motivo (Ops)</Label>
                <Textarea id="motivo" name="motivo" placeholder="Ej: El Ad 3 tenía un CTR muy bajo de 0.4%" rows={2} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="hipotesis">Hipótesis de Trabajo (Ops)</Label>
                <Textarea id="hipotesis" name="hipotesis" placeholder="¿Qué crees que pasará?" rows={2} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="resultado_esperado">Resultado Esperado (Ops)</Label>
                <Input id="resultado_esperado" name="resultado_esperado" placeholder="Ej: Bajar CPA a $3.000" />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Guardando...' : 'Registrar Observación'}
            </Button>
        </form>
    )
}
