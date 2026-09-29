import { ArrowRight, ArrowUpRight, MoveVertical, Route as RouteIcon, ShieldAlert } from 'lucide-react'
import type { RankingDiff, Route, ScoredPDV } from '../types/prioritization'
import { PriorityBadge } from './PriorityBadge'

function Tile({ icon: Icon, value, label, tone }: { icon: typeof MoveVertical; value: number; label: string; tone: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span key={value} className="animate-pop-in text-3xl font-extrabold tabular-nums tracking-tight text-ink-900">
          {value}
        </span>
        <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-snug text-ink-600">{label}</p>
    </div>
  )
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export function ImpactPreview({
  diff,
  draft,
  appliedRoutes,
  draftRoutes,
}: {
  diff: RankingDiff
  draft: ScoredPDV[]
  appliedRoutes: Record<string, Route>
  draftRoutes: Record<string, Route>
}) {
  const routesChanged = Object.keys(draftRoutes).filter(
    (id) => draftRoutes[id].stops.map((s) => s.scored.pdv.id).join() !== appliedRoutes[id].stops.map((s) => s.scored.pdv.id).join(),
  ).length
  const byId = new Map(draft.map((item) => [item.pdv.id, item]))
  const movers = [...diff.changes]
    .filter((c) => c.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.to - b.to)
    .slice(0, 4)

  if (diff.moved === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-ink-700">Nenhuma mudança em relação ao perfil aplicado</p>
        <p className="mt-1 text-[13px] text-ink-500">Mova um peso ou escolha um modelo de estratégia para ver o impacto no ranking e nas rotas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[15px] font-bold text-ink-900">
        <span className="text-brand-600">{diff.moved}</span> {plural(diff.moved, 'PDV mudou', 'PDVs mudaram')} de posição
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <Tile icon={ArrowUpRight} value={diff.rose} label={plural(diff.rose, 'PDV subiu no ranking', 'PDVs subiram no ranking')} tone="bg-ok-50 text-ok-600" />
        <Tile icon={ShieldAlert} value={diff.newCritical} label={plural(diff.newCritical, 'PDV passou para prioridade crítica', 'PDVs passaram para prioridade crítica')} tone="bg-crit-50 text-crit-600" />
        <Tile icon={MoveVertical} value={diff.fell} label={plural(diff.fell, 'PDV desceu no ranking', 'PDVs desceram no ranking')} tone="bg-warn-50 text-warn-600" />
        <Tile icon={RouteIcon} value={routesChanged} label={plural(routesChanged, 'rota com sequência alterada', 'rotas com sequência alterada')} tone="bg-brand-50 text-brand-600" />
      </div>
      <div className="rounded-xl bg-ink-50 p-3">
        <p className="mb-2 text-xs font-semibold text-ink-500">Maiores movimentos</p>
        <ul className="space-y-1.5">
          {movers.map((change) => {
            const item = byId.get(change.pdvId)!
            return (
              <li key={change.pdvId} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="truncate font-semibold text-ink-800">{item.pdv.nome}</span>
                <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
                  <span className="text-ink-500">#{change.from}</span>
                  <ArrowRight className="size-3 text-ink-400" />
                  <span className={`font-extrabold ${change.delta > 0 ? 'text-ok-600' : 'text-crit-600'}`}>#{change.to}</span>
                  {change.nivelFrom !== change.nivelTo && <PriorityBadge nivel={change.nivelTo} />}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
