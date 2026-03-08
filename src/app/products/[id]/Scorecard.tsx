"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export function Scorecard({ productId, allCriteria, currentScores }: { productId: string, allCriteria: any[], currentScores: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Create initial state mapping criteria ID to score object
    const initialScores: Record<string, { puntaje: number, notas: string }> = {}
    allCriteria.forEach(c => {
        const existing = currentScores.find(s => s.criteria_id === c.id)
        initialScores[c.id] = {
            puntaje: existing ? existing.puntaje : 0,
            notas: existing?.notas || ''
        }
    })

    const [scores, setScores] = useState(initialScores)

    const handleScoreChange = (criteriaId: string, val: string) => {
        let num = Number(val)
        if (isNaN(num)) num = 0
        setScores(prev => ({ ...prev, [criteriaId]: { ...prev[criteriaId], puntaje: num } }))
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const upserts = allCriteria.map(c => ({
            product_id: productId,
            criteria_id: c.id,
            puntaje: scores[c.id].puntaje,
            notas: scores[c.id].notas
        }))

        // Supabase upsert based on product_id + criteria_id requires matching the unique constraint
        // Luckily the unique constraint is UNIQUE(product_id, criteria_id).
        const { error } = await supabase
            .from('codpi_product_scores')
            .upsert(upserts, { onConflict: 'product_id,criteria_id' })

        setLoading(false)

        if (error) {
            toast.error('Error al guardar puntajes: ' + error.message)
        } else {
            toast.success('Scorecard guardado exitosamente')
            router.refresh()
        }
    }

    // Calcular ponderados
    let scoreCalculado = 0
    let scoreMaximoPosible = 0

    allCriteria.forEach(c => {
        const peso = c.peso || 1
        scoreCalculado += (scores[c.id].puntaje * peso)
        scoreMaximoPosible += ((c.escala_maxima || 5) * peso)
    })

    const porcentaje = scoreMaximoPosible > 0 ? (scoreCalculado / scoreMaximoPosible) * 100 : 0

    let recomendacion = 'Sin Datos'
    let colorRecomendacion = 'text-gray-500'

    if (scoreMaximoPosible > 0) {
        if (porcentaje >= 80) {
            recomendacion = 'PROBAR'
            colorRecomendacion = 'text-green-600 bg-green-50'
        } else if (porcentaje >= 50) {
            recomendacion = 'OBSERVAR'
            colorRecomendacion = 'text-yellow-600 bg-yellow-50'
        } else {
            recomendacion = 'DESCARTAR'
            colorRecomendacion = 'text-red-600 bg-red-50'
        }
    }

    if (allCriteria.length === 0) {
        return <div className="text-sm text-muted-foreground p-4">No hay criterios de evaluación configurados en la base de datos (tabla `codpi_evaluation_criteria`). Añade algunos vía Supabase Studio para usar este Scorecard.</div>
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="p-3 font-medium">Criterio</th>
                            <th className="p-3 font-medium text-center">Peso</th>
                            <th className="p-3 font-medium text-center">Máx</th>
                            <th className="p-3 font-medium text-center">Puntaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allCriteria.map(c => (
                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-3">
                                    <div className="font-semibold">{c.nombre}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{c.descripcion}</div>
                                </td>
                                <td className="p-3 text-center">{c.peso}x</td>
                                <td className="p-3 text-center text-muted-foreground">{c.escala_maxima}</td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        min="0"
                                        max={c.escala_maxima}
                                        value={scores[c.id].puntaje}
                                        onChange={(e) => handleScoreChange(c.id, e.target.value)}
                                        className="flex h-9 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors mx-auto text-center"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 border rounded-md">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Puntaje Total (Ponderado)</span>
                    <span className="text-xl font-bold">
                        {scoreCalculado.toFixed(1)} / {scoreMaximoPosible.toFixed(1)} ({porcentaje.toFixed(0)}%)
                    </span>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-md border w-fit ${colorRecomendacion}`}>
                        Recomendación: {recomendacion}
                    </span>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar Scorecard'}
                </Button>
            </div>
        </form>
    )
}
