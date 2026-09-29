import { NavLink } from 'react-router-dom'
import { AlertTriangle, Database, LayoutDashboard, Route as RouteIcon, Settings, SlidersHorizontal, Users, X } from 'lucide-react'
import { Logo } from './Logo'
import { useApp } from '../context/AppContext'
import { WEIGHT_KEYS, sameWeights } from '../services/scoringService'
import { VARIABLES } from '../utils/meta'

const NAV = [
  { to: '/gestor', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/gestor/rota', label: 'Rota e PDVs', icon: RouteIcon },
  { to: '/gestor/promotores', label: 'Promotores', icon: Users },
  { to: '/gestor/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
  { to: '/gestor/perfis', label: 'Perfis de priorização', icon: SlidersHorizontal },
  { to: '/gestor/cadastros', label: 'Cadastros', icon: Database },
  { to: '/gestor/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const { state, activeOccurrences } = useApp()
  const criticalOpen = activeOccurrences.filter((o) => o.criticidade === 'Crítica').length
  const dirty = !sameWeights(state.draftWeights, state.profile.weights)

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-ink-900 px-3 pb-4 pt-5 text-ink-300">
      <div className="mb-7 flex items-center justify-between px-2">
        <Logo dark />
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-0.5" aria-label="Navegação principal">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-ink-300 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            <item.icon className="size-[18px] shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.to === '/gestor/ocorrencias' && criticalOpen > 0 && (
              <span className="rounded-full bg-crit-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{criticalOpen}</span>
            )}
            {item.to === '/gestor/perfis' && dirty && <span className="size-2 rounded-full bg-warn-500" title="Há alterações não aplicadas" />}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-xl bg-white/[0.06] p-3.5">
        <p className="text-[11px] font-semibold text-ink-400">Perfil ativo</p>
        <p className="mt-0.5 text-sm font-bold text-white">{state.profile.nome}</p>
        <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-white/10">
          {WEIGHT_KEYS.map((key) => (
            <div key={key} className="h-full transition-[width] duration-500" style={{ width: `${state.profile.weights[key]}%`, background: VARIABLES[key].color }} />
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-ink-400">
          {WEIGHT_KEYS.map((k) => `${VARIABLES[k].short} ${state.profile.weights[k]}%`).join(' · ')}
        </p>
      </div>
    </aside>
  )
}
