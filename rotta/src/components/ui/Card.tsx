import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-ink-100 bg-white shadow-card ${className}`} {...props} />
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start justify-between gap-3 px-5 pt-5 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold tracking-tight text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
