import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none',
  secondary: 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50 disabled:text-ink-300',
  ghost: 'text-ink-600 hover:bg-ink-100 disabled:text-ink-300',
  danger: 'bg-crit-500 text-white hover:bg-crit-600 active:bg-crit-700 disabled:bg-ink-200 disabled:text-ink-400',
  success: 'bg-ok-500 text-white hover:bg-ok-600 active:bg-ok-700 disabled:bg-ink-200 disabled:text-ink-400',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-5 text-[15px]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition active:scale-[0.98] ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
