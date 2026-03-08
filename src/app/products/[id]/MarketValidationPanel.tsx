"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateCommercialValidationScore, calculateStockSignals, ProcessedMarketCheck, ProcessedSupplierSnapshot } from "@/lib/utils/market-validation-helper"
import { MarketCheckForm } from "./MarketCheckForm"
import { SupplierSnapshotsForm } from "./SupplierSnapshotsForm"
import { SnapshotHistory } from "./SnapshotHistory"
import { AlertCircle } from "lucide-react"

export function MarketValidationPanel({
    productId,
    marketChecks,
    supplierSnapshots
}: {
    productId: string,
    marketChecks: ProcessedMarketCheck[],
    supplierSnapshots: ProcessedSupplierSnapshot[]
}) {
    const latestMarketCheck = marketChecks[0] || null

    // Calculate Score & Signals
    const { score, recommendation, isNegativeExperienceWarning } = calculateCommercialValidationScore(
        latestMarketCheck,
        supplierSnapshots
    )

    const { rotation, risk } = calculateStockSignals(supplierSnapshots)

    // Derived styles
    const getRecommendationColor = (rec: string) => {
        if (rec === 'PROBAR') return 'bg-green-500 hover:bg-green-600'
        if (rec === 'OBSERVAR') return 'bg-yellow-500 hover:bg-yellow-600'
        if (rec === 'DESCARTAR') return 'bg-red-500 hover:bg-red-600'
        return 'bg-gray-400 hover:bg-gray-500'
    }

    const getRotationColor = (val: string) => {
        if (val === 'Alta') return 'text-green-700 bg-green-100'
        if (val === 'Media') return 'text-yellow-700 bg-yellow-100'
        if (val === 'Baja') return 'text-red-700 bg-red-100'
        return 'text-gray-700 bg-gray-100'
    }

    const getRiskColor = (val: string) => {
        if (val === 'Bajo') return 'text-green-700 bg-green-100'
        if (val === 'Medio') return 'text-yellow-700 bg-yellow-100'
        if (val === 'Alto') return 'text-red-700 bg-red-100'
        return 'text-gray-700 bg-gray-100'
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="py-4">
                        <CardDescription>Score de Validación</CardDescription>
                        <CardTitle className="text-3xl flex items-center gap-2">
                            {score !== null ? `${score}%` : '-'}
                            <Badge className={`${getRecommendationColor(recommendation)} text-white ml-2`}>
                                {recommendation}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="py-4">
                        <CardDescription>Señal de Rotación</CardDescription>
                        <CardTitle className="text-xl mt-1">
                            <Badge variant="outline" className={`border-none ${getRotationColor(rotation)}`}>
                                {rotation}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="py-4">
                        <CardDescription>Riesgo Abastecimiento</CardDescription>
                        <CardTitle className="text-xl mt-1">
                            <Badge variant="outline" className={`border-none ${getRiskColor(risk)}`}>
                                {risk}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="py-4">
                        <CardDescription>Experiencia Previa</CardDescription>
                        <CardTitle className="text-xl mt-1 flex flex-col items-start gap-1">
                            <Badge variant="outline" className="capitalize">
                                {latestMarketCheck ? latestMarketCheck.prior_experience : 'Sin evaluar'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Warn message if negative experience blocked the "PROBAR" status */}
            {isNegativeExperienceWarning && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 h-5 w-5 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-yellow-800">Revisar: Experiencia Previa Negativa</h4>
                        <p className="text-sm text-yellow-700">El producto tiene un puntaje alto pero ha sido forzado a OBSERVACIÓN estructuralmente debido a malas experiencias previas.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Señales de Mercado</CardTitle>
                        <CardDescription>Evalúa creativos, competencia y potencial.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MarketCheckForm productId={productId} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Snapshots de Proveedores</CardTitle>
                        <CardDescription>Captura stock actual y precios para calcular disponibilidad.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SupplierSnapshotsForm productId={productId} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Snapshots</CardTitle>
                    <CardDescription>Explora el detalle de las capturas ordenadas cronológicamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SnapshotHistory snapshots={supplierSnapshots} />
                </CardContent>
            </Card>

        </div>
    )
}
