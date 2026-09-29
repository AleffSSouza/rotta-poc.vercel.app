import type { GeoPoint, PDV } from '../types/pdv'
import type { Promoter } from '../types/promoter'
import type { Route, RouteStop, ScoredPDV } from '../types/prioritization'
import { roadKm } from '../utils/geo'
import { minutesToClock } from '../utils/format'

/** Início da jornada do promotor (08:00), em minutos desde 00:00. */
export const ROUTE_START_MIN = 8 * 60
/** Velocidade média de deslocamento urbano, em km/h. */
export const AVG_SPEED_KMH = 24
/**
 * Penalização de deslocamento: cada km de trajeto até o próximo PDV "custa" esta
 * quantidade de pontos de score na hora de escolher a próxima parada.
 */
export const DISTANCE_PENALTY_PER_KM = 1.5

/**
 * Roteirização (versão POC): heurística gulosa.
 * O scoring define QUAL PDV é mais prioritário. A roteirização define a ORDEM da visita:
 * a cada parada, escolhe o PDV com maior (score − penalização × km até ele).
 * Não é um VRP completo; é suficiente para demonstrar o conceito.
 */
export function generateRoute(pdvs: PDV[], scores: ScoredPDV[], start: GeoPoint, promoterId = ''): Route {
  const scoreById = new Map(scores.map((s) => [s.pdv.id, s]))
  const remaining = pdvs.map((pdv) => scoreById.get(pdv.id)).filter((s): s is ScoredPDV => Boolean(s))

  const stops: RouteStop[] = []
  let position = start
  let clock = ROUTE_START_MIN
  let totalKm = 0

  while (remaining.length > 0) {
    let bestIndex = 0
    let bestValue = -Infinity
    remaining.forEach((candidate, index) => {
      const km = roadKm(position, candidate.pdv.location)
      const value = candidate.score - DISTANCE_PENALTY_PER_KM * km
      if (value > bestValue) {
        bestValue = value
        bestIndex = index
      }
    })
    const [next] = remaining.splice(bestIndex, 1)
    const legKm = roadKm(position, next.pdv.location)
    const legMin = (legKm / AVG_SPEED_KMH) * 60
    clock += legMin
    stops.push({
      order: stops.length + 1,
      scored: next,
      legKm,
      legMin,
      visitMin: next.pdv.tempoMedioMin,
      eta: minutesToClock(clock),
    })
    clock += next.pdv.tempoMedioMin
    totalKm += legKm
    position = next.pdv.location
  }

  const totalMin = clock - ROUTE_START_MIN
  return { promoterId, stops, totalKm: Math.round(totalKm * 10) / 10, totalMin, proximityKm: nearestNeighbourKm(pdvs, start) }
}

/** Distância total de uma rota apenas geográfica (sempre o PDV mais próximo), usada como referência. */
export function nearestNeighbourKm(pdvs: PDV[], start: GeoPoint): number {
  const remaining = [...pdvs]
  let position = start
  let total = 0
  while (remaining.length > 0) {
    let bestIndex = 0
    let best = Infinity
    remaining.forEach((pdv, index) => {
      const km = roadKm(position, pdv.location)
      if (km < best) {
        best = km
        bestIndex = index
      }
    })
    const [next] = remaining.splice(bestIndex, 1)
    total += best
    position = next.location
  }
  return Math.round(total * 10) / 10
}

/** Gera a rota do dia para cada promotor a partir do ranking vigente. */
export function generateAllRoutes(promoters: Promoter[], pdvs: PDV[], scores: ScoredPDV[]): Record<string, Route> {
  const routes: Record<string, Route> = {}
  for (const promoter of promoters) {
    const own = pdvs.filter((pdv) => pdv.promoterId === promoter.id)
    routes[promoter.id] = generateRoute(own, scores, promoter.base, promoter.id)
  }
  return routes
}
