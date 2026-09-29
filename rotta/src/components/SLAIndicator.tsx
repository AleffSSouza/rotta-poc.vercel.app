import { CheckCircle2, Clock, TimerOff } from 'lucide-react'
import { useNow } from '../hooks/useNow'
import type { Occurrence } from '../types/occurrence'
import { formatCountdown } from '../utils/format'

export function SLAIndicator({ occurrence, compact = false }: { occurrence: Occurrence; compact?: boolean }) {
  const now = useNow()

  if (occurrence.status === 'Resolvida') {
    const within = (occurrence.resolvedAt ?? occurrence.slaDeadline) <= occurrence.slaDeadline
    return (
      <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${within ? 'text-ok-600' : 'text-warn-600'}`}>
        <CheckCircle2 className="size-4" />
        {within ? 'Dentro do SLA' : 'Fora do SLA'}
      </span>
    )
  }

  const remaining = occurrence.slaDeadline - now
  const total = occurrence.slaMinutos * 60_000
  const ratio = remaining / total
  const overdue = remaining <= 0
  const tone = overdue ? 'text-crit-600' : ratio < 0.3 ? 'text-crit-600' : ratio < 0.6 ? 'text-warn-600' : 'text-ok-600'
  const bar = overdue ? 'bg-crit-500' : ratio < 0.3 ? 'bg-crit-500' : ratio < 0.6 ? 'bg-warn-500' : 'bg-ok-500'
  const Icon = overdue ? TimerOff : Clock

  return (
    <div className="min-w-[128px]">
      <span className={`inline-flex items-center gap-1.5 text-[13px] font-bold tabular-nums ${tone}`}>
        <Icon className="size-4" />
        {overdue ? `Estourado há ${formatCountdown(-remaining)}` : `${formatCountdown(remaining)} restantes`}
      </span>
      {!compact && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100">
          <div className={`h-full rounded-full transition-[width] duration-1000 ${bar}`} style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }} />
        </div>
      )}
    </div>
  )
}
