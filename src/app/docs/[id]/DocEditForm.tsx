"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export function DocEditForm({ doc }: { doc: any }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const updateData = {
            titulo: formData.get('titulo'),
            categoria: formData.get('categoria'),
            contenido: formData.get('contenido')
        }

        const { error } = await supabase.from('codpi_internal_documents').update(updateData).eq('id', doc.id)
        setLoading(false)

        if (error) {
            toast.error('Error al actualizar: ' + error.message)
        } else {
            toast.success('Cambios guardados')
            router.refresh()
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Título del Documento *</Label>
                            <Input name="titulo" defaultValue={doc.titulo} required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Categoría</Label>
                            <Input name="categoria" defaultValue={doc.categoria} placeholder="Ej: SOP, Checklist, Guía" />
                        </div>
                    </div>

                    <div className="grid gap-2 h-[400px]">
                        <Label>Contenido *</Label>
                        <Textarea name="contenido" defaultValue={doc.contenido} className="resize-none h-full" required />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/docs"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
