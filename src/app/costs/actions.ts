'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAdSpend(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('codpi_ad_spend_daily').delete().eq('id', id)
    if (error) {
        return { success: false, error: error.message }
    }
    revalidatePath('/costs')
    return { success: true }
}

export async function updateAdSpend(id: string, formData: FormData) {
    const supabase = await createClient()
    const product = formData.get('product_id') as string

    const data = {
        fecha: formData.get('fecha'),
        product_id: product === 'global_option_999' || !product ? null : product,
        plataforma: formData.get('plataforma'),
        monto: Number(formData.get('monto')),
        campana: formData.get('campana') || null,
        conjunto: formData.get('conjunto') || null,
        anuncio: formData.get('anuncio') || null,
        compras: formData.get('compras') ? Number(formData.get('compras')) : 0,
        cpa: formData.get('cpa') ? Number(formData.get('cpa')) : null,
        alcance: formData.get('alcance') ? Number(formData.get('alcance')) : 0,
        observaciones: formData.get('observaciones') || null
    }

    const { error } = await supabase.from('codpi_ad_spend_daily').update(data).eq('id', id)
    if (error) {
        return { success: false, error: error.message }
    }
    revalidatePath('/costs')
    return { success: true }
}

export async function deleteOperationalCost(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('codpi_operational_costs').delete().eq('id', id)
    if (error) {
        return { success: false, error: error.message }
    }
    revalidatePath('/costs')
    return { success: true }
}

export async function updateOperationalCost(id: string, formData: FormData) {
    const supabase = await createClient()
    let mesStr = formData.get('mes') as string
    if (mesStr && mesStr.length === 7) mesStr = mesStr + '-01'

    const data = {
        mes: mesStr,
        concepto: formData.get('concepto'),
        monto: Number(formData.get('monto')),
        notas: formData.get('notas')
    }

    const { error } = await supabase.from('codpi_operational_costs').update(data).eq('id', id)
    if (error) {
        return { success: false, error: error.message }
    }
    revalidatePath('/costs')
    return { success: true }
}
