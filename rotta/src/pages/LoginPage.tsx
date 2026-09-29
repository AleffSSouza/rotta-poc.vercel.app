import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Smartphone, LayoutDashboard } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { mockUsers } from '../data/mockUsers'
import type { MockUser } from '../types/promoter'
import { VARIABLES } from '../utils/meta'
import { WEIGHT_KEYS } from '../services/scoringService'

export default function LoginPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (state.session) return <Navigate to={state.session.role === 'gestor' ? '/gestor' : '/promotor'} replace />

  const signIn = (user: MockUser) => {
    setLoading(true)
    window.setTimeout(() => {
      dispatch({
        type: 'LOGIN',
        session: { email: user.email, nome: user.nome, cargo: user.cargo, role: user.role, promoterId: user.promoterId },
      })
      navigate(user.role === 'gestor' ? '/gestor' : '/promotor')
    }, 450)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const user = mockUsers.find((u) => u.email === email.trim().toLowerCase() && u.senha === password)
    if (!user) {
      setError('E-mail ou senha incorretos. Confira os dados ou use um dos acessos de demonstração abaixo.')
      return
    }
    setError('')
    signIn(user)
  }

  const quick = (role: 'gestor' | 'promotor') => {
    const user = mockUsers.find((u) => u.role === role)!
    setEmail(user.email)
    setPassword(user.senha)
    setError('')
    signIn(user)
  }

  const sample = { atendimento: 35, distancia: 15, ruptura: 30, criticidade: 20 }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <Logo dark size="lg" />
        <div className="relative max-w-lg">
          <h2 className="text-4xl font-extrabold leading-[1.15] tracking-tight">
            O gestor decide como a rota é priorizada. Sem depender de consultoria.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-300">
            Defina os pesos de tempo de atendimento, distância, ruptura e criticidade. O Rotta recalcula o ranking dos PDVs e a rota de cada promotor na hora.
          </p>
          <div className="mt-8 space-y-3 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            {WEIGHT_KEYS.map((key) => (
              <div key={key}>
                <div className="mb-1.5 flex justify-between text-[13px] font-semibold">
                  <span>{VARIABLES[key].label}</span>
                  <span className="tabular-nums text-ink-300">{sample[key]}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${sample[key] * 2}%`, background: VARIABLES[key].color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-ink-400">Plataforma de apoio à decisão de roteirização de promotores de trade marketing.</p>
      </section>

      <section className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900">Bem-vindo ao Rotta</h1>
          <p className="mt-1 text-sm text-ink-500">Gestão inteligente de rotas</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-ink-700">E-mail</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-ink-700">Senha</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-11 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-400 hover:text-ink-700"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="animate-fade-in rounded-xl bg-crit-50 px-3.5 py-2.5 text-[13px] text-crit-700">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Entrar
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3 text-xs font-medium text-ink-400">
            <span className="h-px flex-1 bg-ink-100" />
            Acesso rápido para a apresentação
            <span className="h-px flex-1 bg-ink-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quick('gestor')}
              disabled={loading}
              className="flex flex-col items-start gap-2 rounded-xl border border-ink-200 p-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-60"
            >
              <LayoutDashboard className="size-5 text-brand-500" />
              <span>
                <span className="block text-sm font-bold text-ink-900">Entrar como Gestor</span>
                <span className="block text-xs text-ink-500">Dashboard web</span>
              </span>
            </button>
            <button
              onClick={() => quick('promotor')}
              disabled={loading}
              className="flex flex-col items-start gap-2 rounded-xl border border-ink-200 p-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-60"
            >
              <Smartphone className="size-5 text-brand-500" />
              <span>
                <span className="block text-sm font-bold text-ink-900">Entrar como Promotor</span>
                <span className="block text-xs text-ink-500">App de campo</span>
              </span>
            </button>
          </div>
          <p className="mt-5 text-center text-xs text-ink-400">
            gestor@rotta.com ou promotor@rotta.com, senha 123456
          </p>
        </div>
      </section>
    </div>
  )
}
