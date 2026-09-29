import { Check } from 'lucide-react'

export const CHECKLIST_ITEMS = [
  'Produto exposto corretamente',
  'Preço identificado',
  'Gôndola abastecida',
  'Material promocional presente',
  'Verificar ruptura',
]

export function Checklist({ values, onToggle }: { values: boolean[]; onToggle: (index: number) => void }) {
  return (
    <ul className="space-y-2">
      {CHECKLIST_ITEMS.map((label, index) => {
        const done = values[index]
        return (
          <li key={label}>
            <button
              onClick={() => onToggle(index)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99] ${
                done ? 'border-ok-100 bg-ok-50' : 'border-ink-100 bg-white hover:border-ink-200'
              }`}
              role="checkbox"
              aria-checked={done}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                  done ? 'border-ok-500 bg-ok-500 text-white' : 'border-ink-300 bg-white'
                }`}
              >
                {done && <Check className="size-4" strokeWidth={3} />}
              </span>
              <span className={`text-[15px] font-medium ${done ? 'text-ok-700' : 'text-ink-800'}`}>{label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
