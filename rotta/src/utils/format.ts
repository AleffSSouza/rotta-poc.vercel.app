export const formatKm = (km: number) => `${km.toFixed(1).replace('.', ',')} km`

export const formatMin = (min: number) => {
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')} min`
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatClock = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`

/** Converte minutos desde 00:00 em HH:mm. */
export const minutesToClock = (totalMin: number) => {
  const m = Math.round(totalMin)
  return `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`
}

export const formatDateLong = (date: Date) => {
  const text = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const firstName = (fullName: string) => fullName.split(' ')[0]
