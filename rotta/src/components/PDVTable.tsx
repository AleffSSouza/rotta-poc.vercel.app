import type { Promoter } from '../types/promoter'
import type { ScoredPDV } from '../types/prioritization'
import type { Visit } from '../types/occurrence'
import { PriorityBadge, VisitStatusBadge } from './PriorityBadge'
import { ScoreIndicator } from './ScoreIndicator'
import { formatKm } from '../utils/format'

export function PDVTable({ items, promoters, visits }: { items: ScoredPDV[]; promoters: Promoter[]; visits: Record<string, Visit> }) {
  const promoterById = new Map(promoters.map((p) => [p.id, p]))
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-y border-ink-100 bg-ink-50 text-xs font-semibold text-ink-500">
            <th className="w-12 px-4 py-2.5">#</th>
            <th className="px-3 py-2.5">PDV</th>
            <th className="px-3 py-2.5">Promotor</th>
            <th className="w-44 px-3 py-2.5">Score</th>
            <th className="px-3 py-2.5">Prioridade</th>
            <th className="px-3 py-2.5">Distância</th>
            <th className="px-3 py-2.5">Tempo médio</th>
            <th className="px-3 py-2.5">Ruptura (30 dias)</th>
            <th className="px-3 py-2.5">Criticidade</th>
            <th className="px-3 py-2.5">Visita</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.pdv.id} className="border-b border-ink-100 transition last:border-b-0 hover:bg-ink-50/70">
              <td className="px-4 py-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-ink-100 text-[13px] font-extrabold text-ink-600">{item.rank}</span>
              </td>
              <td className="px-3 py-3">
                <p className="font-semibold text-ink-900">{item.pdv.nome}</p>
                <p className="text-xs text-ink-500">{item.pdv.regiao}</p>
              </td>
              <td className="px-3 py-3 text-ink-700">{promoterById.get(item.pdv.promoterId)?.nome}</td>
              <td className="px-3 py-3">
                <ScoreIndicator item={item} />
              </td>
              <td className="px-3 py-3">
                <PriorityBadge nivel={item.nivel} />
              </td>
              <td className="px-3 py-3 tabular-nums text-ink-700">{formatKm(item.pdv.distanciaKm)}</td>
              <td className="px-3 py-3 tabular-nums text-ink-700">{item.pdv.tempoMedioMin} min</td>
              <td className="px-3 py-3 tabular-nums text-ink-700">{item.pdv.rupturas30d}</td>
              <td className="px-3 py-3 tabular-nums text-ink-700">{item.pdv.criticidade} de 5</td>
              <td className="px-3 py-3">
                <VisitStatusBadge value={visits[item.pdv.id]?.status ?? 'pendente'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
