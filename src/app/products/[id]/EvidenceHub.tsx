"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, ExternalLink, Link as LinkIcon, Image as ImageIcon, CheckSquare, Lightbulb } from "lucide-react"

export function EvidenceHub({ productId, evidences }: { productId: string, evidences: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [tipo, setTipo] = useState('link_competencia')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const url = formData.get('url') as string
        const descripcion = formData.get('descripcion') as string

        if (!url && !descripcion) {
            toast.error("Debes ingresar una URL o una descripción")
            setLoading(false)
            return
        }

        const { error } = await supabase.from('codpi_product_evidence').insert({
            product_id: productId,
            tipo,
            url: url || null,
            descripcion: descripcion || null
        })

        setLoading(false)

        if (error) {
            toast.error('Error al guardar evidencia: ' + error.message)
        } else {
            toast.success('Evidencia guardada exitosamente')
            const form = e.target as HTMLFormElement
            form.reset()
            router.refresh()
        }
    }

    const getIcon = (t: string) => {
        switch (t) {
            case 'link_competencia': return <LinkIcon className="h-4 w-4" />
            case 'hook_publicitario': return <ImageIcon className="h-4 w-4" />
            case 'nota': return <CheckSquare className="h-4 w-4" />
            case 'hipotesis': return <Lightbulb className="h-4 w-4" />
            default: return <LinkIcon className="h-4 w-4" />
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <form onSubmit={onSubmit} className="flex flex-col gap-4 border p-4 rounded-md bg-muted/30">
                <h3 className="font-semibold">Añadir Nueva Evidencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Tipo de Evidencia</Label>
                        <Select value={tipo} onValueChange={(val) => setTipo(val || 'link_competencia')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="link_competencia">Link Competencia</SelectItem>
                                <SelectItem value="hook_publicitario">Hook Publicitario</SelectItem>
                                <SelectItem value="nota">Nota o Insight</SelectItem>
                                <SelectItem value="hipotesis">Hipótesis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label>URL (Link, Video, Imagen)</Label>
                        <Input name="url" placeholder="https://..." />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Descripción / Contenido</Label>
                    <Textarea name="descripcion" placeholder="Explica por qué es relevante..." />
                </div>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto self-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar Evidencia'}
                </Button>
            </form>

            <div className="space-y-4">
                <h3 className="font-semibold">Historial de Evidencia</h3>
                {evidences && evidences.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {evidences.map(e => (
                            <div key={e.id} className="border p-4 rounded-md space-y-2 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 font-medium text-sm text-primary">
                                        {getIcon(e.tipo)}
                                        {e.tipo.replace('_', ' ').toUpperCase()}
                                    </div>
                                    <p className="text-sm">{e.descripcion || 'Sin descripción'}</p>
                                </div>
                                {e.url && (
                                    <a href={e.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-2 truncate w-full">
                                        <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                                        {e.url}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No hay registros de evidencia para este producto.</p>
                )}
            </div>
        </div>
    )
}
