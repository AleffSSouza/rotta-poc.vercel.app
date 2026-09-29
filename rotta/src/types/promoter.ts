import type { GeoPoint } from './pdv'

export interface Promoter {
  id: string
  nome: string
  iniciais: string
  regiao: string
  baseNome: string
  base: GeoPoint
  telefone: string
}

export type UserRole = 'gestor' | 'promotor'

export interface MockUser {
  email: string
  senha: string
  nome: string
  cargo: string
  role: UserRole
  promoterId?: string
}

export interface Session {
  email: string
  nome: string
  cargo: string
  role: UserRole
  promoterId?: string
}
