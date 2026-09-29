import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastViewport, type ToastItem, type ToastInput } from '../components/ui/Toast'

interface ToastApi {
  push: (toast: ToastInput) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (toast: ToastInput) => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current.slice(-3), { ...toast, id }])
      window.setTimeout(() => dismiss(id), toast.durationMs ?? 4200)
    },
    [dismiss],
  )

  const api = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
