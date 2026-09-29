import type { PriorityLevel } from '../types/prioritization'
import type { OccurrenceSeverity, OccurrenceStatus, VisitStatus } from '../types/occurrence'
import { OCCURRENCE_STATUS_META, PRIORITY_META, SEVERITY_META, VISIT_STATUS_META } from '../utils/meta'

const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'

export function PriorityBadge({ nivel, upper = false }: { nivel: PriorityLevel; upper?: boolean }) {
  const meta = PRIORITY_META[nivel]
  return (
    <span className={`${base} ${meta.badge}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {upper ? meta.label.toUpperCase() : meta.label}
    </span>
  )
}

export function SeverityBadge({ value }: { value: OccurrenceSeverity }) {
  return <span className={`${base} ${SEVERITY_META[value]}`}>{value}</span>
}

export function OccurrenceStatusBadge({ value }: { value: OccurrenceStatus }) {
  return <span className={`${base} ${OCCURRENCE_STATUS_META[value]}`}>{value}</span>
}

export function VisitStatusBadge({ value }: { value: VisitStatus }) {
  const meta = VISIT_STATUS_META[value]
  return <span className={`${base} ${meta.badge}`}>{meta.label}</span>
}
