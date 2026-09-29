import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, RotateCcw, Smartphone } from 'lucide-react'
import { COMPANY_NAME, mockUsers } from '../data/mockUsers'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useClickOutside } from '../hooks/useClickOutside'
import { formatDateLong } from '../utils/format'
import { SLAIndicator } from './SLAIndicator'

export function Header({ onMenu }: { onMenu: () => void }) {
  const { state, dispatch, activeAlerts, resetDemo } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [bellOpen, setBellOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(bellRef, () => setBellOpen(false), bellOpen)
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen)

  const session = state.session
  const initials = (session?.nome ?? 'G').split(' ').map((n) => n[0]).slice(0, 2).join('')
  const date = formatDateLong(new Date())

  const viewAsPromoter = () => {
    const promoter = mockUsers.find((u) => u.role === 'promotor')!
    dispatch({ type: 'LOGIN', session: { email: promoter.email, nome: promoter.nome, cargo: promoter.cargo, role: 'promotor', promoterId: promoter.promoterId } })
    navigate('/promotor')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Abrir menu">
        <Menu className="size-5" />
      </button>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink-900">{COMPANY_NAME}</p>
        <p className="truncate text-xs text-ink-500">{date}</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative rounded-xl p-2.5 text-ink-600 transition hover:bg-ink-100"
            aria-label={`Notificações: ${activeAlerts.length} alertas ativos`}
            aria-expanded={bellOpen}
          >
            <Bell className="size-5" />
            {activeAlerts.length > 0 && (
              <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-crit-500 px-1 text-[10px] font-bold leading-4 text-white">
                {activeAlerts.length}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] animate-pop-in overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-pop">
              <div className="border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-bold text-ink-900">Alertas ativos</p>
                <p className="text-xs text-ink-500">Rupturas críticas aguardando resolução</p>
              </div>
              <ul className="max-h-80 divide-y divide-ink-100 overflow-y-auto scroll-thin">
                {activeAlerts.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-500">Nenhum alerta ativo.</li>}
                {activeAlerts.map((alert) => (
                  <li key={alert.id}>
                    <button
                      onClick={() => {
                        setBellOpen(false)
                        navigate('/gestor/ocorrencias')
                      }}
                      className="flex w-full flex-col gap-1.5 px-4 py-3 text-left transition hover:bg-ink-50"
                    >
                      <span className="text-[13px] font-semibold text-ink-900">{alert.occurrence.pdvNome}</span>
                      <span className="text-xs text-ink-500">{alert.occurrence.promotorNome} · {alert.occurrence.horario}</span>
                      <SLAIndicator occurrence={alert.occurrence} compact />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition hover:bg-ink-100"
            aria-expanded={menuOpen}
            aria-label="Menu do usuário"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{initials}</span>
            <span className="hidden text-left sm:block">
              <span className="block text-[13px] font-bold leading-tight text-ink-900">{session?.nome}</span>
              <span className="block text-[11px] leading-tight text-ink-500">{session?.cargo}</span>
            </span>
            <ChevronDown className="hidden size-4 text-ink-400 sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 animate-pop-in rounded-2xl border border-ink-100 bg-white p-1.5 shadow-pop">
              <button onClick={viewAsPromoter} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-ink-50">
                <Smartphone className="size-4 text-brand-500" />
                Ver como promotor
              </button>
              <button
                onClick={() => {
                  resetDemo()
                  setMenuOpen(false)
                  toast.push({ tone: 'info', title: 'Dados da demonstração restaurados', description: 'Perfil, ocorrências e visitas voltaram ao estado inicial.' })
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                <RotateCcw className="size-4 text-ink-500" />
                Restaurar dados da demonstração
              </button>
              <div className="my-1 h-px bg-ink-100" />
              <button
                onClick={() => {
                  dispatch({ type: 'LOGOUT' })
                  navigate('/login')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-crit-600 hover:bg-crit-50"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
