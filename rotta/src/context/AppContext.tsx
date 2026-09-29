import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { AppState } from '../types/app'
import type { Alert, Occurrence, OccurrenceStatus } from '../types/occurrence'
import type { Session } from '../types/promoter'
import type { Weights } from '../types/prioritization'
import { createSeedState, getInitialState } from '../services/dataService'
import { STORAGE_EVENT_KEY, loadState, saveSession, saveState } from '../services/storageService'
import { useToast } from './ToastContext'

type Action =
  | { type: 'LOGIN'; session: Session }
  | { type: 'LOGOUT' }
  | { type: 'SET_DRAFT'; weights: Weights }
  | { type: 'APPLY_PROFILE' }
  | { type: 'CHECK_IN'; pdvId: string; time: string }
  | { type: 'TOGGLE_CHECK'; pdvId: string; index: number }
  | { type: 'CHECK_ALL'; pdvId: string }
  | { type: 'FINISH_VISIT'; pdvId: string; time: string }
  | { type: 'ADD_OCCURRENCE'; occurrence: Occurrence; alert: Alert | null }
  | { type: 'SET_OCCURRENCE_STATUS'; id: string; status: OccurrenceStatus }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: AppState }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, session: action.session }
    case 'LOGOUT':
      return { ...state, session: null }
    case 'SET_DRAFT':
      return { ...state, draftWeights: action.weights }
    case 'APPLY_PROFILE':
      return {
        ...state,
        previousWeights: state.profile.weights,
        profile: { ...state.profile, weights: state.draftWeights, updatedAt: new Date().toISOString() },
        lastAppliedAt: Date.now(),
      }
    case 'CHECK_IN': {
      const visit = state.visits[action.pdvId]
      return {
        ...state,
        visits: { ...state.visits, [action.pdvId]: { ...visit, status: 'em_andamento', checkinAt: action.time } },
      }
    }
    case 'TOGGLE_CHECK': {
      const visit = state.visits[action.pdvId]
      const checklist = visit.checklist.map((done, i) => (i === action.index ? !done : done))
      return { ...state, visits: { ...state.visits, [action.pdvId]: { ...visit, checklist } } }
    }
    case 'CHECK_ALL': {
      const visit = state.visits[action.pdvId]
      return {
        ...state,
        visits: { ...state.visits, [action.pdvId]: { ...visit, checklist: visit.checklist.map(() => true) } },
      }
    }
    case 'FINISH_VISIT': {
      const visit = state.visits[action.pdvId]
      return {
        ...state,
        visits: { ...state.visits, [action.pdvId]: { ...visit, status: 'concluida', finishedAt: action.time } },
      }
    }
    case 'ADD_OCCURRENCE': {
      const visit = state.visits[action.occurrence.pdvId]
      return {
        ...state,
        occurrences: [action.occurrence, ...state.occurrences],
        alerts: action.alert ? [action.alert, ...state.alerts] : state.alerts,
        visits: visit
          ? {
              ...state.visits,
              [action.occurrence.pdvId]: { ...visit, occurrenceIds: [...visit.occurrenceIds, action.occurrence.id] },
            }
          : state.visits,
      }
    }
    case 'SET_OCCURRENCE_STATUS':
      return {
        ...state,
        occurrences: state.occurrences.map((o) =>
          o.id === action.id
            ? { ...o, status: action.status, resolvedAt: action.status === 'Resolvida' ? Date.now() : undefined }
            : o,
        ),
      }
    case 'RESET':
      return createSeedState(state.session)
    case 'HYDRATE':
      return { ...action.state, session: state.session }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
  /** Ocorrências ainda não resolvidas. */
  activeOccurrences: Occurrence[]
  activeAlerts: (Alert & { occurrence: Occurrence })[]
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const toast = useToast()
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
    saveState(state)
  }, [state])

  useEffect(() => {
    saveSession(state.session)
  }, [state.session])

  // Sincroniza abas: gestor numa aba, promotor em outra.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_EVENT_KEY || !event.newValue) return
      const incoming = loadState()
      if (!incoming) return
      const known = new Set(stateRef.current.alerts.map((a) => a.id))
      const fresh = incoming.alerts.filter((a) => !known.has(a.id))
      dispatch({ type: 'HYDRATE', state: incoming })
      if (fresh.length > 0 && stateRef.current.session?.role === 'gestor') {
        toast.push({ tone: 'critical', title: 'Nova ruptura crítica', description: fresh[0].mensagem })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [toast])

  const resetDemo = useCallback(() => dispatch({ type: 'RESET' }), [])

  const value = useMemo<AppContextValue>(() => {
    const active = state.occurrences.filter((o) => o.status !== 'Resolvida')
    const byId = new Map(state.occurrences.map((o) => [o.id, o]))
    const activeAlerts = state.alerts
      .map((alert) => ({ ...alert, occurrence: byId.get(alert.occurrenceId) }))
      .filter((a): a is Alert & { occurrence: Occurrence } => Boolean(a.occurrence) && a.occurrence!.status !== 'Resolvida')
      .sort((a, b) => b.createdAt - a.createdAt)
    return { state, dispatch, activeOccurrences: active, activeAlerts, resetDemo }
  }, [state, resetDemo])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
