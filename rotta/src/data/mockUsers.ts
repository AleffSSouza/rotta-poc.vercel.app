import type { MockUser } from '../types/promoter'

export const mockUsers: MockUser[] = [
  {
    email: 'gestor@rotta.com',
    senha: '123456',
    nome: 'Marina Duarte',
    cargo: 'Gestora de Trade Marketing',
    role: 'gestor',
  },
  {
    email: 'promotor@rotta.com',
    senha: '123456',
    nome: 'Diego Ramos',
    cargo: 'Promotor de campo',
    role: 'promotor',
    promoterId: 'p1',
  },
]

export const COMPANY_NAME = 'Nutrivale Alimentos'
