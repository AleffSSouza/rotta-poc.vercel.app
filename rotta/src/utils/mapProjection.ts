import type { GeoPoint } from '../types/pdv'

/** Recorte da cidade de São Paulo usado no mapa ilustrativo (proporção física preservada). */
export const MAP_VIEW = { width: 800, height: 560 }
const LAT = { min: -23.672, max: -23.505 }
const LNG = { min: -46.762, max: -46.512 }

export function project(point: GeoPoint): { x: number; y: number } {
  const x = ((point.lng - LNG.min) / (LNG.max - LNG.min)) * MAP_VIEW.width
  const y = ((LAT.max - point.lat) / (LAT.max - LAT.min)) * MAP_VIEW.height
  return { x, y }
}

const P = (lat: number, lng: number) => project({ lat, lng })
export const toPath = (points: { x: number; y: number }[]) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

/** Elementos decorativos do mapa (rios, avenidas, parque). Coordenadas aproximadas, só para contexto visual. */
export const MAP_ART = {
  tiete: toPath([P(-23.522, -46.762), P(-23.514, -46.72), P(-23.512, -46.68), P(-23.508, -46.64), P(-23.506, -46.58), P(-23.512, -46.53)]),
  pinheiros: toPath([P(-23.53, -46.762), P(-23.55, -46.728), P(-23.585, -46.712), P(-23.62, -46.703), P(-23.655, -46.713), P(-23.672, -46.72)]),
  avenidas: [
    toPath([P(-23.5645, -46.7), P(-23.566, -46.66), P(-23.572, -46.6355)]),
    toPath([P(-23.548, -46.632), P(-23.545, -46.59), P(-23.535, -46.55), P(-23.53, -46.515)]),
    toPath([P(-23.672, -46.665), P(-23.62, -46.658), P(-23.59, -46.657), P(-23.555, -46.652), P(-23.52, -46.648)]),
    toPath([P(-23.6, -46.762), P(-23.598, -46.7), P(-23.594, -46.64), P(-23.586, -46.61), P(-23.585, -46.52)]),
  ],
  parque: { center: P(-23.5875, -46.6577), rx: 34, ry: 26 },
  labels: [
    { text: 'Marginal Tietê', at: P(-23.5085, -46.69), rotate: -2 },
    { text: 'Marginal Pinheiros', at: P(-23.6, -46.706), rotate: 78 },
    { text: 'Ibirapuera', at: P(-23.5905, -46.6577), rotate: 0 },
    { text: 'Av. Paulista', at: P(-23.5665, -46.672), rotate: 7 },
  ],
}
