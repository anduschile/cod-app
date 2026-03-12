import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OpCostEditForm } from './OpCostEditForm'
import { redirect } from 'next/navigation'

export default async function OpCostEditPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()

    const { data: opCost } = await supabase.from('codpi_operational_costs').select('*').eq('id', id).single()

    if (!opCost) {
        redirect('/costs')
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Editar Costo Mensual / Operativo</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Costo</CardTitle>
                    <CardDescription>Ajusta la información para el costo operativo fijo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OpCostEditForm initialData={opCost} />
                </CardContent>
            </Card>
        </div>
    )
}
