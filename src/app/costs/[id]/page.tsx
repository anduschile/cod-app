import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CostEditForm } from './CostEditForm'
import { redirect } from 'next/navigation'

export default async function CostEditPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()

    const [{ data: adSpend }, { data: products }] = await Promise.all([
        supabase.from('codpi_ad_spend_daily').select('*').eq('id', id).single(),
        supabase.from('codpi_products').select('id, nombre').eq('activo', true)
    ])

    if (!adSpend) {
        redirect('/costs')
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Editar Gasto Publicitario</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Gasto</CardTitle>
                    <CardDescription>Ajusta la información para la inversión registrada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CostEditForm initialData={adSpend} products={products || []} />
                </CardContent>
            </Card>
        </div>
    )
}
