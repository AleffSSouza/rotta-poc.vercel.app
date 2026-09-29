import type { GeoPoint } from '../types/pdv'

const EARTH_RADIUS_KM = 6371
/** Fator que converte a distância em linha reta para uma estimativa viária urbana. */
export const ROAD_FACTOR = 1.3

const toRad = (deg: number) => (deg * Math.PI) / 180

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Distância viária estimada, em km, com uma casa decimal. */
export function roadKm(a: GeoPoint, b: GeoPoint): number {
  return Math.round(haversineKm(a, b) * ROAD_FACTOR * 10) / 10
}
