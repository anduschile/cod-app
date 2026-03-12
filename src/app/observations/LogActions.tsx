'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteObservation } from './actions'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function LogActions({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function handleDelete() {
        setLoading(true)
        const res = await deleteObservation(id)
        if (res.success) {
            toast.success("Observación eliminada")
            setOpen(false)
        } else {
            toast.error("Error: " + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setOpen(true)}>
                <Trash2 className="h-4 w-4" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar observación?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará el registro de la bitácora permanentemente.
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
