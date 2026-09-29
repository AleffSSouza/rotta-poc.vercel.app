import type { PriorityLevel, WeightKey } from '../types/prioritization'
import type { OccurrenceSeverity, OccurrenceStatus, VisitStatus } from '../types/occurrence'

export const VARIABLES: Record<WeightKey, { label: string; short: string; color: string; hint: string; direction: string }> = {
  atendimento: {
    label: 'Tempo médio de atendimento',
    short: 'Atendimento',
    color: 'var(--color-var-atendimento)',
    hint: 'Quanto tempo o promotor costuma levar no PDV. Lojas de visita longa têm maior impacto na jornada.',
    direction: 'Maior tempo, maior prioridade',
  },
  distancia: {
    label: 'Distância',
    short: 'Distância',
    color: 'var(--color-var-distancia)',
    hint: 'Distância do ponto de partida do promotor até o PDV. Quanto mais perto, maior a nota.',
    direction: 'Menor distância, maior prioridade',
  },
  ruptura: {
    label: 'Histórico de ruptura',
    short: 'Ruptura',
    color: 'var(--color-var-ruptura)',
    hint: 'Rupturas registradas no PDV nos últimos 30 dias. Mais rupturas pedem visita mais cedo.',
    direction: 'Mais rupturas, maior prioridade',
  },
  criticidade: {
    label: 'Criticidade estratégica',
    short: 'Criticidade',
    color: 'var(--color-var-criticidade)',
    hint: 'Importância comercial do PDV, definida pelo gestor de 1 a 5.',
    direction: 'Maior criticidade, maior prioridade',
  },
}

export const PRIORITY_META: Record<PriorityLevel, { label: string; badge: string; dot: string }> = {
  critico: { label: 'Crítico', badge: 'bg-crit-50 text-crit-700 ring-crit-100', dot: 'bg-crit-500' },
  alto: { label: 'Alto', badge: 'bg-warn-50 text-warn-700 ring-warn-100', dot: 'bg-warn-500' },
  medio: { label: 'Médio', badge: 'bg-info-50 text-info-600 ring-info-100', dot: 'bg-info-500' },
  baixo: { label: 'Baixo', badge: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'bg-ink-400' },
}

export const SEVERITY_META: Record<OccurrenceSeverity, string> = {
  Crítica: 'bg-crit-50 text-crit-700 ring-crit-100',
  Alta: 'bg-warn-50 text-warn-700 ring-warn-100',
  Média: 'bg-info-50 text-info-600 ring-info-100',
  Baixa: 'bg-ink-100 text-ink-600 ring-ink-200',
}

export const OCCURRENCE_STATUS_META: Record<OccurrenceStatus, string> = {
  Aberta: 'bg-crit-50 text-crit-700 ring-crit-100',
  'Em atendimento': 'bg-warn-50 text-warn-700 ring-warn-100',
  Resolvida: 'bg-ok-50 text-ok-700 ring-ok-100',
}

export const VISIT_STATUS_META: Record<VisitStatus, { label: string; badge: string }> = {
  concluida: { label: 'Concluída', badge: 'bg-ok-50 text-ok-700 ring-ok-100' },
  em_andamento: { label: 'Em andamento', badge: 'bg-info-50 text-info-600 ring-info-100' },
  pendente: { label: 'Pendente', badge: 'bg-ink-100 text-ink-600 ring-ink-200' },
  atrasada: { label: 'Atrasada', badge: 'bg-crit-50 text-crit-700 ring-crit-100' },
}

export const ROUTE_COLORS = ['#3b4ee6', '#14a3b8', '#8a4fd6']
