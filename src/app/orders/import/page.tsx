"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

export default function CSVImportPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [importType, setImportType] = useState('pedidos_nuevos')
    const [file, setFile] = useState<File | null>(null)

    const parseCSV = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim() !== '')
        if (lines.length < 2) return []
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        return lines.slice(1).map(line => {
            const values = line.split(',')
            const obj: any = {}
            headers.forEach((header, i) => {
                obj[header] = values[i]?.trim()
            })
            return obj
        })
    }

    const processUpload = async () => {
        if (!file) {
            toast.error("Por favor selecciona un archivo CSV")
            return
        }

        setLoading(true)
        const text = await file.text()
        const data = parseCSV(text)

        if (data.length === 0) {
            toast.error("El archivo está vacío o no tiene el formato correcto")
            setLoading(false)
            return
        }

        if (importType === 'pedidos_nuevos') {
            const sample = data[0]
            if (!("nombre_cliente" in sample) || !("direccion" in sample)) {
                toast.error("Formato Inválido: Faltan columnas requeridas ('nombre_cliente' y 'direccion')")
                setLoading(false)
                return
            }

            let insertedCount = 0
            let errorCount = 0

            for (const row of data) {
                if (!row.nombre_cliente || !row.direccion) continue

                const orderData = {
                    nombre_cliente: row.nombre_cliente,
                    telefono: row.telefono || null,
                    direccion: row.direccion,
                    cantidad: parseInt(row.cantidad) || 1,
                    precio_venta_unidad: parseFloat(row.precio_venta_unidad) || 0,
                    estado: 'creado'
                }

                const { error } = await supabase.from('codpi_orders').insert(orderData)
                if (error) {
                    errorCount++
                    console.error("Error insertando fila", error)
                } else {
                    insertedCount++
                }
            }

            if (insertedCount === 0 && errorCount === 0) {
                toast.error("No se encontraron registros válidos para insertar.")
            } else if (errorCount > 0) {
                toast.warning(`Importación parcial. Insertados: ${insertedCount}, Errores: ${errorCount}`)
            } else {
                toast.success(`Importación exitosa. ${insertedCount} pedidos insertados.`)
            }

            setFile(null)
            const fileInput = document.getElementById('csv') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } else {
            toast.info("Este tipo de importación aún no está implementado")
        }

        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto mt-8">
            <h1 className="text-3xl font-bold tracking-tight">Importar CSV Sencillo</h1>
            <p className="text-muted-foreground">
                Importa tus pedidos o actualiza estados en batch. Esta versión usa un mapeo manual simple.
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
                        <Select value={importType} onValueChange={(val) => setImportType(val || '')}>
                            <SelectTrigger id="tipoArchivo">
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pedidos_nuevos">Pedidos Nuevos (Formato Básico)</SelectItem>
                                <SelectItem value="estados_tracking">Actualización de Estados</SelectItem>
                                <SelectItem value="gasto_ads">Reporte Gasto de Ads Diario</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5 pt-4">
                        <Label htmlFor="csv">Archivo CSV</Label>
                        <Input id="csv" type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className="bg-muted p-4 rounded-md mt-4 text-sm">
                        <h4 className="font-semibold mb-2">Columnas esperadas (Pedidos Nuevos):</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            <li>nombre_cliente</li>
                            <li>telefono</li>
                            <li>direccion</li>
                            <li>cantidad</li>
                            <li>precio_venta_unidad</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full sm:w-auto" onClick={processUpload} disabled={loading || !file}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {loading ? 'Procesando...' : 'Procesar CSV'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
