'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { deleteAdSpend, deleteOperationalCost } from './actions'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface CostActionsProps {
    id: string
    type?: 'ad_spend' | 'operational_cost'
}

export function CostActions({ id, type = 'ad_spend' }: CostActionsProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleDelete() {
        setLoading(true)
        const res = type === 'operational_cost' ? await deleteOperationalCost(id) : await deleteAdSpend(id)
        if (res.success) {
            toast.success("Registro eliminado")
            setOpen(false)
        } else {
            toast.error("Error: " + res.error)
        }
        setLoading(false)
    }

    const editUrl = type === 'operational_cost' ? `/costs/op/${id}` : `/costs/${id}`

    return (
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" asChild className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                <Link href={editUrl}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>
                <Trash2 className="h-4 w-4" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar registro de gasto?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará permanentemente la inversión registrada en esta fila.
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
