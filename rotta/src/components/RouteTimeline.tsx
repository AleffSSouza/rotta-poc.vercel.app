import { ArrowUp, Flag, Home } from 'lucide-react'
import type { Promoter } from '../types/promoter'
import type { Route } from '../types/prioritization'
import { PriorityBadge } from './PriorityBadge'
import { formatKm, formatMin } from '../utils/format'

/** Sequência de visita sugerida. Quando há uma rota anterior, marca as paradas que foram antecipadas. */
export function RouteTimeline({
  route,
  promoter,
  previousRoute,
  showSummary = true,
}: {
  route: Route
  promoter: Promoter
  previousRoute?: Route | null
  showSummary?: boolean
}) {
  const previousOrder = new Map((previousRoute?.stops ?? []).map((s) => [s.scored.pdv.id, s.order]))
  const savedKm = Math.round((route.proximityKm - route.totalKm) * 10) / 10

  return (
    <div>
      {showSummary && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-ink-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-ink-500">Deslocamento</p>
            <p className="whitespace-nowrap text-[15px] font-extrabold tabular-nums text-ink-900">{formatKm(route.totalKm)}</p>
          </div>
          <div className="rounded-xl bg-ink-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-ink-500">Jornada</p>
            <p className="whitespace-nowrap text-[15px] font-extrabold tabular-nums text-ink-900">{formatMin(route.totalMin)}</p>
          </div>
          <div className="rounded-xl bg-ink-50 px-3 py-2.5" title="Comparado a uma rota que sempre vai ao PDV mais próximo">
            <p className="text-[11px] font-semibold text-ink-500">Vs. proximidade</p>
            <p className={`whitespace-nowrap text-[15px] font-extrabold tabular-nums ${savedKm >= 0 ? 'text-ok-600' : 'text-warn-600'}`}>
              {savedKm >= 0 ? '-' : '+'}
              {formatKm(Math.abs(savedKm))}
            </p>
          </div>
        </div>
      )}
      <ol className="relative">
        <li className="relative flex gap-3 pb-4">
          <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-ink-200" />
          <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
            <Home className="size-4" />
          </span>
          <div className="pt-1">
            <p className="text-sm font-bold text-ink-900">{promoter.baseNome}</p>
            <p className="text-xs text-ink-500">Saída às 08:00 · {promoter.nome}</p>
          </div>
        </li>
        {route.stops.map((stop, index) => {
          const before = previousOrder.get(stop.scored.pdv.id)
          const moved = before !== undefined ? before - stop.order : 0
          const last = index === route.stops.length - 1
          return (
            <li key={stop.scored.pdv.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-ink-200" />}
              <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white ring-4 ring-white">
                {stop.order}
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 transition hover:border-ink-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-ink-900">{stop.scored.pdv.nome}</p>
                  <div className="flex items-center gap-1.5">
                    {moved > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-ok-50 px-1.5 py-0.5 text-[11px] font-bold text-ok-700">
                        <ArrowUp className="size-3" />
                        antecipada
                      </span>
                    )}
                    <PriorityBadge nivel={stop.scored.nivel} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Score <b className="text-ink-800">{Math.round(stop.scored.score)}</b> · #{stop.scored.rank} no ranking · chegada {stop.eta}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {formatKm(stop.legKm)} de deslocamento ({formatMin(stop.legMin)}) · visita de {formatMin(stop.visitMin)}
                </p>
              </div>
            </li>
          )
        })}
        <li className="mt-3 flex items-center gap-3 pl-0.5 text-xs font-semibold text-ink-400">
          <Flag className="size-4" />
          Fim da rota
        </li>
      </ol>
    </div>
  )
}
