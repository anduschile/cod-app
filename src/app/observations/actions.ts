'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createObservation(formData: FormData) {
    const supabase = await createClient()

    const fecha = formData.get('fecha') as string
    const product_id = formData.get('product_id') as string
    const campana = formData.get('campana') as string
    const anuncio = formData.get('anuncio') as string
    const cambio_realizado = formData.get('cambio_realizado') as string
    const motivo = formData.get('motivo') as string
    const hipotesis = formData.get('hipotesis') as string
    const resultado_esperado = formData.get('resultado_esperado') as string

    if (!fecha || !cambio_realizado) {
        return { success: false, error: 'Fecha y Cambio Realizado son requeridos.' }
    }

    const { error } = await supabase.from('codpi_campaign_logs').insert({
        fecha,
        product_id: product_id || null,
        campana,
        anuncio,
        cambio_realizado,
        motivo,
        hipotesis,
        resultado_esperado
    })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/observations')
    return { success: true }
}

export async function deleteObservation(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('codpi_campaign_logs').delete().eq('id', id)
    if (error) {
        return { success: false, error: error.message }
    }
    revalidatePath('/observations')
    return { success: true }
}
