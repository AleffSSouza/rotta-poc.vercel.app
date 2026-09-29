import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

/** Dica ao passar o mouse ou focar com o teclado. */
export function Tooltip({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children ?? (
        <button type="button" className="rounded-full text-ink-400 transition hover:text-ink-700" aria-label={text}>
          <Info className="size-3.5" />
        </button>
      )}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-ink-900 px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-pop transition group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}
