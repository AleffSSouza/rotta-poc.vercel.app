import { Link } from 'react-router-dom'
import { AlertOctagon, ArrowRight, CheckCircle2, Clock, MapPin, SlidersHorizontal, Users } from 'lucide-react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { RankingTable } from '../components/RankingTable'
import { SLAIndicator } from '../components/SLAIndicator'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { useRankings } from '../hooks/useRankings'
import { useInitialLoading } from '../hooks/useInitialLoading'
import { PRIORITY_META } from '../utils/meta'
import type { VisitStatus } from '../types/occurrence'
import { formatClock } from '../utils/format'

const STATUS_COLORS: Record<VisitStatus, string> = {
  concluida: '#1f9d63',
  em_andamento: '#2b7fd6',
  pendente: '#b7c0ce',
  atrasada: '#d93a3a',
}
const STATUS_NAMES: Record<VisitStatus, string> = {
  concluida: 'Concluídas',
  em_andamento: 'Em andamento',
  pendente: 'Pendentes',
  atrasada: 'Atrasadas',
}
const PRIORITY_COLORS = { critico: '#d93a3a', alto: '#e39a12', medio: '#2b7fd6', baixo: '#8793a7' }

export default function DashboardPage() {
  const { state, activeOccurrences, activeAlerts } = useApp()
  const { pdvs, promoters, applied, previous, appliedDiff } = useRankings()
  const loading = useInitialLoading('dashboard')

  if (loading) return <PageSkeleton />

  const criticalOpen = activeOccurrences.filter((o) => o.criticidade === 'Crítica').length
  const avgVisit = Math.round(pdvs.reduce((sum, p) => sum + p.tempoMedioMin, 0) / pdvs.length)

  const statusOrder: VisitStatus[] = ['concluida', 'em_andamento', 'pendente', 'atrasada']
  const statusData = statusOrder.map((status) => ({
    status,
    name: STATUS_NAMES[status],
    value: pdvs.filter((p) => state.visits[p.id]?.status === status).length,
  }))
  const totalVisits = statusData.reduce((s, d) => s + d.value, 0)

  const priorityData = (['critico', 'alto', 'medio', 'baixo'] as const).map((nivel) => ({
    nivel,
    name: PRIORITY_META[nivel].label,
    value: applied.filter((item) => item.nivel === nivel).length,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        subtitle="Acompanhe a operação de campo e os PDVs que pedem visita primeiro."
        actions={
          <Link to="/gestor/perfis">
            <Button variant="secondary">
              <SlidersHorizontal className="size-4" />
              Ajustar pesos
            </Button>
          </Link>
        }
      />

      {state.lastAppliedAt && appliedDiff && (
        <div className="flex animate-fade-in flex-wrap items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-3.5">
          <CheckCircle2 className="size-5 shrink-0 text-brand-600" />
          <p className="text-sm text-brand-800">
            <b>Perfil {state.profile.nome} aplicado às {formatClock(new Date(state.lastAppliedAt))}.</b>{' '}
            {appliedDiff.moved} PDVs tiveram alteração de prioridade e as rotas dos promotores foram atualizadas.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={MapPin} label="PDVs em rota" value={pdvs.length} hint={`${promoters.length} rotas ativas hoje`} />
        <StatCard icon={Users} label="Promotores ativos" value={promoters.length} hint="Todos em campo" tone="ok" />
        <StatCard
          icon={AlertOctagon}
          label="Rupturas críticas"
          value={criticalOpen}
          hint={criticalOpen > 0 ? 'Aguardando resolução' : 'Nenhuma em aberto'}
          tone="crit"
          pulse={criticalOpen > 0}
        />
        <StatCard icon={Clock} label="Tempo médio de visita" value={`${avgVisit} min`} hint="Média histórica por PDV" tone="warn" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Status das visitas" subtitle="Situação das visitas de hoje" />
          <div className="flex flex-col items-center gap-3 px-5 pb-5 pt-2">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" innerRadius={54} outerRadius={80} paddingAngle={3} stroke="none" isAnimationActive={false}>
                    {statusData.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} visitas`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-ink-900 tabular-nums">{totalVisits}</span>
                <span className="text-xs text-ink-500">visitas</span>
              </div>
            </div>
            <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-2">
              {statusData.map((d) => (
                <li key={d.status} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-ink-600">
                    <span className="size-2.5 rounded-full" style={{ background: STATUS_COLORS[d.status] }} />
                    {d.name}
                  </span>
                  <span className="font-bold tabular-nums text-ink-900">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader title="PDVs por nível de prioridade" subtitle={`Perfil ativo: ${state.profile.nome}`} />
          <div className="h-64 px-3 pb-4 pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 16, right: 12, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5f6d85', fontSize: 12, fontWeight: 600 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8793a7', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(17,28,51,0.04)' }} formatter={(value) => [`${value} PDVs`, 'Quantidade']} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive={false} label={{ position: 'top', fill: '#1a2740', fontSize: 13, fontWeight: 700 }}>
                  {priorityData.map((d) => (
                    <Cell key={d.nivel} fill={PRIORITY_COLORS[d.nivel]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader title="Alertas ativos" subtitle="Rupturas críticas em aberto" />
          <div className="px-5 pb-5 pt-3">
            {activeAlerts.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Tudo sob controle" description="Nenhuma ruptura crítica aguardando resolução." />
            ) : (
              <ul className="space-y-2.5">
                {activeAlerts.slice(0, 4).map((alert) => (
                  <li key={alert.id} className="animate-fade-in rounded-xl border border-crit-100 bg-crit-50/50 p-3">
                    <p className="text-[13px] font-bold text-ink-900">{alert.occurrence.pdvNome}</p>
                    <p className="mb-1.5 text-xs text-ink-500">
                      {alert.occurrence.promotorNome} · {alert.occurrence.horario}
                    </p>
                    <SLAIndicator occurrence={alert.occurrence} compact />
                  </li>
                ))}
              </ul>
            )}
            {activeAlerts.length > 0 && (
              <Link to="/gestor/ocorrencias" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                Abrir ocorrências <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader
          title="PDVs prioritários"
          subtitle="O scoring define a prioridade. A ordem de visita é definida na roteirização."
          action={
            <Link to="/gestor/rota" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700">
              Ver rota e PDVs <ArrowRight className="size-3.5" />
            </Link>
          }
          className="pb-4"
        />
        <RankingTable
          items={applied}
          baseline={previous}
          limit={8}
          renderAction={() => (
            <Link to="/gestor/rota" className="inline-flex h-8 items-center rounded-lg border border-ink-200 px-3 text-[13px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-600">
              Ver rota
            </Link>
          )}
        />
      </Card>
    </div>
  )
}
