import type { PDV } from '../types/pdv'
import type { Promoter } from '../types/promoter'
import type {
  Alert,
  Occurrence,
  OccurrenceSeverity,
  OccurrenceType,
} from '../types/occurrence'
import { formatClock } from '../utils/format'

/** Prazo de atendimento (SLA), em minutos, por criticidade da ocorrência. */
export const SLA_MINUTES: Record<OccurrenceSeverity, number> = {
  Crítica: 30,
  Alta: 60,
  Média: 120,
  Baixa: 240,
}

export const PRODUCT_OPTIONS = [
  'Achocolatado Nutrivale 400g',
  'Biscoito Recheado Nutrivale 130g',
  'Cereal Matinal Nutrivale 300g',
  'Suco Integral de Uva Nutrivale 1L',
]

export interface CreateOccurrenceInput {
  pdv: PDV
  promoter: Promoter
  tipo: OccurrenceType
  criticidade: OccurrenceSeverity
  produto: string
  observacao: string
  foto?: string
}

let counter = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter += 1)}`

/**
 * Registra uma ocorrência de ruptura. Ruptura crítica também gera um alerta automático.
 * É assíncrona de propósito: na versão de produção esta função chama a API REST.
 */
export async function createOccurrence(
  input: CreateOccurrenceInput,
): Promise<{ occurrence: Occurrence; alert: Alert | null }> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  const now = Date.now()
  const slaMinutos = SLA_MINUTES[input.criticidade]
  const occurrence: Occurrence = {
    id: uid('occ'),
    pdvId: input.pdv.id,
    pdvNome: input.pdv.nome,
    promoterId: input.promoter.id,
    promotorNome: input.promoter.nome,
    tipo: input.tipo,
    criticidade: input.criticidade,
    produto: input.produto,
    observacao: input.observacao,
    horario: formatClock(new Date(now)),
    createdAt: now,
    slaMinutos,
    slaDeadline: now + slaMinutos * 60_000,
    status: 'Aberta',
    foto: input.foto,
  }
  const alert: Alert | null =
    input.criticidade === 'Crítica'
      ? {
          id: uid('alert'),
          occurrenceId: occurrence.id,
          mensagem: `Ruptura crítica em ${input.pdv.nome}. Registrada por ${input.promoter.nome}.`,
          createdAt: now,
        }
      : null
  return { occurrence, alert }
}

/** Ocorrências e alertas iniciais da demonstração. Os prazos de SLA contam a partir do momento do carregamento. */
export function buildSeedOccurrences(now: number): { occurrences: Occurrence[]; alerts: Alert[] } {
  const remaining = (min: number, sec = 0) => now + min * 60_000 + sec * 1000
  const base = {
    observacao: '',
  }
  const occurrences: Occurrence[] = [
    {
      ...base,
      id: 'occ-seed-1',
      pdvId: 'pdv-01',
      pdvNome: 'Carrefour Vila Mariana',
      promoterId: 'p1',
      promotorNome: 'Diego Ramos',
      tipo: 'Ruptura de produto',
      criticidade: 'Crítica',
      produto: 'Achocolatado Nutrivale 400g',
      observacao: 'Gôndola sem estoque e sem reposição prevista para hoje.',
      horario: '14:32',
      createdAt: remaining(27, 42) - 30 * 60_000,
      slaMinutos: 30,
      slaDeadline: remaining(27, 42),
      status: 'Em atendimento',
    },
    {
      ...base,
      id: 'occ-seed-2',
      pdvId: 'pdv-05',
      pdvNome: 'Pão de Açúcar Pinheiros',
      promoterId: 'p2',
      promotorNome: 'Lucas Martins',
      tipo: 'Ruptura parcial',
      criticidade: 'Alta',
      produto: 'Biscoito Recheado Nutrivale 130g',
      observacao: 'Faltam dois sabores na gôndola principal.',
      horario: '13:48',
      createdAt: remaining(41, 10) - 60 * 60_000,
      slaMinutos: 60,
      slaDeadline: remaining(41, 10),
      status: 'Aberta',
    },
    {
      ...base,
      id: 'occ-seed-3',
      pdvId: 'pdv-07',
      pdvNome: 'Atacadão Barra Funda',
      promoterId: 'p2',
      promotorNome: 'Lucas Martins',
      tipo: 'Ruptura total',
      criticidade: 'Crítica',
      produto: 'Cereal Matinal Nutrivale 300g',
      observacao: 'Ponta de gôndola vazia durante a ação promocional.',
      horario: '14:05',
      createdAt: remaining(12, 38) - 30 * 60_000,
      slaMinutos: 30,
      slaDeadline: remaining(12, 38),
      status: 'Aberta',
    },
    {
      ...base,
      id: 'occ-seed-4',
      pdvId: 'pdv-10',
      pdvNome: 'Carrefour Tatuapé',
      promoterId: 'p3',
      promotorNome: 'Rafael Almeida',
      tipo: 'Ruptura total',
      criticidade: 'Crítica',
      produto: 'Suco Integral de Uva Nutrivale 1L',
      observacao: 'Sem produto no ponto e no estoque da loja.',
      horario: '14:11',
      createdAt: remaining(19, 5) - 30 * 60_000,
      slaMinutos: 30,
      slaDeadline: remaining(19, 5),
      status: 'Em atendimento',
    },
    {
      ...base,
      id: 'occ-seed-5',
      pdvId: 'pdv-06',
      pdvNome: 'Pão de Açúcar Vila Madalena',
      promoterId: 'p2',
      promotorNome: 'Lucas Martins',
      tipo: 'Ruptura parcial',
      criticidade: 'Baixa',
      produto: 'Achocolatado Nutrivale 400g',
      observacao: 'Apenas a embalagem de 200g em falta.',
      horario: '12:15',
      createdAt: remaining(178) - 240 * 60_000,
      slaMinutos: 240,
      slaDeadline: remaining(178),
      status: 'Aberta',
    },
    {
      ...base,
      id: 'occ-seed-6',
      pdvId: 'pdv-09',
      pdvNome: 'Extra Mooca',
      promoterId: 'p3',
      promotorNome: 'Rafael Almeida',
      tipo: 'Ruptura de produto',
      criticidade: 'Crítica',
      produto: 'Biscoito Recheado Nutrivale 130g',
      observacao: 'Reposição feita pelo fornecedor às 11h40.',
      horario: '11:05',
      createdAt: now - 3 * 3600_000,
      slaMinutos: 30,
      slaDeadline: now - 3 * 3600_000 + 30 * 60_000,
      status: 'Resolvida',
      resolvedAt: now - 3 * 3600_000 + 22 * 60_000,
    },
  ]
  const alerts: Alert[] = occurrences
    .filter((o) => o.criticidade === 'Crítica' && o.status !== 'Resolvida')
    .map((o) => ({
      id: `alert-${o.id}`,
      occurrenceId: o.id,
      mensagem: `Ruptura crítica em ${o.pdvNome}. Registrada por ${o.promotorNome}.`,
      createdAt: o.createdAt,
    }))
  return { occurrences, alerts }
}
