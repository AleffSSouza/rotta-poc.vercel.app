import { mockPdvs } from '../data/mockPdvs'
import { mockPromoters } from '../data/mockPromoters'
import type { AppState } from '../types/app'
import type { PDV } from '../types/pdv'
import type { Promoter } from '../types/promoter'
import type { PrioritizationProfile, Weights } from '../types/prioritization'
import type { Visit } from '../types/occurrence'
import { loadSession, loadState } from './storageService'
import { buildSeedOccurrences } from './occurrenceService'

/**
 * Camada de dados da POC. Hoje lê mocks e localStorage.
 * Para ligar uma API REST Node.js, basta trocar o corpo destas funções.
 */
export const getPDVs = (): PDV[] => mockPdvs
export const getPromotores = (): Promoter[] => mockPromoters

export const DEFAULT_WEIGHTS: Weights = { atendimento: 35, distancia: 15, ruptura: 30, criticidade: 20 }

/** Modelos de estratégia que o gestor pode carregar como ponto de partida. */
export const STRATEGY_PRESETS: { id: string; nome: string; descricao: string; weights: Weights }[] = [
  {
    id: 'reacao',
    nome: 'Reação a rupturas',
    descricao: 'Perfil padrão da operação',
    weights: DEFAULT_WEIGHTS,
  },
  {
    id: 'foco-ruptura',
    nome: 'Foco em ruptura',
    descricao: 'Ruptura pesa 50%',
    weights: { atendimento: 25, distancia: 11, ruptura: 50, criticidade: 14 },
  },
  {
    id: 'proximidade',
    nome: 'Modelo por proximidade',
    descricao: 'Como a consultoria define hoje',
    weights: { atendimento: 10, distancia: 60, ruptura: 15, criticidade: 15 },
  },
  {
    id: 'atendimento',
    nome: 'Foco em atendimento',
    descricao: 'Lojas de visita longa primeiro',
    weights: { atendimento: 55, distancia: 10, ruptura: 20, criticidade: 15 },
  },
]

export const buildDefaultProfile = (): PrioritizationProfile => ({
  id: 'perfil-reacao-rupturas',
  nome: 'Reação a Rupturas',
  descricao: 'Prioriza os PDVs que exigem resposta mais rápida da operação.',
  weights: DEFAULT_WEIGHTS,
  updatedAt: new Date(0).toISOString(),
})

export const getPrioritizationProfile = (): PrioritizationProfile => loadState()?.profile ?? buildDefaultProfile()

export const emptyChecklist = () => [false, false, false, false, false]

function buildInitialVisits(): Record<string, Visit> {
  const seeded: Record<string, Visit['status']> = {
    'pdv-05': 'concluida',
    'pdv-06': 'em_andamento',
    'pdv-07': 'atrasada',
    'pdv-09': 'concluida',
    'pdv-10': 'concluida',
  }
  const visits: Record<string, Visit> = {}
  for (const pdv of mockPdvs) {
    const status = seeded[pdv.id] ?? 'pendente'
    visits[pdv.id] = {
      status,
      checklist: status === 'concluida' ? [true, true, true, true, true] : emptyChecklist(),
      occurrenceIds: [],
      checkinAt: status === 'concluida' || status === 'em_andamento' ? '09:10' : undefined,
      finishedAt: status === 'concluida' ? '09:55' : undefined,
    }
  }
  return visits
}

/** Estado inicial da demonstração, sempre igual. */
export function createSeedState(session: AppState['session'] = null, now = Date.now()): AppState {
  const profile = buildDefaultProfile()
  const { occurrences, alerts } = buildSeedOccurrences(now)
  return {
    session,
    profile,
    draftWeights: profile.weights,
    previousWeights: null,
    lastAppliedAt: null,
    occurrences,
    alerts,
    visits: buildInitialVisits(),
  }
}

export const getInitialState = (): AppState => ({ ...(loadState() ?? createSeedState()), session: loadSession() })
