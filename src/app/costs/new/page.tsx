import { createClient } from '@/lib/supabase/server'
import { CostForms } from './CostForms'

export default async function NewCostPage() {
    const supabase = await createClient()
    const [{ data: products }, { data: tests }] = await Promise.all([
        supabase.from('codpi_products').select('id, nombre').order('nombre'),
        supabase.from('codpi_tests_campaigns').select('id, test_name, status, product_id').order('created_at', { ascending: false })
    ])

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Costo</h1>
            <CostForms products={products || []} tests={tests || []} />
        </div>
    )
}
