import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { ScoredPDV } from '../types/prioritization'
import { PriorityBadge } from './PriorityBadge'
import { ScoreIndicator } from './ScoreIndicator'

type Variant = 'full' | 'compact'

interface Props {
  items: ScoredPDV[]
  /** Ranking de comparação. Quando informado, cada linha mostra quantas posições subiu ou desceu. */
  baseline?: ScoredPDV[] | null
  variant?: Variant
  limit?: number
  renderAction?: (item: ScoredPDV) => ReactNode
  /** Destaca uma linha (por exemplo, o PDV da demonstração). */
  highlightId?: string
}

const GRID: Record<Variant, string> = {
  full: 'grid-cols-[48px_minmax(190px,1.6fr)_minmax(110px,0.9fr)_minmax(150px,1.3fr)_96px_92px_100px_96px]',
  compact: 'grid-cols-[44px_minmax(150px,1.4fr)_minmax(120px,1fr)_88px_72px]',
}
const MIN_WIDTH: Record<Variant, string> = { full: 'min-w-[900px]', compact: 'min-w-[560px]' }

/** Animação FLIP: quando a ordem muda, cada linha desliza da posição antiga para a nova. */
function useFlip(orderKey: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tops = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rows = container.querySelectorAll<HTMLElement>('[data-flip-id]')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rows.forEach((row) => {
      const id = row.dataset.flipId!
      const newTop = row.offsetTop
      const oldTop = tops.current.get(id)
      if (oldTop !== undefined && oldTop !== newTop && !reduced && typeof row.animate === 'function') {
        row.animate(
          [
            { transform: `translateY(${oldTop - newTop}px)`, backgroundColor: 'rgba(59,78,230,0.14)' },
            { transform: 'translateY(0)', backgroundColor: 'rgba(59,78,230,0.06)', offset: 0.7 },
            { transform: 'translateY(0)', backgroundColor: 'rgba(59,78,230,0)' },
          ],
          { duration: 900, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        )
      }
      tops.current.set(id, newTop)
    })
  }, [orderKey])

  return containerRef
}

function Delta({ delta }: { delta: number | null }) {
  if (delta === null) return null
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-400">
        <Minus className="size-3.5" />
      </span>
    )
  }
  const up = delta > 0
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${up ? 'bg-ok-50 text-ok-700' : 'bg-crit-50 text-crit-700'}`}>
      {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {Math.abs(delta)}
    </span>
  )
}

function CriticalityDots({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-[3px]" title={`Criticidade estratégica ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-3.5 w-1.5 rounded-sm ${n <= value ? 'bg-var-criticidade' : 'bg-ink-100'}`} />
      ))}
    </span>
  )
}

export function RankingTable({ items, baseline, variant = 'full', limit, renderAction, highlightId }: Props) {
  const shown = limit ? items.slice(0, limit) : items
  const orderKey = shown.map((item) => item.pdv.id).join(',')
  const containerRef = useFlip(orderKey)
  const baselineRank = new Map((baseline ?? []).map((item) => [item.pdv.id, item.rank]))
  const rowHeight = variant === 'full' ? 'h-[60px]' : 'h-[56px]'

  return (
    <div className="overflow-x-auto scroll-thin">
      <div className={MIN_WIDTH[variant]}>
        <div className={`grid ${GRID[variant]} items-center gap-3 border-y border-ink-100 bg-ink-50 px-4 py-2.5 text-xs font-semibold text-ink-500`}>
          <span>#</span>
          <span>PDV</span>
          {variant === 'full' && <span>Região</span>}
          <span>Score</span>
          <span>Prioridade</span>
          {variant === 'full' && <span>Ruptura</span>}
          {variant === 'full' && <span>Criticidade</span>}
          <span>{variant === 'full' ? 'Ação' : 'Variação'}</span>
        </div>
        <div ref={containerRef} className="relative">
          {shown.map((item) => {
            const from = baselineRank.get(item.pdv.id)
            const delta = baseline && from !== undefined ? from - item.rank : null
            return (
              <div
                key={item.pdv.id}
                data-flip-id={item.pdv.id}
                className={`grid ${GRID[variant]} ${rowHeight} items-center gap-3 border-b border-ink-100 px-4 text-sm last:border-b-0 ${
                  highlightId === item.pdv.id ? 'bg-brand-50/60' : 'bg-white'
                }`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-lg text-[13px] font-extrabold tabular-nums ${
                    item.rank <= 3 ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {item.rank}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                    <span className="truncate">{item.pdv.nome}</span>
                    {variant === 'full' && delta !== null && delta !== 0 && <Delta delta={delta} />}
                  </p>
                  <p className="truncate text-xs text-ink-500">{variant === 'compact' ? item.motivo : item.pdv.rede}</p>
                </div>
                {variant === 'full' && <span className="truncate text-ink-600">{item.pdv.regiao}</span>}
                <ScoreIndicator item={item} />
                <div>
                  <PriorityBadge nivel={item.nivel} />
                </div>
                {variant === 'full' && (
                  <span className="text-ink-700">
                    <span className={`font-bold tabular-nums ${item.pdv.rupturas30d >= 9 ? 'text-crit-600' : ''}`}>{item.pdv.rupturas30d}</span>
                    <span className="text-xs text-ink-400"> em 30 dias</span>
                  </span>
                )}
                {variant === 'full' && <CriticalityDots value={item.pdv.criticidade} />}
                {variant === 'full' ? <div>{renderAction?.(item)}</div> : <Delta delta={delta} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { Delta }
