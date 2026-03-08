"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export function OrderEditForm({ order, carriers }: { order: any, carriers: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [estado, setEstado] = useState(order.estado)
    const [carrier, setCarrier] = useState(order.carrier || '')

    const isCarrierUnlisted = carrier && carrier !== 'unassigned' && !carriers.find(c => c.code === carrier)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const updateData = {
            estado,
            tracking_number: formData.get('tracking_number'),
            carrier: carrier === 'unassigned' ? null : (carrier || null),
            observaciones: formData.get('observaciones')
        }

        const { error } = await supabase
            .from('codpi_orders')
            .update(updateData)
            .eq('id', order.id)

        setLoading(false)

        if (error) {
            toast.error('Error al actualizar pedido: ' + error.message)
        } else {
            toast.success('Pedido actualizado exitosamente')
            router.refresh()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex justify-between">
                    <span>{order.nombre_cliente}</span>
                    <span className="text-muted-foreground font-normal">{order.codpi_products?.nombre}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Estado COD</Label>
                            <Select value={estado} onValueChange={setEstado}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="creado">Creado</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="enviado">Enviado</SelectItem>
                                    <SelectItem value="entregado">Entregado</SelectItem>
                                    <SelectItem value="cobrado">Cobrado</SelectItem>
                                    <SelectItem value="rechazado">Rechazado</SelectItem>
                                    <SelectItem value="devuelto">Devuelto</SelectItem>
                                    <SelectItem value="no_localizado">No Localizado</SelectItem>
                                    <SelectItem value="anulado">Anulado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Transportadora</Label>
                            <Select value={carrier || 'unassigned'} onValueChange={(val) => setCarrier(val === 'unassigned' ? '' : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin asignar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                                    {isCarrierUnlisted && (
                                        <SelectItem value={carrier}>{carrier} (Histórico)</SelectItem>
                                    )}
                                    {carriers.map(c => (
                                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tracking_number">Número de Tracking</Label>
                        <Input id="tracking_number" name="tracking_number" defaultValue={order.tracking_number || ''} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea id="observaciones" name="observaciones" defaultValue={order.observaciones || ''} />
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
