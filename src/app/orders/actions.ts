'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteOrder(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('codpi_orders').delete().eq('id', id)
    if (error) {
        return { success: false, error: error.message }
    }
    revalidatePath('/orders')
    return { success: true }
}
