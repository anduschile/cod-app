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

export function NewDocForm() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            titulo: formData.get('titulo'),
            categoria: formData.get('categoria'),
            contenido: formData.get('contenido'),
            estado: true
        }

        const { error } = await supabase.from('codpi_internal_documents').insert(data)
        setLoading(false)

        if (error) {
            toast.error('Error al crear documento: ' + error.message)
        } else {
            toast.success('Documento guardado')
            router.push('/docs')
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
                            <Input name="titulo" required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Categoría</Label>
                            <Input name="categoria" placeholder="Ej: SOP, Checklist, Guía" />
                        </div>
                    </div>

                    <div className="grid gap-2 h-[300px]">
                        <Label>Contenido *</Label>
                        <Textarea name="contenido" className="resize-none h-full" required />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/docs"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Guardando...' : 'Guardar Documento'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
