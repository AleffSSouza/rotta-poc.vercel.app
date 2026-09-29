import { useState } from 'react'
import { ArrowRight, ListOrdered, Route as RouteIcon } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { RouteMap } from '../components/RouteMap'
import { RouteTimeline } from '../components/RouteTimeline'
import { PDVTable } from '../components/PDVTable'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Card, CardHeader } from '../components/ui/Card'
import { useApp } from '../context/AppContext'
import { useRankings } from '../hooks/useRankings'
import { useInitialLoading } from '../hooks/useInitialLoading'
import { ROUTE_COLORS } from '../utils/meta'

export default function RoutePage() {
  const { state } = useApp()
  const { promoters, applied, appliedRoutes, previousRoutes } = useRankings()
  const [promoterId, setPromoterId] = useState(promoters[0].id)
  const loading = useInitialLoading('rota')

  if (loading) return <PageSkeleton />

  const index = promoters.findIndex((p) => p.id === promoterId)
  const promoter = promoters[index]

  return (
    <div className="space-y-5">
      <PageHeader title="Rota e PDVs" subtitle={`Rotas geradas com o perfil ${state.profile.nome}.`} />

      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ListOrdered className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">Scoring define prioridade</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-500">Cada PDV recebe uma nota de 0 a 100 conforme os pesos do perfil ativo.</p>
          </div>
        </div>
        <div className="hidden items-center justify-center text-ink-300 md:flex">
          <ArrowRight className="size-5" />
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <RouteIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">Roteirização define sequência de visita</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-500">A ordem considera o score e evita deslocamentos longos entre uma parada e outra.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Promotor">
        {promoters.map((p, i) => {
          const on = p.id === promoterId
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={on}
              onClick={() => setPromoterId(p.id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                on ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
              }`}
            >
              <span className="size-2.5 rounded-full" style={{ background: ROUTE_COLORS[i % ROUTE_COLORS.length] }} />
              {p.nome}
              <span className={`text-xs font-medium ${on ? 'text-ink-300' : 'text-ink-400'}`}>{p.regiao}</span>
            </button>
          )
        })}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_400px]">
        <RouteMap promoters={promoters} routes={appliedRoutes} selectedId={promoterId} visits={state.visits} />
        <Card>
          <CardHeader title={`Sequência de ${promoter.nome.split(' ')[0]}`} subtitle={`${promoter.regiao} · saída da ${promoter.baseNome}`} />
          <div className="p-5">
            <RouteTimeline route={appliedRoutes[promoterId]} promoter={promoter} previousRoute={previousRoutes?.[promoterId]} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Todos os PDVs" subtitle="Ordenados por score, com a situação da visita de hoje." className="pb-4" />
        <PDVTable items={applied} promoters={promoters} visits={state.visits} />
      </Card>
    </div>
  )
}
