import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type ToastTone = 'success' | 'critical' | 'info' | 'warning'

export interface ToastInput {
  tone?: ToastTone
  title: string
  description?: string
  durationMs?: number
}

export interface ToastItem extends ToastInput {
  id: number
}

const TONES: Record<ToastTone, { icon: typeof Info; wrap: string; icon_: string }> = {
  success: { icon: CheckCircle2, wrap: 'border-ok-100', icon_: 'text-ok-500' },
  critical: { icon: XCircle, wrap: 'border-crit-100', icon_: 'text-crit-500' },
  warning: { icon: AlertTriangle, wrap: 'border-warn-100', icon_: 'text-warn-500' },
  info: { icon: Info, wrap: 'border-info-100', icon_: 'text-info-500' },
}

export function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:top-5 sm:bottom-auto sm:items-end"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone ?? 'success']
        const Icon = tone.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm animate-slide-in-right items-start gap-3 rounded-xl border bg-white p-3.5 shadow-pop ${tone.wrap}`}
          >
            <Icon className={`mt-0.5 size-5 shrink-0 ${tone.icon_}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{toast.description}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              aria-label="Fechar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
