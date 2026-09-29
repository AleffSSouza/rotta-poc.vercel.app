import { useId } from 'react'
import type { GeoPoint } from '../types/pdv'
import type { Promoter } from '../types/promoter'
import type { Route } from '../types/prioritization'
import type { Visit } from '../types/occurrence'
import { MAP_ART, MAP_VIEW, project, toPath } from '../utils/mapProjection'
import { PRIORITY_META, ROUTE_COLORS } from '../utils/meta'

const MARKER_FILL: Record<string, string> = {
  critico: '#d93a3a',
  alto: '#e39a12',
  medio: '#2b7fd6',
  baixo: '#8793a7',
}

interface Props {
  promoters: Promoter[]
  routes: Record<string, Route>
  /** Promotor em destaque. Os demais aparecem esmaecidos. */
  selectedId: string
  visits?: Record<string, Visit>
  className?: string
  /** Mapa pequeno: sem rótulos e com marcadores maiores. */
  compact?: boolean
  /** Ajusta o enquadramento à rota do promotor selecionado. Com false, mostra a cidade toda. */
  zoom?: boolean
}

/** Enquadramento que cobre a rota (base + paradas), mantendo a proporção do mapa. */
function fitView(points: { x: number; y: number }[]) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const ratio = MAP_VIEW.width / MAP_VIEW.height
  const pad = 95
  let w = Math.max(maxX - minX + pad * 2, 300)
  let h = Math.max(maxY - minY + pad * 2, 300 / ratio)
  if (w / h > ratio) h = w / ratio
  else w = h * ratio
  w = Math.min(w, MAP_VIEW.width)
  h = Math.min(h, MAP_VIEW.height)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const x = Math.min(Math.max(cx - w / 2, 0), MAP_VIEW.width - w)
  const y = Math.min(Math.max(cy - h / 2, 0), MAP_VIEW.height - h)
  return { x, y, w, h }
}


interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
}
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0

interface LabelSpec {
  id: string
  x: number
  y: number
  text: string
  /** Raio do marcador ao qual o rótulo pertence. */
  radius: number
  bold: number
}
interface PlacedLabel {
  id: string
  text: string
  x: number
  y: number
  anchor: 'start' | 'end' | 'middle'
}

/**
 * Posiciona os rótulos: para cada um testa direita, esquerda, acima e abaixo e fica com o primeiro
 * lado que não cruza marcadores nem rótulos já colocados e cabe no enquadramento.
 */
function placeLabels(specs: LabelSpec[], view: { x: number; y: number; w: number; h: number }, u: number): PlacedLabel[] {
  const markerBoxes: Box[] = specs.map((s) => ({ x0: s.x - s.radius, y0: s.y - s.radius, x1: s.x + s.radius, y1: s.y + s.radius }))
  const placed: PlacedLabel[] = []
  const taken: Box[] = []
  const fontSize = 11.5 * u
  specs.forEach((spec, index) => {
    const width = spec.text.length * fontSize * 0.58 + 6 * u
    const height = fontSize * 1.3
    const gap = spec.radius + 4 * u
    const candidates: { anchor: PlacedLabel['anchor']; box: Box; tx: number; ty: number }[] = [
      { anchor: 'start', tx: spec.x + gap, ty: spec.y + fontSize * 0.35, box: { x0: spec.x + gap - 2 * u, y0: spec.y - height / 2, x1: spec.x + gap + width, y1: spec.y + height / 2 } },
      { anchor: 'end', tx: spec.x - gap, ty: spec.y + fontSize * 0.35, box: { x0: spec.x - gap - width, y0: spec.y - height / 2, x1: spec.x - gap + 2 * u, y1: spec.y + height / 2 } },
      { anchor: 'middle', tx: spec.x, ty: spec.y - gap - 3 * u, box: { x0: spec.x - width / 2, y0: spec.y - gap - height, x1: spec.x + width / 2, y1: spec.y - gap } },
      { anchor: 'middle', tx: spec.x, ty: spec.y + gap + fontSize, box: { x0: spec.x - width / 2, y0: spec.y + gap, x1: spec.x + width / 2, y1: spec.y + gap + height } },
    ]
    const inside = (b: Box) => b.x0 >= view.x + 4 * u && b.x1 <= view.x + view.w - 4 * u && b.y0 >= view.y + 4 * u && b.y1 <= view.y + view.h - 4 * u
    const free = (b: Box) =>
      inside(b) && !taken.some((t) => overlaps(b, t)) && !markerBoxes.some((m, i) => i !== index && overlaps(b, m))
    const choice = candidates.find((c) => free(c.box)) ?? candidates.find((c) => inside(c.box)) ?? candidates[0]
    taken.push(choice.box)
    placed.push({ id: spec.id, text: spec.text, x: choice.tx, y: choice.ty, anchor: choice.anchor })
  })
  return placed
}

