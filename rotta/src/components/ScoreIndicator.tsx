import type { ScoredPDV } from '../types/prioritization'
import { WEIGHT_KEYS } from '../services/scoringService'
import { VARIABLES } from '../utils/meta'

/** Barra do score dividida por variável: mostra quanto cada critério contribuiu para a nota. */
export function ScoreIndicator({ item, showValue = true, className = '' }: { item: ScoredPDV; showValue?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showValue && <span className="w-7 text-right text-sm font-extrabold tabular-nums text-ink-900">{Math.round(item.score)}</span>}
      <div className="h-2.5 min-w-16 flex-1 overflow-hidden rounded-full bg-ink-100" title={`Score ${item.score.toFixed(1)}`}>
        <div className="flex h-full transition-[width] duration-500 ease-out" style={{ width: `${item.score}%` }}>
          {WEIGHT_KEYS.map((key) => (
            <div
              key={key}
              className="h-full transition-[width] duration-500 ease-out"
              style={{
                width: item.score > 0 ? `${(item.contributions[key] / item.score) * 100}%` : 0,
                background: VARIABLES[key].color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ScoreLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
      {WEIGHT_KEYS.map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: VARIABLES[key].color }} />
          {VARIABLES[key].short}
        </span>
      ))}
    </div>
  )
}
