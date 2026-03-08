import { createClient } from '@/lib/supabase/server'
import { NewOrderForm } from './NewOrderForm'

export default async function NewOrderPage() {
    const supabase = await createClient()
    const [{ data: products }, { data: carriers }] = await Promise.all([
        supabase.from('codpi_products').select('id, nombre, precio_venta_sugerido').order('nombre'),
        supabase.from('codpi_shipping_carriers').select('code, name').eq('is_active', true).order('priority_order', { ascending: true })
    ])

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Pedido Manual</h1>
            <NewOrderForm products={products || []} carriers={carriers || []} />
        </div>
    )
}
