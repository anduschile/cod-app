import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { calculateProductScore } from '@/lib/utils/score-helper'
import { calculateCommercialValidationScore, calculateStockSignals } from '@/lib/utils/market-validation-helper'
import { ProductsTableClient } from './ProductsTableClient'

export default async function ProductsPage() {
    const supabase = await createClient()

    // Fetch products and all related evaluation data
    // Fetching all for MVP since volume is small, but filtering in memory to avoid sending heavy props to Client Component
    const [{ data: products, error }, { data: allCriteria }, { data: allScores }, { data: allMarketChecks }, { data: allSnapshots }] = await Promise.all([
        supabase.from('codpi_products').select('*').order('created_at', { ascending: false }),
        supabase.from('codpi_evaluation_criteria').select('*').eq('activo', true),
        supabase.from('codpi_product_scores').select('*'),
        supabase.from('codpi_product_market_checks').select('*').order('checked_at', { ascending: false }),
        supabase.from('codpi_product_supplier_snapshots').select('*').order('captured_at', { ascending: false })
    ])

    if (error) {
        console.error('Error fetching products:', error)
    }

    const productsWithEvals = (products || []).map(p => {
        // 1. Matrix Scorecard
        const productScores = allScores?.filter(s => s.product_id === p.id) || []
        const evalResult = calculateProductScore(productScores, allCriteria || [])

        // 2. Commercial Validation
        const productMarketChecks = allMarketChecks?.filter(m => m.product_id === p.id) || []
        const latestMarketCheck = productMarketChecks[0] || null // get latest

        const productSnapshots = allSnapshots?.filter(s => s.product_id === p.id) || []

        const valResultRaw = calculateCommercialValidationScore(
            latestMarketCheck as any,
            productSnapshots as any
        )
        const { risk, rotation } = calculateStockSignals(productSnapshots as any)

        const valResult = {
            hasValidation: !!latestMarketCheck,
            score: valResultRaw.score,
            recommendation: valResultRaw.recommendation,
            isNegativeExperienceWarning: valResultRaw.isNegativeExperienceWarning,
            risk: risk,
            rotation: rotation,
            prior_experience: latestMarketCheck?.prior_experience || 'untested'
        }

        return {
            id: p.id,
            nombre: p.nombre,
            categoria: p.categoria,
            estado: p.estado,
            costo_producto: p.costo_producto,
            precio_venta_sugerido: p.precio_venta_sugerido,
            moneda: p.moneda,
            is_archived: p.is_archived || false,
            evalResult,
            valResult
        }
    }).sort((a, b) => {
        // Sort active first, then by matrix score
        if (!a.is_archived && b.is_archived) return -1
        if (a.is_archived && !b.is_archived) return 1

        if (a.evalResult.hasScores && !b.evalResult.hasScores) return -1
        if (!a.evalResult.hasScores && b.evalResult.hasScores) return 1

        return b.evalResult.porcentaje - a.evalResult.porcentaje
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Laboratorio de Productos</h1>
                <Button asChild>
                    <Link href="/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            </div>

            <ProductsTableClient initialProducts={productsWithEvals} />
        </div>
    )
}
