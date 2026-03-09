'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function archiveProduct(productId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('codpi_products')
        .update({ is_archived: true })
        .eq('id', productId)

    if (error) {
        console.error('Error archiving product:', error)
        return { success: false, error: 'No se pudo archivar el producto.' }
    }

    revalidatePath('/products')
    return { success: true }
}

export async function unarchiveProduct(productId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('codpi_products')
        .update({ is_archived: false })
        .eq('id', productId)

    if (error) {
        console.error('Error unarchiving product:', error)
        return { success: false, error: 'No se pudo desarchivar el producto.' }
    }

    revalidatePath('/products')
    return { success: true }
}

export async function deleteProductSafe(productId: string) {
    const supabase = await createClient()

    // 1. Check for orders
    const { count: ordersCount, error: ordersError } = await supabase
        .from('codpi_orders')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

    if (ordersError) {
        return { success: false, error: 'Error al verificar dependencias (órdenes).' }
    }

    if (ordersCount && ordersCount > 0) {
        return { success: false, error: `No se puede eliminar: el producto tiene ${ordersCount} orden(es) asociada(s). Archívalo en su lugar.` }
    }

    // 2. Check for ad spend
    const { count: adsCount, error: adsError } = await supabase
        .from('codpi_ad_spend_daily')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

    if (adsError) {
        return { success: false, error: 'Error al verificar dependencias (gastos de ads).' }
    }

    if (adsCount && adsCount > 0) {
        return { success: false, error: `No se puede eliminar: el producto tiene ${adsCount} registro(s) de gasto publicitario. Archívalo en su lugar.` }
    }

    // 3. Safe to delete
    const { error: deleteError } = await supabase
        .from('codpi_products')
        .delete()
        .eq('id', productId)

    if (deleteError) {
        console.error('Error deleting product:', deleteError)
        return { success: false, error: 'No se pudo eliminar el producto. ' + deleteError.message }
    }

    revalidatePath('/products')
    return { success: true }
}
