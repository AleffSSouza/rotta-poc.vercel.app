import { BatteryFull, Signal, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'

/** Moldura de smartphone para a simulação do app do promotor. Em telas pequenas ocupa a tela inteira. */
export function MobileFrame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white sm:h-[min(844px,calc(100dvh-2rem))] sm:w-[390px] sm:rounded-[46px] sm:border-[10px] sm:border-ink-950 sm:shadow-[0_30px_70px_rgb(10_18_38/0.35)]">
      <div className="hidden shrink-0 items-center justify-between bg-white px-7 pb-1 pt-3 text-[13px] font-bold text-ink-900 sm:flex">
        <span>09:41</span>
        <span className="absolute left-1/2 top-2 h-[22px] w-24 -translate-x-1/2 rounded-full bg-ink-950" aria-hidden="true" />
        <span className="flex items-center gap-1">
          <Signal className="size-3.5" />
          <Wifi className="size-3.5" />
          <BatteryFull className="size-4" />
        </span>
      </div>
      <div className="scroll-thin relative min-h-0 flex-1 overflow-y-auto bg-ink-50">{children}</div>
      {footer}
    </div>
  )
}
