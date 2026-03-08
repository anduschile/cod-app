import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DocsPage() {
    const supabase = await createClient()

    const { data: documents, error } = await supabase
        .from('codpi_internal_documents')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SOP Playbook</h1>
                    <p className="text-muted-foreground">Guías internas, checklists y procedimientos operativos.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Documento
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents && documents.length > 0 ? (
                    documents.map((doc: any) => (
                        <Card key={doc.id} className="hover:border-primary/50 cursor-pointer transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <FileText className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle className="text-base">{doc.titulo}</CardTitle>
                                    <CardDescription>{doc.categoria || 'Sin categoría'}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {doc.contenido || 'No hay contenido para mostrar en el resumen.'}
                                </p>
                                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                                    Actualizado: {new Date(doc.updated_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <FileText className="mx-auto h-12 w-12 opacity-20 mb-4" />
                        <p>No hay documentos SOP registrados.</p>
                        <p className="text-sm">Inicia creando checklists de evaluación o guías de Facebook Ads.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
