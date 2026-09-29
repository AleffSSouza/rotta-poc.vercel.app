import type { Alert, Occurrence, Visit } from './occurrence'
import type { Session } from './promoter'
import type { PrioritizationProfile, Weights } from './prioritization'

export interface AppState {
  session: Session | null
  /** Perfil aplicado: é ele que define o ranking do dashboard e a rota dos promotores. */
  profile: PrioritizationProfile
  /** Pesos em edição na tela de perfis (prévia ainda não aplicada). */
  draftWeights: Weights
  /** Pesos vigentes antes da última aplicação, usados para mostrar o que mudou. */
  previousWeights: Weights | null
  lastAppliedAt: number | null
  occurrences: Occurrence[]
  alerts: Alert[]
  visits: Record<string, Visit>
}
