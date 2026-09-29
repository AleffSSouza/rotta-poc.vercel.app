import type { PDV } from './pdv'

export type WeightKey = 'atendimento' | 'distancia' | 'ruptura' | 'criticidade'

/** Pesos em pontos percentuais (0 a 100). A soma é sempre 100. */
export type Weights = Record<WeightKey, number>

export type PriorityLevel = 'critico' | 'alto' | 'medio' | 'baixo'

export interface PrioritizationProfile {
  id: string
  nome: string
  descricao: string
  weights: Weights
  updatedAt: string
}

export interface ScoredPDV {
  pdv: PDV
  /** Score final, de 0 a 100. */
  score: number
  rank: number
  nivel: PriorityLevel
  /** Variáveis já normalizadas (0 a 100) e orientadas para "maior = mais prioritário". */
  normalized: Record<WeightKey, number>
  /** Parcela de cada variável no score final (normalizado × peso). */
  contributions: Record<WeightKey, number>
  motivo: string
}

export interface RankingChange {
  pdvId: string
  from: number
  to: number
  /** Positivo = subiu no ranking. */
  delta: number
  nivelFrom: PriorityLevel
  nivelTo: PriorityLevel
}

export interface RankingDiff {
  changes: RankingChange[]
  moved: number
  rose: number
  fell: number
  newCritical: number
}

export interface RouteStop {
  order: number
  scored: ScoredPDV
  legKm: number
  legMin: number
  visitMin: number
  /** Horário estimado de chegada (HH:mm). */
  eta: string
}

export interface Route {
  promoterId: string
  stops: RouteStop[]
  totalKm: number
  totalMin: number
  /** Distância total de uma rota puramente geográfica (vizinho mais próximo), para comparação. */
  proximityKm: number
}
