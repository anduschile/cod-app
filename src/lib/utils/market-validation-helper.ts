export type ProcessedMarketCheck = {
    meta_ads_signal_score: number;
    tiktok_signal_score: number;
    marketplace_signal_score: number;
    competitive_saturation_score: number;
    differentiation_score: number;
    demo_potential_score: number;
    offer_clarity_score: number;
    operational_simplicity_score: number;
    prior_experience: 'positive' | 'neutral' | 'negative' | 'untested';
};

export type ProcessedSupplierSnapshot = {
    capture_batch_id: string;
    product_id: string;
    provider_name: string;
    captured_at: string;
    unit_cost: number | null;
    shipping_cost: number | null;
    stock_qty: number | null;
    supplier_link?: string | null;
    notes?: string | null;
};

export type CommercialValidationScore = {
    score: number | null;
    recommendation: 'PROBAR' | 'OBSERVAR' | 'DESCARTAR' | 'INCOMPLETO';
    isNegativeExperienceWarning: boolean;
};

export type RotationSignal = 'Alta' | 'Media' | 'Baja' | 'Insuficiente data';
export type RestockRisk = 'Alto' | 'Medio' | 'Bajo' | 'Insuficiente data';

export function calculateCommercialValidationScore(
    marketCheck: ProcessedMarketCheck | null,
    providerSnapshots: ProcessedSupplierSnapshot[]
): CommercialValidationScore {
    if (!marketCheck) {
        return {
            score: null,
            recommendation: 'INCOMPLETO',
            isNegativeExperienceWarning: false
        };
    }

    // 1. External Market Signal (45%)
    // Variables (out of 5):
    // meta_ads_signal_score
    // tiktok_signal_score
    // marketplace_signal_score
    // differentiation_score
    // demo_potential_score
    // offer_clarity_score
    // Inverted: competitive_saturation_score (0 -> 5, 5 -> 0)

    // We sum them up and map to 100. There are 7 variables. Max sum = 35.
    const invertedSaturation = 5 - marketCheck.competitive_saturation_score;
    const marketSum = marketCheck.meta_ads_signal_score +
        marketCheck.tiktok_signal_score +
        marketCheck.marketplace_signal_score +
        marketCheck.differentiation_score +
        marketCheck.demo_potential_score +
        marketCheck.offer_clarity_score +
        invertedSaturation;

    const marketScore100 = (marketSum / 35) * 100;

    // 2. Commercial / Operational Preparation (35%)
    // Variables (out of 5):
    // operational_simplicity_score
    // demo_potential_score
    // offer_clarity_score
    // differentiation_score

    // Sum them up, Max = 20
    const opsSum = marketCheck.operational_simplicity_score +
        marketCheck.demo_potential_score +
        marketCheck.offer_clarity_score +
        marketCheck.differentiation_score;

    const opsScore100 = (opsSum / 20) * 100;

    // 3. Provider / Restock Signal (20%)
    let providerScore100 = 0;

    // Find unique batches
    const latestBatchInfo = getSupplierSnapshotInfo(providerSnapshots);
    const { risk } = calculateStockSignals(providerSnapshots);

    // Simple logic for provider score based on total count, risk, etc.
    let providerPoints = 0;
    const providerCount = latestBatchInfo.currentBatchProvidersCount;

    if (providerCount >= 3) providerPoints += 40;
    else if (providerCount === 2) providerPoints += 25;
    else if (providerCount === 1) providerPoints += 10;
    else providerPoints += 0;

    if (risk === 'Bajo') providerPoints += 40;
    else if (risk === 'Medio') providerPoints += 20;
    else if (risk === 'Alto') providerPoints += 0;
    else providerPoints += 10; // Insufficient data

    const totalStock = latestBatchInfo.currentTotalStock;
    if (totalStock >= 100) providerPoints += 20;
    else if (totalStock >= 30) providerPoints += 10;
    else providerPoints += 0;

    providerScore100 = Math.min(100, providerPoints);

    // Calculate Raw Weighted Score
    let rawScore = (marketScore100 * 0.45) + (opsScore100 * 0.35) + (providerScore100 * 0.20);

    // Penalties
    let isNegativeExperienceWarning = false;

    if (marketCheck.prior_experience === 'negative') {
        rawScore -= 15;
        isNegativeExperienceWarning = true;
    }

    if (providerCount === 1) {
        rawScore -= 5;
    } else if (providerCount === 0) {
        rawScore -= 10;
    }

    rawScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Recommendation logic
    let recommendation: 'PROBAR' | 'OBSERVAR' | 'DESCARTAR' | 'INCOMPLETO' = 'DESCARTAR';

    if (rawScore >= 80) {
        recommendation = 'PROBAR';
    } else if (rawScore >= 60) {
        recommendation = 'OBSERVAR';
    }

    // Force OBSERVAR if experience is negative and it scored high enough to be PROBAR
    if (isNegativeExperienceWarning && recommendation === 'PROBAR') {
        recommendation = 'OBSERVAR';
    }

    return {
        score: rawScore,
        recommendation,
        isNegativeExperienceWarning
    };
}


