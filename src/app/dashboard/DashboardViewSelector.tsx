'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface DashboardViewSelectorProps {
    products: { id: string, nombre: string }[]
    activeTests: { id: string, test_name: string, product_name?: string }[]
}

export function DashboardViewSelector({ products, activeTests }: DashboardViewSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const viewMode = searchParams.get('viewMode') || 'global'
    const productId = searchParams.get('productId') || ''
    const testId = searchParams.get('testId') || ''

    const updateParams = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString())
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value)
            } else {
                newParams.delete(key)
            }
        })
        router.push(`/dashboard?${newParams.toString()}`)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg border mb-6 items-end">
            <div className="grid gap-2 min-w-[150px]">
                <Label htmlFor="view-mode">Vista</Label>
                <Select value={viewMode} onValueChange={(val) => {
                    const value = val || 'global'
                    const params: Record<string, string> = { viewMode: value }
                    if (value === 'global') {
                        params.productId = ''
                        params.testId = ''
                    }
                    updateParams(params)
                }}>
                    <SelectTrigger id="view-mode">
                        <SelectValue placeholder="Seleccionar vista" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="global">Global (Negocio)</SelectItem>
                        <SelectItem value="active_test">Test Activo</SelectItem>
                        <SelectItem value="product">Por Producto</SelectItem>
                        <SelectItem value="historical">Histórico Tests</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {viewMode === 'product' && (
                <div className="grid gap-2 min-w-[200px]">
                    <Label htmlFor="product-select">Producto</Label>
                    <Select value={productId} onValueChange={(val) => updateParams({ productId: val || '' })}>
                        <SelectTrigger id="product-select">
                            <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {viewMode === 'active_test' && (
                <div className="grid gap-2 min-w-[250px]">
                    <Label htmlFor="test-select">Campaña / Test</Label>
                    <Select value={testId} onValueChange={(val) => updateParams({ testId: val || '' })}>
                        <SelectTrigger id="test-select">
                            <SelectValue placeholder="Seleccionar test" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeTests.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.test_name} {t.product_name ? `(${t.product_name})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {(viewMode === 'active_test' && testId) && (
                <div className="pb-2 hidden md:block">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Evaluando Campaña Actual
                    </Badge>
                </div>
            )}
        </div>
    )
}
