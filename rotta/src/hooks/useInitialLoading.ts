import { useEffect, useState } from 'react'

const seen = new Set<string>()

/** Mostra um esqueleto de carregamento só na primeira visita da tela (simula a chamada à API). */
export function useInitialLoading(key: string, ms = 450): boolean {
  const [loading, setLoading] = useState(!seen.has(key))
  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => {
      seen.add(key)
      setLoading(false)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [key, ms, loading])
  return loading
}
