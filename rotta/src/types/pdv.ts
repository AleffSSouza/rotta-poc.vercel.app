export interface GeoPoint {
  lat: number
  lng: number
}

/** Ponto de venda (PDV) atendido pelos promotores. */
export interface PDV {
  id: string
  nome: string
  rede: string
  regiao: string
  endereco: string
  location: GeoPoint
  promoterId: string
  /** Tempo médio histórico de atendimento, em minutos. */
  tempoMedioMin: number
  /** Rupturas registradas nos últimos 30 dias. */
  rupturas30d: number
  /** Criticidade estratégica definida pelo gestor (1 a 5). */
  criticidade: number
  /** Distância viária estimada do ponto de partida do promotor, em km. */
  distanciaKm: number
}
