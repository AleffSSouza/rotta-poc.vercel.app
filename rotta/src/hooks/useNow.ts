import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let timer: number | undefined
let snapshot = Date.now()

function subscribe(callback: () => void) {
  listeners.add(callback)
  snapshot = Date.now()
  if (timer === undefined) {
    timer = window.setInterval(() => {
      snapshot = Date.now()
      listeners.forEach((listener) => listener())
    }, 1000)
  }
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}

/** Relógio compartilhado (1 tick por segundo) usado pelos contadores de SLA. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
}
