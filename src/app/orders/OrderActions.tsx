'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { deleteOrder } from './actions'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

export function OrderActions({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleDelete() {
        setLoading(true)
        const res = await deleteOrder(orderId)
        if (res.success) {
            toast.success("Pedido eliminado")
            setOpen(false)
        } else {
            toast.error("Error: " + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/orders/${orderId}`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>

            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>
                <Trash2 className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar pedido?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el pedido de la base de datos de manera definitiva.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 focus:ring-red-500" disabled={loading}>
                            {loading ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
