import { useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { useRankings } from '../hooks/useRankings'
import { formatKm } from '../utils/format'

type Tab = 'pdvs' | 'promotores'

export default function RegistryPage() {
  const { pdvs, promoters } = useRankings()
  const [tab, setTab] = useState<Tab>('pdvs')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const promoterName = (id: string) => promoters.find((p) => p.id === id)?.nome ?? '-'

  const pdvRows = pdvs.filter((p) => !q || `${p.nome} ${p.rede} ${p.regiao} ${promoterName(p.promoterId)}`.toLowerCase().includes(q))
  const promoterRows = promoters.filter((p) => !q || `${p.nome} ${p.regiao} ${p.baseNome}`.toLowerCase().includes(q))
  const empty = tab === 'pdvs' ? pdvRows.length === 0 : promoterRows.length === 0

  return (
    <div>
      <PageHeader title="Cadastros" subtitle="Base de PDVs e promotores usada pelo motor de priorização. Nesta POC, somente leitura." />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex rounded-xl bg-ink-100 p-1" role="tablist">
            {(['pdvs', 'promotores'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold transition ${tab === t ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}
              >
                {t === 'pdvs' ? `PDVs (${pdvs.length})` : `Promotores (${promoters.length})`}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'pdvs' ? 'Buscar por nome, rede ou região' : 'Buscar por nome ou região'}
              aria-label="Buscar"
              className="h-10 w-full rounded-xl border border-ink-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>

        {empty ? (
          <EmptyState icon={SearchX} title="Nada encontrado" description="Tente outro termo de busca." />
        ) : tab === 'pdvs' ? (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-y border-ink-100 bg-ink-50 text-xs font-semibold text-ink-500">
                  <th className="px-5 py-2.5">PDV</th>
                  <th className="px-3 py-2.5">Rede</th>
                  <th className="px-3 py-2.5">Região</th>
                  <th className="px-3 py-2.5">Endereço</th>
                  <th className="px-3 py-2.5">Promotor</th>
                  <th className="px-3 py-2.5">Tempo médio</th>
                  <th className="px-3 py-2.5">Distância da base</th>
                  <th className="px-5 py-2.5">Criticidade</th>
                </tr>
              </thead>
              <tbody>
                {pdvRows.map((p) => (
                  <tr key={p.id} className="border-b border-ink-100 last:border-b-0 hover:bg-ink-50/70">
                    <td className="px-5 py-3 font-semibold text-ink-900">{p.nome}</td>
                    <td className="px-3 py-3 text-ink-700">{p.rede}</td>
                    <td className="px-3 py-3 text-ink-700">{p.regiao}</td>
                    <td className="px-3 py-3 text-ink-500">{p.endereco}</td>
                    <td className="px-3 py-3 text-ink-700">{promoterName(p.promoterId)}</td>
                    <td className="px-3 py-3 tabular-nums text-ink-700">{p.tempoMedioMin} min</td>
                    <td className="px-3 py-3 tabular-nums text-ink-700">{formatKm(p.distanciaKm)}</td>
                    <td className="px-5 py-3 tabular-nums text-ink-700">{p.criticidade} de 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-y border-ink-100 bg-ink-50 text-xs font-semibold text-ink-500">
                  <th className="px-5 py-2.5">Promotor</th>
                  <th className="px-3 py-2.5">Região</th>
                  <th className="px-3 py-2.5">Base de saída</th>
                  <th className="px-3 py-2.5">Telefone</th>
                  <th className="px-5 py-2.5">PDVs atribuídos</th>
                </tr>
              </thead>
              <tbody>
                {promoterRows.map((p) => (
                  <tr key={p.id} className="border-b border-ink-100 last:border-b-0 hover:bg-ink-50/70">
                    <td className="px-5 py-3 font-semibold text-ink-900">{p.nome}</td>
                    <td className="px-3 py-3 text-ink-700">{p.regiao}</td>
                    <td className="px-3 py-3 text-ink-700">{p.baseNome}</td>
                    <td className="px-3 py-3 text-ink-700">{p.telefone}</td>
                    <td className="px-5 py-3 tabular-nums text-ink-700">{pdvs.filter((x) => x.promoterId === p.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
