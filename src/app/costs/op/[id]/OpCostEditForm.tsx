"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { updateOperationalCost } from '../../actions'

export function OpCostEditForm({ initialData }: { initialData: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // initialData.mes comes as YYYY-MM-DD
    const monthStr = initialData.mes ? initialData.mes.substring(0, 7) : ''

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await updateOperationalCost(initialData.id, formData)

        setLoading(false)
        if (res.success) {
            toast.success('Costo mensual actualizado')
            router.push('/costs')
            router.refresh()
        } else {
            toast.error('Error: ' + res.error)
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Mes Relacionado</Label>
                    <Input name="mes" type="month" defaultValue={monthStr} required />
                </div>
                <div className="grid gap-2">
                    <Label>Concepto</Label>
                    <Input name="concepto" placeholder="Ej: Shopify, Sueldo" defaultValue={initialData.concepto || ''} required />
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Monto ($)</Label>
                <Input name="monto" type="number" step="0.01" defaultValue={initialData.monto} required />
            </div>
            <div className="grid gap-2">
                <Label>Notas adicionales</Label>
                <Input name="notas" defaultValue={initialData.notas || ''} />
            </div>
            <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" asChild><Link href="/costs">Cancelar</Link></Button>
                <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />Actualizar Costo Fijo</Button>
            </div>
        </form>
    )
}
