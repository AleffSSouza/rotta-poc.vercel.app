import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, VisitStatusBadge } from '../components/PriorityBadge'
import { Card } from '../components/ui/Card'
import { useApp } from '../context/AppContext'
import { useRankings } from '../hooks/useRankings'
import { formatKm, formatMin } from '../utils/format'
import { ROUTE_COLORS } from '../utils/meta'

export default function PromotersPage() {
  const { state } = useApp()
  const { promoters, appliedRoutes } = useRankings()

  return (
    <div>
      <PageHeader title="Promotores" subtitle="Acompanhe o progresso de cada promotor na rota de hoje." />
      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {promoters.map((promoter, index) => {
          const route = appliedRoutes[promoter.id]
          const done = route.stops.filter((s) => state.visits[s.scored.pdv.id]?.status === 'concluida').length
          const openOccurrences = state.occurrences.filter((o) => o.promoterId === promoter.id && o.status !== 'Resolvida').length
          const pct = Math.round((done / route.stops.length) * 100)
          return (
            <Card key={promoter.id} className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white" style={{ background: ROUTE_COLORS[index % ROUTE_COLORS.length] }}>
                  {promoter.iniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-ink-900">{promoter.nome}</h3>
                  <p className="text-[13px] text-ink-500">{promoter.regiao} · {promoter.baseNome}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-400">
                    <Phone className="size-3" />
                    {promoter.telefone}
                  </p>
                </div>
                {openOccurrences > 0 && (
                  <Link to="/gestor/ocorrencias" className="rounded-full bg-crit-50 px-2.5 py-1 text-xs font-bold text-crit-700 ring-1 ring-inset ring-crit-100">
                    {openOccurrences} {openOccurrences === 1 ? 'ocorrência' : 'ocorrências'}
                  </Link>
                )}
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink-600">Visitas concluídas</span>
                  <span className="font-extrabold tabular-nums text-ink-900">{done} de {route.stops.length}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-ok-500 transition-[width] duration-700" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{formatKm(route.totalKm)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{formatMin(route.totalMin)} de jornada</span>
                </div>
              </div>

              <ol className="mt-4 space-y-2">
                {route.stops.map((stop) => (
                  <li key={stop.scored.pdv.id} className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-ink-700 shadow-sm">{stop.order}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-ink-900">{stop.scored.pdv.nome}</p>
                      <p className="text-xs text-ink-500">Chegada {stop.eta}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PriorityBadge nivel={stop.scored.nivel} />
                      <VisitStatusBadge value={state.visits[stop.scored.pdv.id]?.status ?? 'pendente'} />
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/gestor/rota" className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                Ver rota no mapa <ArrowRight className="size-3.5" />
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