/** Mapa ilustrativo (SVG), sem dependência externa: funciona offline durante a apresentação. */
export function RouteMap({ promoters, routes, selectedId, visits, className = '', compact = false, zoom = true }: Props) {
  const uid = useId().replace(/:/g, '')
  const selectedIndex = Math.max(0, promoters.findIndex((p) => p.id === selectedId))
  const route = routes[selectedId]
  const promoter = promoters[selectedIndex]

  const linePoints = (r: Route, base: GeoPoint) => [project(base), ...r.stops.map((s) => project(s.scored.pdv.location))]

  const view =
    zoom && route
      ? fitView(linePoints(route, promoter.base))
      : { x: 0, y: 0, w: MAP_VIEW.width, h: MAP_VIEW.height }
  /** Escala dos elementos: mantém marcadores e textos legíveis independentemente do zoom e do tamanho do mapa. */
  const u = (view.w / MAP_VIEW.width) * (compact ? 2.4 : 1.15)

  return (
    <div className={`overflow-hidden rounded-2xl border border-ink-100 bg-[#eef2f7] ${className}`}>
      <svg
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className="block h-auto w-full"
        style={{ aspectRatio: `${MAP_VIEW.width} / ${MAP_VIEW.height}` }}
        role="img"
        aria-label="Mapa ilustrativo da rota sugerida"
      >
        <defs>
          <pattern id={`grid-${uid}`} width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
            <path d="M36 0H0V36" fill="none" stroke="#dde4ee" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill={`url(#grid-${uid})`} />
        <path d={MAP_ART.tiete} fill="none" stroke="#c9dcf0" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <path d={MAP_ART.pinheiros} fill="none" stroke="#c9dcf0" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        {MAP_ART.avenidas.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <ellipse cx={MAP_ART.parque.center.x} cy={MAP_ART.parque.center.y} rx={MAP_ART.parque.rx} ry={MAP_ART.parque.ry} fill="#d5e9dc" />
        {!compact &&
          MAP_ART.labels.map((label) => (
            <text
              key={label.text}
              x={label.at.x}
              y={label.at.y}
              fontSize="10.5"
              fontWeight="600"
              fill="#8a9bb3"
              textAnchor="middle"
              transform={`rotate(${label.rotate} ${label.at.x} ${label.at.y})`}
            >
              {label.text}
            </text>
          ))}

        {/* Rotas dos demais promotores, esmaecidas */}
        {promoters.map((other, index) => {
          const r = routes[other.id]
          if (!r || other.id === selectedId) return null
          const color = ROUTE_COLORS[index % ROUTE_COLORS.length]
          return (
            <g key={other.id}>
              <path d={toPath(linePoints(r, other.base))} fill="none" stroke={color} strokeOpacity="0.3" strokeWidth={3 * u} strokeDasharray={`${2 * u} ${7 * u}`} strokeLinecap="round" strokeLinejoin="round" />
              {r.stops.map((stop) => {
                const p = project(stop.scored.pdv.location)
                return <circle key={stop.scored.pdv.id} cx={p.x} cy={p.y} r={5 * u} fill={color} opacity="0.4" />
              })}
            </g>
          )
        })}

        {/* Rota do promotor selecionado */}
        {route &&
          (() => {
            const color = ROUTE_COLORS[selectedIndex % ROUTE_COLORS.length]
            const orderKey = route.stops.map((s) => s.scored.pdv.id).join('-')
            const start = project(promoter.base)
            const d = toPath(linePoints(route, promoter.base))
            const specs: LabelSpec[] = compact
              ? []
              : [
                  { id: 'base', x: start.x, y: start.y, text: promoter.baseNome, radius: 13 * u, bold: 700 },
                  ...route.stops.map((stop) => {
                    const p = project(stop.scored.pdv.location)
                    return { id: stop.scored.pdv.id, x: p.x, y: p.y, text: stop.scored.pdv.nome, radius: 17 * u, bold: 700 }
                  }),
                ]
            const labels = placeLabels(specs, view, u)
            return (
              <g key={orderKey}>
                <path d={d} fill="none" stroke="#fff" strokeWidth={9 * u} strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'draw-route 1s ease-out forwards' }} />
                <path d={d} fill="none" stroke={color} strokeWidth={4.5 * u} strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'draw-route 1s ease-out forwards' }} />
                <g transform={`translate(${start.x} ${start.y})`}>
                  <g transform={`scale(${u})`}>
                    <rect x="-11" y="-11" width="22" height="22" rx="6" fill="#111c33" />
                    <path d="M-5 1 0 -5 5 1M-3.5 0v5h7v-5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                {route.stops.map((stop) => {
                  const p = project(stop.scored.pdv.location)
                  const done = visits?.[stop.scored.pdv.id]?.status === 'concluida'
                  return (
                    <g key={stop.scored.pdv.id} transform={`translate(${p.x} ${p.y})`}>
                      <g transform={`scale(${u})`} style={{ animation: 'fade-only 0.45s ease-out both', animationDelay: `${0.5 + stop.order * 0.15}s` }}>
                        <circle r="17" fill="#fff" opacity="0.9" />
                        <circle r="13" fill={done ? '#1f9d63' : MARKER_FILL[stop.scored.nivel]} />
                        <text y="4.5" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">
                          {done ? '✓' : stop.order}
                        </text>
                      </g>
                    </g>
                  )
                })}
                {labels.map((label) => (
                  <text
                    key={label.id}
                    x={label.x}
                    y={label.y}
                    fontSize={11.5 * u}
                    fontWeight={label.id === 'base' ? 600 : 700}
                    fill="#111c33"
                    stroke="#eef2f7"
                    strokeWidth={3.5 * u}
                    paintOrder="stroke"
                    textAnchor={label.anchor}
                    style={{ animation: 'fade-only 0.45s ease-out both', animationDelay: '0.9s' }}
                  >
                    {label.text}
                  </text>
                ))}
              </g>
            )
          })()}
      </svg>
      {!compact && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 bg-white px-4 py-2.5 text-xs text-ink-500">
          {(['critico', 'alto', 'medio', 'baixo'] as const).map((nivel) => (
            <span key={nivel} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: MARKER_FILL[nivel] }} />
              {PRIORITY_META[nivel].label}
            </span>
          ))}
          <span className="ml-auto text-ink-400">Mapa ilustrativo, sem serviço externo</span>
        </div>
      )}
    </div>
  )
}
