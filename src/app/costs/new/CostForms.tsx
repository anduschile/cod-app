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

export function CostForms({ products, tests }: { products: any[], tests: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    
    // Gasto Ads States
    const [product, setProduct] = useState('')
    const [selectedTest, setSelectedTest] = useState('')
    const [platform, setPlatform] = useState('')

    // Costo Operativo States
    const [productOp, setProductOp] = useState('')
    const [selectedTestOp, setSelectedTestOp] = useState('')
    const [tipoOp, setTipoOp] = useState('fijo_mensual')

    const productTests = tests.filter(t => t.product_id === product)
    const productOpTests = tests.filter(t => t.product_id === productOp)

    const handleProductChange = (val: string | null) => {
        const value = val || ''
        setProduct(value)
        const productActiveTests = tests.filter(t => t.product_id === value && t.status === 'active')
        if (productActiveTests.length === 1) {
            setSelectedTest(productActiveTests[0].id)
        } else {
            setSelectedTest('')
        }
    }

    const handleProductOpChange = (val: string | null) => {
        const value = val || ''
        setProductOp(value)
        const productActiveTests = tests.filter(t => t.product_id === value && t.status === 'active')
        if (productActiveTests.length === 1) {
            setSelectedTestOp(productActiveTests[0].id)
        } else {
            setSelectedTestOp('')
        }
    }

    async function submitAdSpend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            fecha: formData.get('fecha'),
            product_id: product === 'global_option_999' ? null : product || null,
            test_id: selectedTest || null,
            plataforma: platform,
            monto: Number(formData.get('monto')),
            campana: formData.get('campana') || null,
            conjunto: formData.get('conjunto') || null,
            anuncio: formData.get('anuncio') || null,
            compras: formData.get('compras') ? Number(formData.get('compras')) : 0,
            cpa: formData.get('cpa') ? Number(formData.get('cpa')) : null,
            alcance: formData.get('alcance') ? Number(formData.get('alcance')) : 0,
            observaciones: formData.get('observaciones') || null
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
            product_id: productOp === 'global_option_999' ? null : productOp || null,
            test_id: selectedTestOp || null,
            tipo: tipoOp,
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
                        <form onSubmit={submitAdSpend} className="flex flex-col gap-6 mt-4">

                            {/* CAMPOS MÍNIMOS OBLIGATORIOS */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Obligatorios</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Fecha</Label>
                                        <Input name="fecha" type="date" required defaultValue={new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date())} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Producto Asignado</Label>
                                        <Select value={product} onValueChange={handleProductChange} required>
                                            <SelectTrigger><SelectValue placeholder="Global / Marca" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="global_option_999">Ninguno (Global)</SelectItem>
                                                {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Campaña / Test</Label>
                                        <Select value={selectedTest} onValueChange={(val) => setSelectedTest(val || '')}>
                                            <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                                            <SelectContent>
                                                {productTests.map((t: any) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.test_name} ({t.status})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Inversión (Monto $)</Label>
                                        <Input name="monto" type="number" step="0.01" required />
                                    </div>
                                </div>
                            </div>

                            {/* MÉTRICAS OPCIONALES */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Métricas del Embudo (Opcional)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Camp. Name (Legacy)</Label>
                                        <Input name="campana" type="text" placeholder="Nombre campaña..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Conjunto</Label>
                                        <Input name="conjunto" type="text" placeholder="Adset..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Anuncio</Label>
                                        <Input name="anuncio" type="text" placeholder="Ad name..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Compras</Label>
                                        <Input name="compras" type="number" step="1" placeholder="Ej: 5" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>CPA ($)</Label>
                                        <Input name="cpa" type="number" step="0.01" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Alcance</Label>
                                        <Input name="alcance" type="number" step="1" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Observaciones</Label>
                                    <Input name="observaciones" placeholder="Ej: Día 1 testeando hook A" />
                                </div>
                            </div>

                            <div className="flex justify-between mt-4">
                                <Button type="button" variant="outline" asChild><Link href="/costs">Cancelar</Link></Button>
                                <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />Guardar Registro</Button>
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
                                    <Label>Tipo de Costo</Label>
                                    <Select value={tipoOp} onValueChange={(val) => setTipoOp(val || 'fijo_mensual')}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fijo_mensual">Costo Fijo Mensual</SelectItem>
                                            <SelectItem value="ajuste_historico">Ajuste Histórico</SelectItem>
                                            <SelectItem value="perdida_arrastrada">Pérdida Arrastrada</SelectItem>
                                            <SelectItem value="cierre_test">Costo Cierre Test</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Producto (Opcional)</Label>
                                    <Select value={productOp} onValueChange={handleProductOpChange}>
                                        <SelectTrigger><SelectValue placeholder="Global" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="global_option_999">Ninguno (Global)</SelectItem>
                                            {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Campaña / Test (Opcional)</Label>
                                    <Select value={selectedTestOp} onValueChange={(val) => setSelectedTestOp(val || '')}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                                        <SelectContent>
                                            {productOpTests.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id}>{t.test_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Concepto</Label>
                                <Input name="concepto" placeholder="Ej: Saldo negativo Dropi, Shopify, Sueldo" required />
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
