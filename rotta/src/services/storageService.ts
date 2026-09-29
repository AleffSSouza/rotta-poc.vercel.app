import type { AppState } from '../types/app'
import type { Session } from '../types/promoter'

const STORAGE_KEY = 'rotta:poc:v1'

export function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppState
    if (!parsed.profile?.weights || !parsed.visits || !Array.isArray(parsed.occurrences)) return null
    return parsed
  } catch {
    return null
  }
}

/** A sessão fica fora do localStorage compartilhado: cada aba tem o seu próprio login (sessionStorage). */
export function serializeState(state: AppState): string {
  return JSON.stringify({ ...state, session: null })
}

const SESSION_KEY = 'rotta:poc:session'

export function loadSession(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session | null) {
  try {
    if (session) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignorado
  }
}

export function saveState(state: AppState) {
  try {
    const serialized = serializeState(state)
    if (window.localStorage.getItem(STORAGE_KEY) !== serialized) {
      window.localStorage.setItem(STORAGE_KEY, serialized)
    }
  } catch {
    // Quota cheia ou modo privado: a demonstração continua funcionando em memória.
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignorado
  }
}

export const STORAGE_EVENT_KEY = STORAGE_KEY
