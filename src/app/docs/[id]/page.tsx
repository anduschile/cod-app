import { createClient } from '@/lib/supabase/server'
import { DocEditForm } from './DocEditForm'

export default async function DocDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: doc, error } = await supabase
        .from('codpi_internal_documents')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !doc) {
        return <div>Documento no encontrado</div>
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full">
            <h1 className="text-3xl font-bold tracking-tight">Editar SOP</h1>
            <DocEditForm doc={doc} />
        </div>
    )
}
