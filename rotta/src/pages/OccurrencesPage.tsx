import { useState } from 'react'
import { CheckCircle2, Hand, ImageOff, Inbox } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { OccurrenceTable } from '../components/OccurrenceTable'
import { OccurrenceStatusBadge, SeverityBadge } from '../components/PriorityBadge'
import { SLAIndicator } from '../components/SLAIndicator'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useInitialLoading } from '../hooks/useInitialLoading'
import type { Occurrence, OccurrenceStatus } from '../types/occurrence'

type Filter = 'todas' | 'criticas' | 'abertas' | 'atendimento' | 'resolvidas'

const FILTERS: { id: Filter; label: string; test: (o: Occurrence) => boolean }[] = [
  { id: 'todas', label: 'Todas', test: () => true },
  { id: 'criticas', label: 'Críticas', test: (o) => o.criticidade === 'Crítica' && o.status !== 'Resolvida' },
  { id: 'abertas', label: 'Abertas', test: (o) => o.status === 'Aberta' },
  { id: 'atendimento', label: 'Em atendimento', test: (o) => o.status === 'Em atendimento' },
  { id: 'resolvidas', label: 'Resolvidas', test: (o) => o.status === 'Resolvida' },
]

export default function OccurrencesPage() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const loading = useInitialLoading('ocorrencias', 350)
  const [filter, setFilter] = useState<Filter>('todas')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loading) return <PageSkeleton />

  const current = FILTERS.find((f) => f.id === filter)!
  const visible = state.occurrences.filter(current.test)
  const selected = state.occurrences.find((o) => o.id === selectedId) ?? null

  const changeStatus = (id: string, status: OccurrenceStatus) => {
    const occurrence = state.occurrences.find((o) => o.id === id)
    dispatch({ type: 'SET_OCCURRENCE_STATUS', id, status })
    toast.push({
      tone: 'success',
      title: status === 'Resolvida' ? 'Ocorrência resolvida' : 'Ocorrência assumida',
      description: occurrence ? `${occurrence.pdvNome}: status alterado para ${status.toLowerCase()}.` : undefined,
    })
  }

  return (
    <div>
      <PageHeader title="Ocorrências" subtitle="Rupturas registradas pelos promotores, com o prazo de atendimento (SLA) de cada uma." />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 px-5 py-4" role="tablist" aria-label="Filtros">
          {FILTERS.map((f) => {
            const count = state.occurrences.filter(f.test).length
            const on = f.id === filter
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                }`}
              >
                {f.label}
                <span className={`rounded-md px-1.5 text-xs font-bold ${on ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600'}`}>{count}</span>
              </button>
            )
          })}
        </div>
        {visible.length === 0 ? (
          <EmptyState icon={Inbox} title="Nenhuma ocorrência neste filtro" description="Quando um promotor registrar uma ruptura, ela aparece aqui com o contador de SLA." />
        ) : (
          <OccurrenceTable occurrences={visible} onStatusChange={changeStatus} onSelect={(o) => setSelectedId(o.id)} />
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Detalhes da ocorrência"
        width="max-w-lg"
        footer={
          selected && (
            <>
              {selected.status === 'Aberta' && (
                <Button variant="secondary" onClick={() => changeStatus(selected.id, 'Em atendimento')}>
                  <Hand className="size-4" />
                  Assumir
                </Button>
              )}
              {selected.status === 'Em atendimento' && (
                <Button variant="success" onClick={() => changeStatus(selected.id, 'Resolvida')}>
                  <CheckCircle2 className="size-4" />
                  Resolver
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedId(null)}>
                Fechar
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-base font-extrabold text-ink-900">{selected.pdvNome}</p>
              <p className="text-[13px] text-ink-500">Registrada por {selected.promotorNome} às {selected.horario}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge value={selected.criticidade} />
              <OccurrenceStatusBadge value={selected.status} />
              <span className="text-xs text-ink-500">{selected.tipo}</span>
            </div>
            <div className="rounded-xl bg-ink-50 p-3.5">
              <p className="text-xs font-semibold text-ink-500">Prazo de atendimento ({selected.slaMinutos} min)</p>
              <div className="mt-1.5">
                <SLAIndicator occurrence={selected} />
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-ink-500">Produto</dt>
                <dd className="text-ink-800">{selected.produto}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-500">Observação</dt>
                <dd className="text-ink-800">{selected.observacao || 'Sem observação.'}</dd>
              </div>
              <div>
                <dt className="mb-1.5 text-xs font-semibold text-ink-500">Foto</dt>
                <dd>
                  {selected.foto ? (
                    <img src={selected.foto} alt="Foto da gôndola enviada pelo promotor" className="h-44 w-full rounded-xl border border-ink-100 object-cover" />
                  ) : (
                    <div className="flex h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 text-[13px] text-ink-400">
                      <ImageOff className="size-4" />
                      Sem foto anexada
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  )
}
