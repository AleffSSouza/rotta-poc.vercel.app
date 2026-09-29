import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  MapPin,
  Navigation,
  RotateCcw,
  Route as RouteIcon,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { MobileFrame } from '../components/MobileFrame'
import { Checklist, CHECKLIST_ITEMS } from '../components/Checklist'
import { RouteMap } from '../components/RouteMap'
import { RouteTimeline } from '../components/RouteTimeline'
import { SLAIndicator } from '../components/SLAIndicator'
import { OccurrenceStatusBadge, SeverityBadge } from '../components/PriorityBadge'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useRankings } from '../hooks/useRankings'
import { mockUsers } from '../data/mockUsers'
import { PRODUCT_OPTIONS, SLA_MINUTES, createOccurrence } from '../services/occurrenceService'
import { SAMPLE_PHOTO, fileToThumbnail } from '../utils/image'
import { firstName, formatClock, formatKm, formatMin } from '../utils/format'
import { PRIORITY_META } from '../utils/meta'
import type { Occurrence, OccurrenceSeverity } from '../types/occurrence'
import type { PriorityLevel, RouteStop } from '../types/prioritization'

type Screen = 'home' | 'checkin' | 'checklist' | 'ruptura' | 'sucesso'
type Tab = 'rota' | 'mapa' | 'ocorrencias' | 'perfil'

const PRIORITY_FEM: Record<PriorityLevel, string> = { critico: 'CRÍTICA', alto: 'ALTA', medio: 'MÉDIA', baixo: 'BAIXA' }
const SEVERITIES: OccurrenceSeverity[] = ['Baixa', 'Média', 'Alta', 'Crítica']

