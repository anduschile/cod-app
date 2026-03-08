export type EvaluationResult = {
    scoreCalculado: number;
    scoreMaximoPosible: number;
    porcentaje: number;
    recomendacion: string;
    colorRecomendacion: string;
    hasScores: boolean;
}

export function calculateProductScore(
    scores: { criteria_id: string; puntaje: number }[],
    allCriteria: any[]
): EvaluationResult {
    if (!allCriteria || allCriteria.length === 0) {
        return {
            scoreCalculado: 0,
            scoreMaximoPosible: 0,
            porcentaje: 0,
            recomendacion: 'SIN EVALUAR',
            colorRecomendacion: 'text-gray-500 bg-gray-50 border-gray-200',
            hasScores: false
        }
    }

    let scoreCalculado = 0
    let scoreMaximoPosible = 0
    let hasScores = false

    allCriteria.forEach(c => {
        const peso = c.peso || 1
        const scoreEntry = scores.find(s => s.criteria_id === c.id)

        if (scoreEntry && scoreEntry.puntaje > 0) {
            hasScores = true
        }

        const puntaje = scoreEntry ? scoreEntry.puntaje : 0

        scoreCalculado += (puntaje * peso)
        scoreMaximoPosible += ((c.escala_maxima || 5) * peso)
    })

    if (!hasScores) {
        return {
            scoreCalculado: 0,
            scoreMaximoPosible: 0,
            porcentaje: 0,
            recomendacion: 'SIN EVALUAR',
            colorRecomendacion: 'text-gray-600 bg-gray-100 border-gray-200',
            hasScores: false
        }
    }

    const porcentaje = scoreMaximoPosible > 0 ? (scoreCalculado / scoreMaximoPosible) * 100 : 0
    let recomendacion = 'SIN EVALUAR'
    let colorRecomendacion = 'text-gray-500 bg-gray-50 border-gray-200'

    if (scoreMaximoPosible > 0) {
        if (porcentaje >= 80) {
            recomendacion = 'PROBAR'
            colorRecomendacion = 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
        } else if (porcentaje >= 50) {
            recomendacion = 'OBSERVAR'
            colorRecomendacion = 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
        } else {
            recomendacion = 'DESCARTAR'
            colorRecomendacion = 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
        }
    }

    return {
        scoreCalculado,
        scoreMaximoPosible,
        porcentaje,
        recomendacion,
        colorRecomendacion,
        hasScores
    }
}
