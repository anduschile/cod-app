import { createClient } from '@/lib/supabase/server'
import { OrderEditForm } from './OrderEditForm'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const [{ data: order, error }, { data: carriers }] = await Promise.all([
        supabase
            .from('codpi_orders')
            .select('*, codpi_products(nombre)')
            .eq('id', id)
            .single(),
        supabase
            .from('codpi_shipping_carriers')
            .select('code, name')
            .eq('is_active', true)
            .order('priority_order', { ascending: true })
    ])

    if (error || !order) {
        return <div>Pedido no encontrado</div>
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Detalle del Pedido</h1>
            <OrderEditForm order={order} carriers={carriers || []} />
        </div>
    )
}
