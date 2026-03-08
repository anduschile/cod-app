"use client"

import { ProcessedSupplierSnapshot } from "@/lib/utils/market-validation-helper"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function SnapshotHistory({ snapshots }: { snapshots: ProcessedSupplierSnapshot[] }) {
    if (!snapshots || snapshots.length === 0) {
        return <div className="text-sm text-muted-foreground py-4">Aún no hay snapshots registrados.</div>
    }

    // Group by capture_batch_id
    const batchesMap = new Map<string, ProcessedSupplierSnapshot[]>();
    snapshots.forEach(s => {
        const batch = batchesMap.get(s.capture_batch_id) || [];
        batch.push(s);
        batchesMap.set(s.capture_batch_id, batch);
    });

    // Sort batches by newest
    const sortedBatches = Array.from(batchesMap.values()).sort((a, b) => {
        return new Date(b[0].captured_at).getTime() - new Date(a[0].captured_at).getTime();
    });

    return (
        <div className="flex flex-col gap-4">
            {sortedBatches.map(batch => {
                const totalStock = batch.reduce((sum, s) => sum + (s.stock_qty || 0), 0)
                const providersCount = batch.length
                const validCosts = batch.filter(s => (s.unit_cost || 0) > 0).map(s => s.unit_cost!)
                const minCost = validCosts.length > 0 ? Math.min(...validCosts) : 0
                const avgCost = validCosts.length > 0 ? validCosts.reduce((a, b) => a + b, 0) / validCosts.length : 0

                return (
                    <div key={batch[0].capture_batch_id} className="border rounded-md overflow-hidden bg-white">
                        <div className="bg-muted/30 p-3 flex flex-wrap items-center justify-between gap-4 border-b">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                    {format(new Date(batch[0].captured_at), "dd MMM yyyy, HH:mm", { locale: es })}
                                </span>
                                <span className="text-xs text-muted-foreground">Lote ID: {batch[0].capture_batch_id.split('-')[0]}...</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex flex-col items-center">
                                    <span className="text-muted-foreground text-xs">Proveedores</span>
                                    <span className="font-medium">{providersCount}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-muted-foreground text-xs">Stock Total</span>
                                    <span className="font-medium">{totalStock} ud.</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-muted-foreground text-xs">Costo Mín.</span>
                                    <span className="font-medium">${minCost.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-muted-foreground text-xs">Costo Prom.</span>
                                    <span className="font-medium">${avgCost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-0 bg-slate-50">
                            <details className="group">
                                <summary className="text-xs text-blue-600 cursor-pointer p-2 hover:bg-slate-100 outline-none list-none text-center border-t border-transparent group-open:border-slate-200">
                                    <span className="group-open:hidden">Ver detalle proveedores ▼</span>
                                    <span className="hidden group-open:inline">Ocultar detalle ▲</span>
                                </summary>
                                <div className="p-3 pt-0 border-t bg-white">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs h-8">Proveedor</TableHead>
                                                <TableHead className="text-xs h-8 text-right">Costo U.</TableHead>
                                                <TableHead className="text-xs h-8 text-right">Envío</TableHead>
                                                <TableHead className="text-xs h-8 text-right">Stock</TableHead>
                                                <TableHead className="text-xs h-8">Notas / Link</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {batch.map(s => (
                                                <TableRow key={s.product_id + s.provider_name + Math.random()}>
                                                    <TableCell className="text-xs font-medium py-2">{s.provider_name}</TableCell>
                                                    <TableCell className="text-xs text-right py-2">${s.unit_cost?.toFixed(2) || '-'}</TableCell>
                                                    <TableCell className="text-xs text-right py-2">${s.shipping_cost?.toFixed(2) || '-'}</TableCell>
                                                    <TableCell className="text-xs text-right py-2">{s.stock_qty || '-'}</TableCell>
                                                    <TableCell className="text-xs py-2 max-w-[200px] truncate">
                                                        {s.supplier_link && (
                                                            <a href={s.supplier_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mr-2">Link</a>
                                                        )}
                                                        <span className="text-muted-foreground">{s.notes}</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </details>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
