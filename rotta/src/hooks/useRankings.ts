import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getPDVs, getPromotores } from '../services/dataService'
import { compareRankings, generateRanking } from '../services/scoringService'
import { generateAllRoutes } from '../services/routeService'

/**
 * Centraliza o cálculo do ranking e das rotas em três cenários:
 * aplicado (vale para a operação), prévia (pesos em edição) e anterior (antes da última aplicação).
 */
export function useRankings() {
  const { state } = useApp()
  const pdvs = useMemo(() => getPDVs(), [])
  const promoters = useMemo(() => getPromotores(), [])

  const applied = useMemo(() => generateRanking(pdvs, state.profile.weights), [pdvs, state.profile.weights])
  const draft = useMemo(() => generateRanking(pdvs, state.draftWeights), [pdvs, state.draftWeights])
  const previous = useMemo(
    () => (state.previousWeights ? generateRanking(pdvs, state.previousWeights) : null),
    [pdvs, state.previousWeights],
  )

  const appliedRoutes = useMemo(() => generateAllRoutes(promoters, pdvs, applied), [promoters, pdvs, applied])
  const draftRoutes = useMemo(() => generateAllRoutes(promoters, pdvs, draft), [promoters, pdvs, draft])
  const previousRoutes = useMemo(
    () => (previous ? generateAllRoutes(promoters, pdvs, previous) : null),
    [promoters, pdvs, previous],
  )

  const draftDiff = useMemo(() => compareRankings(applied, draft), [applied, draft])
  const appliedDiff = useMemo(() => (previous ? compareRankings(previous, applied) : null), [previous, applied])

  return { pdvs, promoters, applied, draft, previous, appliedRoutes, draftRoutes, previousRoutes, draftDiff, appliedDiff }
}
