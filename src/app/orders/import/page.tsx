import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UploadCloud } from 'lucide-react'

export default function CSVImportPage() {
    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto mt-8">
            <h1 className="text-3xl font-bold tracking-tight">CSV Import Sencillo</h1>
            <p className="text-muted-foreground">
                Importa tus pedidos o actualiza estados en batch. Esta versión usa un mapeo manual simple
                para evitar integraciones complejas con transportadoras.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Cargar Archivo CSV</CardTitle>
                    <CardDescription>
                        Sube el reporte de tu transportadora o plataforma publicitaria.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="tipoArchivo">Tipo de Importación</Label>
                        <Select defaultValue="pedidos_nuevos">
                            <SelectTrigger id="tipoArchivo">
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pedidos_nuevos">Pedidos Nuevos (Formato Básico)</SelectItem>
                                <SelectItem value="estados_tracking">Actualización de Estados (Tracking / COD)</SelectItem>
                                <SelectItem value="gasto_ads">Reporte Gasto de Ads Diario</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5 pt-4">
                        <Label htmlFor="csv">Archivo CSV</Label>
                        <Input id="csv" type="file" accept=".csv" />
                    </div>

                    <div className="bg-muted p-4 rounded-md mt-4 text-sm">
                        <h4 className="font-semibold mb-2">Columnas esperadas (Pedidos Nuevos):</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            <li>fecha_pedido</li>
                            <li>nombre_cliente</li>
                            <li>telefono</li>
                            <li>direccion</li>
                            <li>cantidad</li>
                            <li>precio_venta_unidad</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full sm:w-auto">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Procesar CSV
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
