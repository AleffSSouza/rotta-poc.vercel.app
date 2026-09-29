import { CheckCircle2, ChevronRight, Hand } from 'lucide-react'
import type { Occurrence, OccurrenceStatus } from '../types/occurrence'
import { OccurrenceStatusBadge, SeverityBadge } from './PriorityBadge'
import { SLAIndicator } from './SLAIndicator'
import { Button } from './ui/Button'

export function OccurrenceTable({
  occurrences,
  onStatusChange,
  onSelect,
}: {
  occurrences: Occurrence[]
  onStatusChange: (id: string, status: OccurrenceStatus) => void
  onSelect: (occurrence: Occurrence) => void
}) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead>
          <tr className="border-y border-ink-100 bg-ink-50 text-xs font-semibold text-ink-500">
            <th className="px-5 py-2.5">PDV</th>
            <th className="px-3 py-2.5">Promotor</th>
            <th className="px-3 py-2.5">Tipo</th>
            <th className="px-3 py-2.5">Criticidade</th>
            <th className="px-3 py-2.5">Horário</th>
            <th className="px-3 py-2.5">SLA</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-5 py-2.5 text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {occurrences.map((occurrence) => (
            <tr key={occurrence.id} className="animate-fade-in border-b border-ink-100 transition last:border-b-0 hover:bg-ink-50/70">
              <td className="px-5 py-3">
                <button onClick={() => onSelect(occurrence)} className="group flex items-center gap-1 text-left font-semibold text-ink-900 hover:text-brand-600">
                  {occurrence.pdvNome}
                  <ChevronRight className="size-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                </button>
                <p className="text-xs text-ink-500">{occurrence.produto}</p>
              </td>
              <td className="px-3 py-3 text-ink-700">{occurrence.promotorNome}</td>
              <td className="px-3 py-3 text-ink-700">{occurrence.tipo}</td>
              <td className="px-3 py-3">
                <SeverityBadge value={occurrence.criticidade} />
              </td>
              <td className="px-3 py-3 tabular-nums text-ink-700">{occurrence.horario}</td>
              <td className="px-3 py-3">
                <div className="mb-1 text-xs text-ink-500">Prazo de {occurrence.slaMinutos} min</div>
                <SLAIndicator occurrence={occurrence} />
              </td>
              <td className="px-3 py-3">
                <OccurrenceStatusBadge value={occurrence.status} />
              </td>
              <td className="px-5 py-3 text-right">
                {occurrence.status === 'Aberta' && (
                  <Button size="sm" variant="secondary" onClick={() => onStatusChange(occurrence.id, 'Em atendimento')}>
                    <Hand className="size-3.5" />
                    Assumir
                  </Button>
                )}
                {occurrence.status === 'Em atendimento' && (
                  <Button size="sm" variant="success" onClick={() => onStatusChange(occurrence.id, 'Resolvida')}>
                    <CheckCircle2 className="size-3.5" />
                    Resolver
                  </Button>
                )}
                {occurrence.status === 'Resolvida' && <span className="text-xs font-medium text-ink-400">Encerrada</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
