import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <Icon className="size-6" />
      </div>
      <p className="text-sm font-bold text-ink-900">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] text-ink-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
