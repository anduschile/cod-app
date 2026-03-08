import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductEditForm } from './ProductEditForm'
import { EvidenceHub } from './EvidenceHub'
import { Scorecard } from './Scorecard'
import { MarketValidationPanel } from './MarketValidationPanel'

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    const { data: product, error } = await supabase
        .from('codpi_products')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !product) {
        return <div>Producto no encontrado</div>
    }

    const [{ data: evidences }, { data: allCriteria }, { data: currentScores }, { data: marketChecks }, { data: supplierSnapshots }] = await Promise.all([
        supabase.from('codpi_product_evidence').select('*').eq('product_id', id).order('created_at', { ascending: false }),
        supabase.from('codpi_evaluation_criteria').select('*').eq('activo', true).order('created_at', { ascending: true }),
        supabase.from('codpi_product_scores').select('*').eq('product_id', id),
        supabase.from('codpi_product_market_checks').select('*').eq('product_id', id).order('checked_at', { ascending: false }),
        supabase.from('codpi_product_supplier_snapshots').select('*').eq('product_id', id).order('captured_at', { ascending: false }).order('created_at', { ascending: false })
    ])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{product.nombre}</h1>
                    <p className="text-muted-foreground">{product.categoria} &gt; {product.microcategoria}</p>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800">
                    {product.estado.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            <Tabs defaultValue="detalles" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="detalles">Detalles Base</TabsTrigger>
                    <TabsTrigger value="hub">Evidencia</TabsTrigger>
                    <TabsTrigger value="scorecard">Matriz</TabsTrigger>
                    <TabsTrigger value="validacion">Validaci&oacute;n</TabsTrigger>
                </TabsList>
                <TabsContent value="detalles" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Financiera y Logística</CardTitle>
                            <CardDescription>Métricas teóricas del producto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductEditForm product={product} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="hub" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evidencia</CardTitle>
                            <CardDescription>Links, creativos y notas sobre la competencia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EvidenceHub productId={product.id} evidences={evidences || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="scorecard" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Matriz de Evaluación</CardTitle>
                            <CardDescription>Puntajes sobre dolor, wow factor, facilidad de envío, etc.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Scorecard productId={product.id} allCriteria={allCriteria || []} currentScores={currentScores || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="validacion" className="mt-4">
                    <MarketValidationPanel
                        productId={product.id}
                        marketChecks={marketChecks || []}
                        supplierSnapshots={supplierSnapshots || []}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
