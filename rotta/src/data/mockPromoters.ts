import type { Promoter } from '../types/promoter'

/** Promotores da demonstração. Cada um parte de uma base própria. */
export const mockPromoters: Promoter[] = [
  {
    id: 'p1',
    nome: 'Diego Ramos',
    iniciais: 'DR',
    regiao: 'Zona Sul',
    baseNome: 'Base Ibirapuera',
    base: { lat: -23.5874, lng: -46.6576 },
    telefone: '(11) 98211-4402',
  },
  {
    id: 'p2',
    nome: 'Lucas Martins',
    iniciais: 'LM',
    regiao: 'Zona Oeste',
    baseNome: 'Base Pompeia',
    base: { lat: -23.533, lng: -46.687 },
    telefone: '(11) 97733-9018',
  },
  {
    id: 'p3',
    nome: 'Rafael Almeida',
    iniciais: 'RA',
    regiao: 'Zona Leste',
    baseNome: 'Base Belém',
    base: { lat: -23.5445, lng: -46.589 },
    telefone: '(11) 96650-2275',
  },
]
