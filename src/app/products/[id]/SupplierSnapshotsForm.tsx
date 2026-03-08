"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Plus, Trash2 } from "lucide-react"

export function SupplierSnapshotsForm({ productId }: { productId: string }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const [rows, setRows] = useState([{
        id: crypto.randomUUID(),
        provider_name: '',
        unit_cost: '',
        shipping_cost: '',
        stock_qty: '',
        supplier_link: '',
        notes: ''
    }])

    const addRow = () => {
        setRows([...rows, {
            id: crypto.randomUUID(),
            provider_name: '',
            unit_cost: '',
            shipping_cost: '',
            stock_qty: '',
            supplier_link: '',
            notes: ''
        }])
    }

    const removeRow = (id: string) => {
        if (rows.length === 1) return
        setRows(rows.filter(r => r.id !== id))
    }

    const updateRow = (id: string, field: string, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r))
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        // Basic validation
        const invalidRows = rows.filter(r => !r.provider_name.trim())
        if (invalidRows.length > 0) {
            toast.error("Todos los proveedores deben tener un nombre")
            setLoading(false)
            return
        }

        const captureBatchId = crypto.randomUUID()

        const payload = rows.map(r => ({
            product_id: productId,
            capture_batch_id: captureBatchId,
            provider_name: r.provider_name.trim(),
            unit_cost: r.unit_cost ? Number(r.unit_cost) : null,
            shipping_cost: r.shipping_cost ? Number(r.shipping_cost) : null,
            stock_qty: r.stock_qty ? Number(r.stock_qty) : null,
            supplier_link: r.supplier_link.trim() || null,
            notes: r.notes.trim() || null
        }))

        const { error } = await supabase
            .from('codpi_product_supplier_snapshots')
            .insert(payload)

        setLoading(false)

        if (error) {
            toast.error('Error al guardar snapshots: ' + error.message)
        } else {
            toast.success('Snapshots guardados exitosamente')
            setRows([{
                id: crypto.randomUUID(),
                provider_name: '',
                unit_cost: '',
                shipping_cost: '',
                stock_qty: '',
                supplier_link: '',
                notes: ''
            }])
            router.refresh()
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Captura Rápida de Stock y Proveedores</h3>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Fila
                </Button>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-3 py-2">Proveedor *</th>
                            <th className="px-3 py-2">Costo U.</th>
                            <th className="px-3 py-2">Envío</th>
                            <th className="px-3 py-2">Stock</th>
                            <th className="px-3 py-2">URL</th>
                            <th className="px-3 py-2">Notas</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.id} className="border-b">
                                <td className="px-2 py-2">
                                    <Input
                                        className="h-8"
                                        placeholder="Ej: Dropi X"
                                        value={row.provider_name}
                                        onChange={e => updateRow(row.id, 'provider_name', e.target.value)}
                                        required
                                    />
                                </td>
                                <td className="px-2 py-2 w-24">
                                    <Input
                                        className="h-8"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={row.unit_cost}
                                        onChange={e => updateRow(row.id, 'unit_cost', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-2 w-24">
                                    <Input
                                        className="h-8"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={row.shipping_cost}
                                        onChange={e => updateRow(row.id, 'shipping_cost', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-2 w-24">
                                    <Input
                                        className="h-8"
                                        type="number"
                                        min="0"
                                        placeholder="Ud."
                                        value={row.stock_qty}
                                        onChange={e => updateRow(row.id, 'stock_qty', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        className="h-8"
                                        placeholder="https..."
                                        value={row.supplier_link}
                                        onChange={e => updateRow(row.id, 'supplier_link', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        className="h-8"
                                        placeholder="..."
                                        value={row.notes}
                                        onChange={e => updateRow(row.id, 'notes', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-2 text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-2">
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Guardando Batch...' : 'Guardar Snapshot'}
                </Button>
            </div>
        </form>
    )
}
