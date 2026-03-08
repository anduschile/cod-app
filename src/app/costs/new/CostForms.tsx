"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import Link from 'next/link'

export function CostForms({ products }: { products: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [product, setProduct] = useState('')
    const [platform, setPlatform] = useState('')

    async function submitAdSpend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            fecha: formData.get('fecha'),
            product_id: product || null,
            plataforma: platform,
            monto: Number(formData.get('monto')),
            cpa_plataforma: formData.get('cpa_plataforma') ? Number(formData.get('cpa_plataforma')) : null
        }

        const { error } = await supabase.from('codpi_ad_spend_daily').insert(data)
        setLoading(false)

        if (error) {
            toast.error('Error: ' + error.message)
        } else {
            toast.success('Gasto registrado')
            router.push('/costs')
            router.refresh()
        }
    }

    async function submitOperational(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        let mesStr = formData.get('mes') as string
        if (mesStr.length === 7) mesStr = mesStr + '-01'

        const data = {
            mes: mesStr,
            concepto: formData.get('concepto'),
            monto: Number(formData.get('monto')),
            notas: formData.get('notas')
        }

        const { error } = await supabase.from('codpi_operational_costs').insert(data)
        setLoading(false)

        if (error) {
            toast.error('Error: ' + error.message)
        } else {
            toast.success('Costo registrado')
            router.push('/costs')
            router.refresh()
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <Tabs defaultValue="ads">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ads">Gasto de Ads</TabsTrigger>
                        <TabsTrigger value="fijo">Costo Mensual</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ads">
                        <form onSubmit={submitAdSpend} className="flex flex-col gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Fecha</Label>
                                    <Input name="fecha" type="date" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Producto</Label>
                                    <Select value={product} onValueChange={(val) => setProduct(val || '')}>
                                        <SelectTrigger><SelectValue placeholder="Global / Marca" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="global_option_999">Ninguno (Global)</SelectItem>
                                            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Plataforma</Label>
                                    <Select value={platform} onValueChange={(val) => setPlatform(val || '')} required>
                                        <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                                            <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Monto Invertido ($)</Label>
                                    <Input name="monto" type="number" step="0.01" required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>CPA Promedio (Opcional)</Label>
                                <Input name="cpa_plataforma" type="number" step="0.01" />
                            </div>
                            <div className="flex justify-between mt-4">
                                <Button type="button" variant="outline" asChild><Link href="/costs">Cancelar</Link></Button>
                                <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />Guardar</Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="fijo">
                        <form onSubmit={submitOperational} className="flex flex-col gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Mes Relacionado</Label>
                                    <Input name="mes" type="month" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Concepto</Label>
                                    <Input name="concepto" placeholder="Ej: Shopify, Sueldo" required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Monto ($)</Label>
                                <Input name="monto" type="number" step="0.01" required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Notas adicionales</Label>
                                <Input name="notas" />
                            </div>
                            <div className="flex justify-between mt-4">
                                <Button type="button" variant="outline" asChild><Link href="/costs">Cancelar</Link></Button>
                                <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />Guardar</Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
