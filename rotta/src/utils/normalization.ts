export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Normalização linear para 0-100 dentro de um domínio fixo [min, max]. */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0
  return clamp(((value - min) / (max - min)) * 100, 0, 100)
}

/** Inverte uma variável normalizada: 0 vira 100 e 100 vira 0. */
export const invert = (normalized: number) => 100 - normalized
