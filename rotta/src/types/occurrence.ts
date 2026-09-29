export type OccurrenceType = 'Ruptura total' | 'Ruptura parcial' | 'Ruptura de produto'
export type OccurrenceSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type OccurrenceStatus = 'Aberta' | 'Em atendimento' | 'Resolvida'

export interface Occurrence {
  id: string
  pdvId: string
  pdvNome: string
  promoterId: string
  promotorNome: string
  tipo: OccurrenceType
  criticidade: OccurrenceSeverity
  produto: string
  observacao: string
  /** Horário do registro (HH:mm). */
  horario: string
  createdAt: number
  slaMinutos: number
  /** Instante (ms) em que o SLA vence. */
  slaDeadline: number
  status: OccurrenceStatus
  resolvedAt?: number
  /** Miniatura da foto (data URI). */
  foto?: string
}

export interface Alert {
  id: string
  occurrenceId: string
  mensagem: string
  createdAt: number
}

export type VisitStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada'

export interface Visit {
  status: VisitStatus
  checkinAt?: string
  finishedAt?: string
  checklist: boolean[]
  occurrenceIds: string[]
}
