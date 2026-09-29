import { ArrowDown, ArrowUp } from 'lucide-react'
import type { WeightKey } from '../types/prioritization'
import { VARIABLES } from '../utils/meta'
import { Tooltip } from './ui/Tooltip'

export function WeightSlider({
  variable,
  value,
  applied,
  onChange,
}: {
  variable: WeightKey
  value: number
  /** Peso do perfil vigente, para mostrar a diferença. */
  applied: number
  onChange: (value: number) => void
}) {
  const meta = VARIABLES[variable]
  const diff = value - applied
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 transition hover:border-ink-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: meta.color }} />
            <label htmlFor={`weight-${variable}`} className="text-sm font-bold text-ink-900">
              {meta.label}
            </label>
            <Tooltip text={meta.hint} />
          </div>
          <p className="mt-0.5 pl-4 text-xs text-ink-500">{meta.direction}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold tabular-nums tracking-tight text-ink-900">{value}%</span>
          <div className="h-4">
            {diff !== 0 && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${diff > 0 ? 'text-ok-600' : 'text-crit-600'}`}
                title="Diferença em relação ao perfil aplicado"
              >
                {diff > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {Math.abs(diff)} p.p.
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="relative mt-3">
        <input
          id={`weight-${variable}`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="weight-range"
          style={{ '--track-color': meta.color, '--fill': `${value}%` } as React.CSSProperties}
          aria-valuetext={`${value} por cento`}
        />
        {diff !== 0 && (
          <span
            className="pointer-events-none absolute -bottom-2 h-2.5 w-0.5 -translate-x-1/2 rounded bg-ink-400"
            style={{ left: `calc(${applied}% + ${(0.5 - applied / 100) * 22}px)` }}
            title={`Perfil aplicado: ${applied}%`}
          />
        )}
      </div>
    </div>
  )
}
