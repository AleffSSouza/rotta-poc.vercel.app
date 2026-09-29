import type { LucideIcon } from 'lucide-react'
import { Card } from './ui/Card'

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  ok: 'bg-ok-50 text-ok-600',
  crit: 'bg-crit-50 text-crit-600',
  warn: 'bg-warn-50 text-warn-600',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'brand',
  pulse = false,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: keyof typeof TONES
  pulse?: boolean
}) {
  return (
    <Card className="p-5 transition hover:border-ink-200">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-500">{label}</span>
        <span className={`flex size-9 items-center justify-center rounded-xl ${TONES[tone]} ${pulse ? 'animate-pulse-ring' : ''}`}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </Card>
  )
}
