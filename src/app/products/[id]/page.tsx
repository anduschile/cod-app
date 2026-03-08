import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ProductDetailPage({
    params
}: {
    params: { id: string }
}) {
    const supabase = await createClient()

    const { data: product, error } = await supabase
        .from('codpi_products')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !product) {
        return <div>Producto no encontrado</div>
    }

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
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="detalles">Detalles Base</TabsTrigger>
                    <TabsTrigger value="hub">Evidence Hub</TabsTrigger>
                    <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
                </TabsList>
                <TabsContent value="detalles" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Financiera y Logística</CardTitle>
                            <CardDescription>Métricas teóricas del producto</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Costo de Producto</span>
                                <span className="text-lg font-medium">${product.costo_producto} {product.moneda}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Precio Sugerido</span>
                                <span className="text-lg font-medium">${product.precio_venta_sugerido} {product.moneda}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Margen Bruto Teórico</span>
                                <span className="text-lg font-medium text-green-600">
                                    ${product.precio_venta_sugerido - product.costo_producto} {product.moneda}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="hub" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evidence Hub</CardTitle>
                            <CardDescription>Links, creativos y notas sobre la competencia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Aquí irá el formulario para guardar hooks, links y capturas */}
                            <div className="text-sm text-muted-foreground">Próximamente... Formulario de Evidencia</div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="scorecard" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scorecard de Evaluación</CardTitle>
                            <CardDescription>Puntajes sobre dolor, wow factor, facilidad de envío, etc.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Aquí irá la tabla de criterios y el score calculado */}
                            <div className="text-sm text-muted-foreground">Próximamente... Scorecard dinámico</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