export default function PromoterAppPage() {
  const { state, dispatch, resetDemo } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const { promoters, appliedRoutes, previousRoutes } = useRankings()

  const promoterId = state.session?.promoterId ?? promoters[0].id
  const promoter = promoters.find((p) => p.id === promoterId)!
  const route = appliedRoutes[promoterId]

  const [screen, setScreen] = useState<Screen>('home')
  const [tab, setTab] = useState<Tab>('rota')
  const [activePdvId, setActivePdvId] = useState<string | null>(null)
  const [checkinPhase, setCheckinPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const timers = useRef<number[]>([])

  // ruptura
  const [tipo, setTipo] = useState<'Total' | 'Parcial'>('Total')
  const [criticidade, setCriticidade] = useState<OccurrenceSeverity>('Alta')
  const [produto, setProduto] = useState(PRODUCT_OPTIONS[0])
  const [observacao, setObservacao] = useState('')
  const [foto, setFoto] = useState<string | undefined>()
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Occurrence | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const activeStop: RouteStop | undefined = route.stops.find((s) => s.scored.pdv.id === activePdvId)
  const activeVisit = activePdvId ? state.visits[activePdvId] : undefined
  const doneCount = route.stops.filter((s) => state.visits[s.scored.pdv.id]?.status === 'concluida').length
  const nextStop = route.stops.find((s) => state.visits[s.scored.pdv.id]?.status !== 'concluida')
  const myOccurrences = state.occurrences.filter((o) => o.promoterId === promoterId)

  const previousOrder = new Map((previousRoutes?.[promoterId]?.stops ?? []).map((s) => [s.scored.pdv.id, s.order]))
  const anticipated = route.stops.filter((s) => (previousOrder.get(s.scored.pdv.id) ?? s.order) > s.order)

  const startVisit = (stop: RouteStop) => {
    setActivePdvId(stop.scored.pdv.id)
    setCheckinPhase('idle')
    setScreen(state.visits[stop.scored.pdv.id]?.status === 'em_andamento' ? 'checklist' : 'checkin')
  }

  const confirmCheckin = () => {
    if (!activePdvId || checkinPhase !== 'idle') return
    setCheckinPhase('loading')
    const pdvId = activePdvId
    timers.current.push(
      window.setTimeout(() => {
        dispatch({ type: 'CHECK_IN', pdvId, time: formatClock(new Date()) })
        setCheckinPhase('done')
        timers.current.push(window.setTimeout(() => setScreen('checklist'), 1100))
      }, 800),
    )
  }

  const finishChecklist = () => {
    if (!activePdvId || !activeStop) return
    dispatch({ type: 'FINISH_VISIT', pdvId: activePdvId, time: formatClock(new Date()) })
    toast.push({ tone: 'success', title: 'Visita concluída', description: activeStop.scored.pdv.nome })
    setScreen('home')
    setTab('rota')
  }

  const openRuptura = () => {
    setTipo('Total')
    setCriticidade('Alta')
    setProduto(PRODUCT_OPTIONS[0])
    setObservacao('')
    setFoto(undefined)
    setScreen('ruptura')
  }

  const onPickPhoto = async (file?: File) => {
    if (!file) return
    try {
      setFoto(await fileToThumbnail(file))
    } catch (error) {
      toast.push({ tone: 'warning', title: 'Não foi possível usar a foto', description: error instanceof Error ? error.message : undefined })
    }
  }

  const submitRuptura = async () => {
    if (!activeStop || sending) return
    setSending(true)
    try {
      const { occurrence, alert } = await createOccurrence({
        pdv: activeStop.scored.pdv,
        promoter,
        tipo: tipo === 'Total' ? 'Ruptura total' : 'Ruptura parcial',
        criticidade,
        produto,
        observacao: observacao.trim(),
        foto,
      })
      dispatch({ type: 'ADD_OCCURRENCE', occurrence, alert })
      setResult(occurrence)
      setScreen('sucesso')
    } catch {
      toast.push({ tone: 'critical', title: 'Não foi possível enviar a ocorrência', description: 'Tente novamente em instantes.' })
    } finally {
      setSending(false)
    }
  }

  const switchToManager = () => {
    const user = mockUsers.find((u) => u.role === 'gestor')!
    dispatch({ type: 'LOGIN', session: { email: user.email, nome: user.nome, cargo: user.cargo, role: 'gestor' } })
    navigate('/gestor')
  }

  const doReset = () => {
    resetDemo()
    setScreen('home')
    setTab('rota')
    setActivePdvId(null)
    toast.push({ tone: 'info', title: 'Dados da demonstração restaurados' })
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  const topBar = (title: string, subtitle: string | undefined, onBack: () => void) => (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-3">
      <button onClick={onBack} className="rounded-xl p-2 text-ink-700 hover:bg-ink-100" aria-label="Voltar">
        <ArrowLeft className="size-5" />
      </button>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-extrabold text-ink-900">{title}</p>
        {subtitle && <p className="truncate text-xs text-ink-500">{subtitle}</p>}
      </div>
    </div>
  )

  const inFlow = screen !== 'home'

  const nav = !inFlow && (
    <nav className="grid shrink-0 grid-cols-4 border-t border-ink-100 bg-white px-2 pb-3 pt-1.5" aria-label="Navegação do app">
      {(
        [
          { id: 'rota', label: 'Rota', icon: RouteIcon },
          { id: 'mapa', label: 'Mapa', icon: MapIcon },
          { id: 'ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
          { id: 'perfil', label: 'Perfil', icon: User },
        ] as const
      ).map((item) => {
        const on = tab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            aria-current={on ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition ${on ? 'text-brand-600' : 'text-ink-400 hover:text-ink-700'}`}
          >
            <item.icon className="size-5" />
            {item.label}
            {item.id === 'ocorrencias' && myOccurrences.filter((o) => o.status !== 'Resolvida').length > 0 && (
              <span className="absolute right-3 top-0.5 size-2 rounded-full bg-crit-500" />
            )}
          </button>
        )
      })}
    </nav>
  )

  /* ---------------- Telas ---------------- */

  let content
  if (screen === 'checkin' && activeStop) {
    const pdv = activeStop.scored.pdv
    content = (
      <div className="flex min-h-full flex-col bg-white">
        {topBar("Check-in", pdv.nome, () => setScreen('home'))}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {checkinPhase === 'done' ? (
            <div className="animate-pop-in">
              <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-ok-50 text-ok-500">
                <CheckCircle2 className="size-11" />
              </span>
              <p className="mt-4 text-xl font-extrabold text-ink-900">✓ Check-in realizado</p>
              <p className="mt-1 text-sm text-ink-500">{pdv.nome} às {formatClock(new Date())}. Abrindo o checklist.</p>
            </div>
          ) : (
            <>
              <span className={`flex size-20 items-center justify-center rounded-full bg-brand-50 text-brand-600 ${checkinPhase === 'loading' ? 'animate-pulse' : ''}`}>
                <MapPin className="size-10" />
              </span>
              <p className="mt-5 text-lg font-extrabold text-ink-900">{pdv.nome}</p>
              <p className="mt-1 text-sm text-ink-500">{pdv.endereco}</p>
              <p className="mt-6 max-w-[260px] text-sm text-ink-600">Confirme sua presença no PDV para iniciar a visita.</p>
            </>
          )}
        </div>
        {checkinPhase !== 'done' && (
          <div className="p-4">
            <Button size="lg" className="w-full" onClick={confirmCheckin} loading={checkinPhase === 'loading'}>
              {checkinPhase === 'loading' ? 'Confirmando localização' : 'Confirmar check-in'}
            </Button>
          </div>
        )}
      </div>
    )
  } else if (screen === 'checklist' && activeStop && activeVisit) {
    const values = activeVisit.checklist
    const allDone = values.every(Boolean)
    content = (
      <div className="flex min-h-full flex-col bg-white">
        {topBar("Checklist de execução", activeStop.scored.pdv.nome, () => setScreen('home'))}
        <div className="flex-1 px-4 pb-4 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-600">
              {values.filter(Boolean).length} de {CHECKLIST_ITEMS.length} itens
            </p>
            <button onClick={() => dispatch({ type: 'CHECK_ALL', pdvId: activeStop.scored.pdv.id })} className="text-[13px] font-bold text-brand-600 hover:text-brand-700">
              Marcar todos
            </button>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-ok-500 transition-[width] duration-300" style={{ width: `${(values.filter(Boolean).length / CHECKLIST_ITEMS.length) * 100}%` }} />
          </div>
          <Checklist values={values} onToggle={(index) => dispatch({ type: 'TOGGLE_CHECK', pdvId: activeStop.scored.pdv.id, index })} />
          {activeVisit.occurrenceIds.length > 0 && (
            <p className="mt-4 rounded-xl bg-warn-50 px-3.5 py-2.5 text-[13px] text-warn-700">
              {activeVisit.occurrenceIds.length} {activeVisit.occurrenceIds.length === 1 ? 'ruptura registrada' : 'rupturas registradas'} nesta visita.
            </p>
          )}
        </div>
        <div className="space-y-2 border-t border-ink-100 p-4">
          <Button variant="secondary" size="lg" className="w-full border-warn-100 text-warn-700 hover:bg-warn-50" onClick={openRuptura}>
            <AlertTriangle className="size-5" />
            Registrar ruptura
          </Button>
          <Button size="lg" className="w-full" disabled={!allDone} onClick={finishChecklist}>
            Finalizar checklist
          </Button>
          {!allDone && <p className="text-center text-xs text-ink-400">Marque todos os itens para finalizar.</p>}
        </div>
      </div>
    )
  } else if (screen === 'ruptura' && activeStop) {
    content = (
      <div className="flex min-h-full flex-col bg-white">
        {topBar("Registrar ruptura", activeStop.scored.pdv.nome, () => setScreen('checklist'))}
        <div className="flex-1 space-y-5 px-4 pb-4 pt-4">
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-800">Tipo de ruptura</p>
            <div className="grid grid-cols-2 gap-2">
              {(['Total', 'Parcial'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  aria-pressed={tipo === t}
                  className={`rounded-xl border py-2.5 text-sm font-bold transition ${tipo === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-800">Criticidade</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SEVERITIES.map((s) => {
                const on = criticidade === s
                const tone = s === 'Crítica' ? 'border-crit-500 bg-crit-50 text-crit-700' : s === 'Alta' ? 'border-warn-500 bg-warn-50 text-warn-700' : 'border-brand-500 bg-brand-50 text-brand-700'
                return (
                  <button
                    key={s}
                    onClick={() => setCriticidade(s)}
                    aria-pressed={on}
                    className={`rounded-xl border py-2.5 text-[13px] font-bold transition ${on ? tone : 'border-ink-200 text-ink-600'}`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-xs text-ink-500">Prazo de atendimento: {SLA_MINUTES[criticidade]} min.</p>
          </div>
          <div>
            <label htmlFor="produto" className="mb-2 block text-[13px] font-bold text-ink-800">Produto</label>
            <select
              id="produto"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              {PRODUCT_OPTIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="obs" className="mb-2 block text-[13px] font-bold text-ink-800">Observação</label>
            <textarea
              id="obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              placeholder="Ex.: gôndola vazia, sem previsão de reposição."
              className="w-full resize-none rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-800">Foto da gôndola</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0])} />
            {foto ? (
              <div className="relative overflow-hidden rounded-xl border border-ink-100">
                <img src={foto} alt="Foto anexada da gôndola" className="h-40 w-full object-cover" />
                <button
                  onClick={() => {
                    setFoto(undefined)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-ink-900/80 px-2.5 py-1.5 text-xs font-semibold text-white"
                >
                  <Trash2 className="size-3.5" />
                  Remover
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-ink-300 py-4 text-[13px] font-semibold text-ink-600 transition hover:border-brand-400 hover:bg-brand-50/40">
                  <Camera className="size-5" />
                  Tirar ou anexar
                </button>
                <button onClick={() => setFoto(SAMPLE_PHOTO)} className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-ink-300 py-4 text-[13px] font-semibold text-ink-600 transition hover:border-brand-400 hover:bg-brand-50/40">
                  <ImagePlus className="size-5" />
                  Foto de exemplo
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-ink-100 p-4">
          <Button variant={criticidade === 'Crítica' ? 'danger' : 'primary'} size="lg" className="w-full" onClick={submitRuptura} loading={sending}>
            {sending ? 'Enviando' : 'Enviar ocorrência'}
          </Button>
        </div>
      </div>
    )
  } else if (screen === 'sucesso' && result) {
    content = (
      <div className="flex min-h-full flex-col bg-white px-6 text-center">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="flex size-20 animate-pop-in items-center justify-center rounded-full bg-ok-50 text-ok-500">
            <CheckCircle2 className="size-11" />
          </span>
          <p className="mt-5 text-xl font-extrabold text-ink-900">✓ Ruptura registrada</p>
          <ul className="mt-5 w-full max-w-[280px] space-y-2 text-left text-sm">
            <li className="flex items-center gap-2.5 rounded-xl bg-ok-50 px-3.5 py-2.5 font-semibold text-ok-700">
              <CheckCircle2 className="size-4 shrink-0" /> Gestor notificado
            </li>
            {result.criticidade === 'Crítica' && (
              <li className="flex items-center gap-2.5 rounded-xl bg-ok-50 px-3.5 py-2.5 font-semibold text-ok-700">
                <CheckCircle2 className="size-4 shrink-0" /> Alerta criado
              </li>
            )}
            <li className="flex items-center gap-2.5 rounded-xl bg-ink-50 px-3.5 py-2.5 font-semibold text-ink-700">
              <Clock className="size-4 shrink-0" /> SLA de {result.slaMinutos} min iniciado
            </li>
          </ul>
        </div>
        <div className="space-y-2 pb-4">
          <Button size="lg" className="w-full" onClick={() => setScreen('checklist')}>
            Voltar ao checklist
          </Button>
        </div>
      </div>
    )
  } else {
    /* ---- Home + abas ---- */
    if (tab === 'rota') {
      content = (
        <div className="pb-4">
          <div className="rounded-b-[28px] bg-brand-500 px-5 pb-6 pt-5 text-white">
            <p className="text-[22px] font-extrabold tracking-tight">Olá, {firstName(promoter.nome)} 👋</p>
            <p className="mt-0.5 text-sm text-brand-100">Rota de hoje</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 px-2 py-2.5">
                <p className="text-lg font-extrabold tabular-nums">{doneCount}/{route.stops.length}</p>
                <p className="text-[11px] text-brand-100">visitas</p>
              </div>
              <div className="rounded-xl bg-white/15 px-2 py-2.5">
                <p className="text-lg font-extrabold tabular-nums">{formatKm(route.totalKm).replace(' km', '')}</p>
                <p className="text-[11px] text-brand-100">km no total</p>
              </div>
              <div className="rounded-xl bg-white/15 px-2 py-2.5">
                <p className="text-lg font-extrabold tabular-nums">{formatMin(route.totalMin)}</p>
                <p className="text-[11px] text-brand-100">de jornada</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-4 pt-4">
            {state.lastAppliedAt && (
              <div className="animate-pop-in rounded-2xl border border-brand-100 bg-brand-50 px-3.5 py-3">
                <p className="flex items-center gap-2 text-[13px] font-bold text-brand-700">
                  <Sparkles className="size-4" />
                  Rota atualizada às {formatClock(new Date(state.lastAppliedAt))}
                </p>
                <p className="mt-0.5 text-xs text-brand-800">
                  O gestor aplicou o perfil {state.profile.nome}.
                  {anticipated.length > 0 && ` ${anticipated[0].scored.pdv.nome} foi antecipado para a ${anticipated[0].order}ª parada.`}
                </p>
              </div>
            )}

            {route.stops.map((stop) => {
              const pdv = stop.scored.pdv
              const visit = state.visits[pdv.id]
              const done = visit?.status === 'concluida'
              const running = visit?.status === 'em_andamento'
              const isNext = nextStop?.scored.pdv.id === pdv.id
              const moved = (previousOrder.get(pdv.id) ?? stop.order) > stop.order
              return (
                <article key={pdv.id} className={`rounded-2xl border bg-white p-4 shadow-card transition ${isNext ? 'border-brand-300 ring-2 ring-brand-100' : 'border-ink-100'} ${done ? 'opacity-75' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white ${done ? 'bg-ok-500' : 'bg-ink-900'}`}>
                      {done ? '✓' : stop.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-extrabold leading-tight text-ink-900">{pdv.nome}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${PRIORITY_META[stop.scored.nivel].badge}`}>
                          <span className={`size-1.5 rounded-full ${PRIORITY_META[stop.scored.nivel].dot}`} />
                          Prioridade: {PRIORITY_FEM[stop.scored.nivel]}
                        </span>
                        {moved && <span className="rounded-full bg-ok-50 px-2 py-0.5 text-[11px] font-bold text-ok-700">antecipada</span>}
                        {isNext && !done && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">próxima parada</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-ink-500">Score</p>
                      <p className="text-xl font-extrabold leading-none tabular-nums text-ink-900">{Math.round(stop.scored.score)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] text-ink-600">{stop.scored.motivo}</p>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1"><Navigation className="size-3.5" />{formatKm(stop.legKm)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />visita de {formatMin(stop.visitMin)}</span>
                    <span>chegada {stop.eta}</span>
                  </div>
                  {done ? (
                    <p className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-ok-600">
                      <CheckCircle2 className="size-4" /> Visita concluída{visit?.finishedAt ? ` às ${visit.finishedAt}` : ''}
                    </p>
                  ) : (
                    <Button className="mt-3 w-full" variant={isNext || running ? 'primary' : 'secondary'} onClick={() => startVisit(stop)}>
                      {running ? 'Continuar visita' : 'Visitar PDV'}
                    </Button>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )
    } else if (tab === 'mapa') {
      content = (
        <div className="space-y-4 p-4">
          <RouteMap promoters={[promoter]} routes={{ [promoterId]: route }} selectedId={promoterId} visits={state.visits} compact className="h-64" />
          <div className="rounded-2xl border border-ink-100 bg-white p-4">
            <RouteTimeline route={route} promoter={promoter} previousRoute={previousRoutes?.[promoterId]} showSummary={false} />
          </div>
        </div>
      )
    } else if (tab === 'ocorrencias') {
      content = (
        <div className="space-y-3 p-4">
          <p className="text-lg font-extrabold text-ink-900">Minhas ocorrências</p>
          {myOccurrences.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 bg-white">
              <EmptyState icon={AlertTriangle} title="Nenhuma ocorrência" description="Quando você registrar uma ruptura durante a visita, ela aparece aqui." />
            </div>
          ) : (
            myOccurrences.map((o) => (
              <article key={o.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink-900">{o.pdvNome}</p>
                    <p className="text-xs text-ink-500">{o.tipo} · {o.horario}</p>
                  </div>
                  <SeverityBadge value={o.criticidade} />
                </div>
                <p className="mt-1.5 text-[13px] text-ink-600">{o.produto}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <OccurrenceStatusBadge value={o.status} />
                  <SLAIndicator occurrence={o} compact />
                </div>
              </article>
            ))
          )}
        </div>
      )
    } else {
      content = (
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-500 text-xl font-extrabold text-white">{promoter.iniciais}</span>
            <p className="mt-3 text-lg font-extrabold text-ink-900">{promoter.nome}</p>
            <p className="text-[13px] text-ink-500">Promotor de campo · {promoter.regiao}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-xl bg-ink-50 px-3 py-2.5"><dt className="text-[11px] font-semibold text-ink-500">Base de saída</dt><dd className="text-[13px] font-bold text-ink-900">{promoter.baseNome}</dd></div>
              <div className="rounded-xl bg-ink-50 px-3 py-2.5"><dt className="text-[11px] font-semibold text-ink-500">Telefone</dt><dd className="text-[13px] font-bold text-ink-900">{promoter.telefone}</dd></div>
            </dl>
          </div>
          <div className="space-y-2">
            <Button variant="secondary" size="lg" className="w-full" onClick={switchToManager}>
              <LayoutDashboard className="size-5" />
              Trocar para o Gestor
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={doReset}>
              <RotateCcw className="size-5" />
              Restaurar dados da demonstração
            </Button>
            <Button variant="ghost" size="lg" className="w-full text-crit-600 hover:bg-crit-50" onClick={logout}>
              <LogOut className="size-5" />
              Sair
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-ink-100 via-ink-50 to-brand-50 sm:p-4 lg:gap-16">
      <aside className="hidden max-w-sm lg:block">
        <Logo />
        <h1 className="mt-8 text-3xl font-extrabold leading-tight tracking-tight text-ink-900">App do promotor</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
          Simulação do aplicativo de campo. A rota exibida é a mesma que o gestor definiu no perfil de priorização.
        </p>
        <ol className="mt-6 space-y-2.5 text-sm text-ink-700">
          {['Escolha um PDV e toque em Visitar PDV', 'Faça o check-in e preencha o checklist', 'Registre uma ruptura crítica', 'Volte ao gestor e veja o alerta com SLA'].map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-brand-600 shadow-sm">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button onClick={switchToManager}>
            <LayoutDashboard className="size-4" />
            Trocar para o Gestor
          </Button>
          <Button variant="secondary" onClick={doReset}>
            <RotateCcw className="size-4" />
            Restaurar dados
          </Button>
        </div>
        <p className="mt-4 text-xs text-ink-500">Dica: abra o painel do gestor em outra aba. Os alertas aparecem lá assim que você envia a ocorrência.</p>
      </aside>
      <MobileFrame footer={nav || undefined}>
        {content}
      </MobileFrame>
    </div>
  )
}
