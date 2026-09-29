import type { PDV } from '../types/pdv'
import type {
  PriorityLevel,
  RankingChange,
  RankingDiff,
  ScoredPDV,
  WeightKey,
  Weights,
} from '../types/prioritization'
import { clamp, invert, normalize } from '../utils/normalization'

export const WEIGHT_KEYS: WeightKey[] = ['atendimento', 'distancia', 'ruptura', 'criticidade']

/**
 * Domínios fixos usados na normalização (0-100).
 * Domínios fixos, em vez de min/max da carteira, deixam o score estável:
 * incluir um novo PDV não muda a nota dos demais.
 */
export const NORMALIZATION_DOMAINS: Record<WeightKey, { min: number; max: number; unidade: string }> = {
  atendimento: { min: 10, max: 60, unidade: 'min' },
  distancia: { min: 0, max: 15, unidade: 'km' },
  ruptura: { min: 0, max: 12, unidade: 'rupturas em 30 dias' },
  criticidade: { min: 1, max: 5, unidade: 'nível' },
}

/** Faixas de score para cada nível de prioridade. */
export const PRIORITY_THRESHOLDS = { critico: 72, alto: 58, medio: 45 }

/**
 * Sentido de cada variável, sempre convertido para "maior = mais prioritário":
 * - atendimento: maior tempo médio = maior impacto operacional, então sobe a prioridade;
 * - distancia: menor distância = menor custo de deslocamento, então a nota é invertida;
 * - ruptura: maior histórico de ruptura = maior prioridade;
 * - criticidade: maior criticidade estratégica = maior prioridade.
 */
export function normalizeVariables(pdv: PDV): Record<WeightKey, number> {
  const d = NORMALIZATION_DOMAINS
  return {
    atendimento: normalize(pdv.tempoMedioMin, d.atendimento.min, d.atendimento.max),
    distancia: invert(normalize(pdv.distanciaKm, d.distancia.min, d.distancia.max)),
    ruptura: normalize(pdv.rupturas30d, d.ruptura.min, d.ruptura.max),
    criticidade: normalize(pdv.criticidade, d.criticidade.min, d.criticidade.max),
  }
}

export function classifyPriority(score: number): PriorityLevel {
  if (score >= PRIORITY_THRESHOLDS.critico) return 'critico'
  if (score >= PRIORITY_THRESHOLDS.alto) return 'alto'
  if (score >= PRIORITY_THRESHOLDS.medio) return 'medio'
  return 'baixo'
}

const MOTIVOS: Record<WeightKey, string> = {
  atendimento: 'Maior tempo médio de atendimento',
  distancia: 'Próximo do ponto de partida',
  ruptura: 'Alto histórico de ruptura',
  criticidade: 'Criticidade estratégica elevada',
}

/**
 * score = Σ (variável normalizada × peso) / 100
 * Com pesos que somam 100, o resultado fica sempre entre 0 e 100.
 */
export function calculateScore(pdv: PDV, weights: Weights) {
  const normalized = normalizeVariables(pdv)
  const contributions = {} as Record<WeightKey, number>
  let score = 0
  for (const key of WEIGHT_KEYS) {
    contributions[key] = (normalized[key] * weights[key]) / 100
    score += contributions[key]
  }
  return { score, normalized, contributions }
}

function explain(normalized: Record<WeightKey, number>, contributions: Record<WeightKey, number>): string {
  const top = [...WEIGHT_KEYS].sort((a, b) => contributions[b] - contributions[a])[0]
  return normalized[top] >= 50 ? MOTIVOS[top] : 'Melhor equilíbrio entre os critérios'
}

/** Calcula o score de todos os PDVs e devolve a lista ordenada da maior para a menor prioridade. */
export function generateRanking(pdvs: PDV[], weights: Weights): ScoredPDV[] {
  return pdvs
    .map((pdv) => {
      const { score, normalized, contributions } = calculateScore(pdv, weights)
      return { pdv, score, normalized, contributions }
    })
    .sort((a, b) => b.score - a.score || a.pdv.id.localeCompare(b.pdv.id))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      nivel: classifyPriority(item.score),
      motivo: explain(item.normalized, item.contributions),
    }))
}

/** Alias com o nome usado na documentação do projeto. */
export const calculateScores = generateRanking

export function compareRankings(before: ScoredPDV[], after: ScoredPDV[]): RankingDiff {
  const previous = new Map(before.map((item) => [item.pdv.id, item]))
  const changes: RankingChange[] = after.map((item) => {
    const old = previous.get(item.pdv.id) ?? item
    return {
      pdvId: item.pdv.id,
      from: old.rank,
      to: item.rank,
      delta: old.rank - item.rank,
      nivelFrom: old.nivel,
      nivelTo: item.nivel,
    }
  })
  return {
    changes,
    moved: changes.filter((c) => c.delta !== 0).length,
    rose: changes.filter((c) => c.delta > 0).length,
    fell: changes.filter((c) => c.delta < 0).length,
    newCritical: changes.filter((c) => c.nivelTo === 'critico' && c.nivelFrom !== 'critico').length,
  }
}

/**
 * Altera um peso e redistribui a diferença entre os demais, proporcionalmente,
 * mantendo a soma em 100 e todos os valores inteiros.
 */
export function redistributeWeights(weights: Weights, changed: WeightKey, newValue: number): Weights {
  const value = clamp(Math.round(newValue), 0, 100)
  const others = WEIGHT_KEYS.filter((key) => key !== changed)
  const remaining = 100 - value
  const othersTotal = others.reduce((sum, key) => sum + weights[key], 0)
  const raw = others.map((key) => (othersTotal > 0 ? (weights[key] / othersTotal) * remaining : remaining / others.length))
  const floors = raw.map(Math.floor)
  let leftover = remaining - floors.reduce((a, b) => a + b, 0)
  const byRemainder = raw.map((r, i) => ({ i, frac: r - floors[i] })).sort((a, b) => b.frac - a.frac)
  for (let j = 0; j < leftover; j += 1) floors[byRemainder[j].i] += 1
  leftover = 0
  const next = { ...weights, [changed]: value } as Weights
  others.forEach((key, i) => {
    next[key] = floors[i]
  })
  return next
}

export const sameWeights = (a: Weights, b: Weights) => WEIGHT_KEYS.every((key) => a[key] === b[key])