/**
 * Helper to extract and compare the two most recent supplier snapshot batches.
 */
export function calculateStockSignals(
    snapshots: ProcessedSupplierSnapshot[]
): { rotation: RotationSignal, risk: RestockRisk } {
    if (!snapshots || snapshots.length === 0) {
        return { rotation: 'Insuficiente data', risk: 'Alto' };
    }

    // Group by capture_batch_id
    const batchesMap = new Map<string, ProcessedSupplierSnapshot[]>();
    snapshots.forEach(s => {
        const batch = batchesMap.get(s.capture_batch_id) || [];
        batch.push(s);
        batchesMap.set(s.capture_batch_id, batch);
    });

    // Sort batches by their oldest captured_at desc
    const sortedBatches = Array.from(batchesMap.values()).sort((a, b) => {
        return new Date(b[0].captured_at).getTime() - new Date(a[0].captured_at).getTime();
    });

    const currentBatch = sortedBatches[0] || [];
    const previousBatch = sortedBatches[1] || []; // Might be undefined

    const currentTotalStock = currentBatch.reduce((sum, s) => sum + (s.stock_qty || 0), 0);
    const providerCount = currentBatch.length;

    // Calculate Risk
    let risk: RestockRisk = 'Insuficiente data';
    if (providerCount === 0) {
        risk = 'Alto';
    } else if (providerCount === 1) {
        risk = 'Alto';
    } else if (currentTotalStock < 30) {
        risk = 'Alto';
    } else if (providerCount >= 3 && currentTotalStock >= 100) {
        risk = 'Bajo';
    } else {
        risk = 'Medio';
    }

    // Calculate Rotation
    let rotation: RotationSignal = 'Insuficiente data';

    if (previousBatch.length > 0) {
        const previousTotalStock = previousBatch.reduce((sum, s) => sum + (s.stock_qty || 0), 0);
        const delta = currentTotalStock - previousTotalStock;

        // E.g. If stock drops significantly, rotation is 'Alta'
        if (delta <= -20) {
            rotation = 'Alta';
        } else if (delta < 0) {
            rotation = 'Media';
        } else {
            // Stock grew or stayed exactly the same
            rotation = 'Baja';
        }
    }

    return { rotation, risk };
}

export function getSupplierSnapshotInfo(snapshots: ProcessedSupplierSnapshot[]) {
    if (!snapshots || snapshots.length === 0) return {
        currentBatchProvidersCount: 0,
        currentTotalStock: 0,
        minCost: 0,
        avgCost: 0,
        cheapestProvider: '-',
        highestStockProvider: '-'
    };

    const batchesMap = new Map<string, ProcessedSupplierSnapshot[]>();
    snapshots.forEach(s => {
        const batch = batchesMap.get(s.capture_batch_id) || [];
        batch.push(s);
        batchesMap.set(s.capture_batch_id, batch);
    });

    const sortedBatches = Array.from(batchesMap.values()).sort((a, b) => {
        return new Date(b[0].captured_at).getTime() - new Date(a[0].captured_at).getTime();
    });

    const currentBatch = sortedBatches[0] || [];

    const currentBatchProvidersCount = currentBatch.length;
    let currentTotalStock = 0;

    let minCost = Infinity;
    let totalCost = 0;
    let costCount = 0;
    let cheapestProvider = '-';

    let maxStock = -1;
    let highestStockProvider = '-';

    currentBatch.forEach(s => {
        const stock = s.stock_qty || 0;
        currentTotalStock += stock;

        if (stock > maxStock) {
            maxStock = stock;
            highestStockProvider = s.provider_name;
        }

        const cost = s.unit_cost || 0;
        if (cost > 0) {
            totalCost += cost;
            costCount++;
            if (cost < minCost) {
                minCost = cost;
                cheapestProvider = s.provider_name;
            }
        }
    });

    const avgCost = costCount > 0 ? totalCost / costCount : 0;
    if (minCost === Infinity) minCost = 0;

    return {
        currentBatchProvidersCount,
        currentTotalStock,
        minCost,
        avgCost,
        cheapestProvider,
        highestStockProvider
    };
}
