import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Info, RotateCcw, Rocket, Smartphone, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { WeightSlider } from '../components/WeightSlider'
import { ImpactPreview } from '../components/ImpactPreview'
import { RankingTable } from '../components/RankingTable'
import { ScoreLegend } from '../components/ScoreIndicator'
import { RouteMap } from '../components/RouteMap'
import { RouteTimeline } from '../components/RouteTimeline'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useRankings } from '../hooks/useRankings'
import { STRATEGY_PRESETS } from '../services/dataService'
import { WEIGHT_KEYS, redistributeWeights, sameWeights } from '../services/scoringService'
import { mockUsers } from '../data/mockUsers'
import { VARIABLES } from '../utils/meta'
import type { WeightKey } from '../types/prioritization'

export default function PrioritizationPage() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const { promoters, applied, draft, appliedRoutes, draftRoutes, draftDiff } = useRankings()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [justApplied, setJustApplied] = useState(false)
  const [promoterId, setPromoterId] = useState(promoters[0].id)

  const dirty = !sameWeights(state.draftWeights, state.profile.weights)
  const activePreset = STRATEGY_PRESETS.find((preset) => sameWeights(preset.weights, state.draftWeights))
  const promoter = promoters.find((p) => p.id === promoterId)!
  const promoterIndex = promoters.findIndex((p) => p.id === promoterId)
  const focusPdv = draft.find((item) => item.pdv.nome === 'Carrefour Vila Mariana')

  const changeWeight = (key: WeightKey, value: number) => {
    setJustApplied(false)
    dispatch({ type: 'SET_DRAFT', weights: redistributeWeights(state.draftWeights, key, value) })
  }

  const applyProfile = () => {
    dispatch({ type: 'APPLY_PROFILE' })
    setConfirmOpen(false)
    setJustApplied(true)
    toast.push({
      tone: 'success',
      title: 'Perfil atualizado',
      description: `${draftDiff.moved} PDVs tiveram alteração de prioridade. As rotas dos promotores foram recalculadas.`,
    })
  }

  const openPromoterApp = () => {
    const user = mockUsers.find((u) => u.role === 'promotor')!
    dispatch({ type: 'LOGIN', session: { email: user.email, nome: user.nome, cargo: user.cargo, role: 'promotor', promoterId: user.promoterId } })
    navigate('/promotor')
  }

  return (
    <div>
      <PageHeader title="Perfis de priorização" subtitle="Configure como o Rotta prioriza os pontos de venda da sua operação." />

      <Card className="mb-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-ink-900">{state.profile.nome}</h2>
                <span className="rounded-full bg-ok-50 px-2 py-0.5 text-[11px] font-bold text-ok-700 ring-1 ring-inset ring-ok-100">Ativo</span>
                {dirty && (
                  <span className="animate-pop-in rounded-full bg-warn-50 px-2 py-0.5 text-[11px] font-bold text-warn-700 ring-1 ring-inset ring-warn-100">
                    Prévia não aplicada
                  </span>
                )}
              </div>
              <p className="text-[13px] text-ink-500">{state.profile.descricao}</p>
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <p className="mb-1.5 text-xs font-semibold text-ink-500">Modelos de estratégia</p>
            <div className="flex flex-wrap gap-2">
              {STRATEGY_PRESETS.map((preset) => {
                const on = activePreset?.id === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setJustApplied(false)
                      dispatch({ type: 'SET_DRAFT', weights: preset.weights })
                    }}
                    title={preset.descricao}
                    aria-pressed={on}
                    className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition ${
                      on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    {preset.nome}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(340px,5fr)_7fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Pesos das variáveis" subtitle="Ao mover um peso, os outros se ajustam para somar 100%." />
            <div className="space-y-3 px-5 pb-2 pt-4">
              {WEIGHT_KEYS.map((key) => (
                <WeightSlider key={key} variable={key} value={state.draftWeights[key]} applied={state.profile.weights[key]} onChange={(v) => changeWeight(key, v)} />
              ))}
            </div>
            <div className="mx-5 mt-3 rounded-xl bg-ink-50 px-4 py-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink-600">Soma dos pesos</span>
                <span className="inline-flex items-center gap-1.5 font-extrabold text-ok-600">
                  <CheckCircle2 className="size-4" />
                  {WEIGHT_KEYS.reduce((sum, k) => sum + state.draftWeights[k], 0)}%
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">
                Score = {WEIGHT_KEYS.map((k) => `${state.draftWeights[k]}% × ${VARIABLES[k].short.toLowerCase()}`).join(' + ')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 px-5 pb-5 pt-4">
              <Button
                variant="secondary"
                disabled={!dirty}
                onClick={() => {
                  dispatch({ type: 'SET_DRAFT', weights: state.profile.weights })
                  toast.push({ tone: 'info', title: 'Alterações descartadas', description: 'Os pesos voltaram ao perfil aplicado.' })
                }}
              >
                <RotateCcw className="size-4" />
                Descartar
              </Button>
              <Button disabled={!dirty} onClick={() => setConfirmOpen(true)}>
                <Rocket className="size-4" />
                Aplicar perfil
              </Button>
            </div>
          </Card>

          {justApplied && !dirty && (
            <Card className="animate-pop-in border-ok-100 bg-ok-50/50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok-600" />
                <div>
                  <p className="text-sm font-bold text-ok-700">Perfil aplicado</p>
                  <p className="mt-0.5 text-[13px] text-ink-600">A nova rota já está no app dos promotores. Abra o app para conferir a primeira parada.</p>
                  <Button size="sm" className="mt-3" onClick={openPromoterApp}>
                    <Smartphone className="size-4" />
                    Ver rota no app do promotor
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Prévia do impacto" subtitle="Comparação com o perfil aplicado hoje" />
            <div className="px-5 pb-5 pt-4">
              <ImpactPreview diff={draftDiff} draft={draft} appliedRoutes={appliedRoutes} draftRoutes={draftRoutes} />
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <CardHeader
              title="Ranking em tempo real"
              subtitle="Cada barra mostra quanto cada variável contribuiu para o score."
              action={
                dirty ? (
                  <span key={draftDiff.moved} className="animate-pop-in rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    Perfil atualizado · {draftDiff.moved} PDVs com prioridade alterada
                  </span>
                ) : undefined
              }
            />
            <div className="px-5 pb-3 pt-3">
              <ScoreLegend />
              {focusPdv && dirty && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-600">
                  <Info className="size-4 text-brand-500" />
                  Carrefour Vila Mariana: #{applied.find((a) => a.pdv.id === focusPdv.pdv.id)?.rank} no perfil aplicado, #{focusPdv.rank} na prévia.
                </p>
              )}
            </div>
            <RankingTable items={draft} baseline={applied} variant="compact" highlightId={focusPdv?.pdv.id} />
          </Card>

          <Card>
            <CardHeader
              title="Rota sugerida"
              subtitle="Scoring define a prioridade. A roteirização define a sequência de visita."
              action={
                <div className="flex rounded-xl bg-ink-100 p-1" role="tablist" aria-label="Promotor">
                  {promoters.map((p) => (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={p.id === promoterId}
                      onClick={() => setPromoterId(p.id)}
                      className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${p.id === promoterId ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}
                    >
                      {p.nome.split(' ')[0]}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="grid items-start gap-5 p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <RouteMap promoters={promoters} routes={draftRoutes} selectedId={promoterId} compact className="lg:sticky lg:top-24" />
              <RouteTimeline route={draftRoutes[promoterId]} promoter={promoters[promoterIndex]} previousRoute={appliedRoutes[promoterId]} />
            </div>
            <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
              Rota de {promoter.nome} gerada com os pesos {dirty ? 'da prévia' : 'do perfil aplicado'}.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Aplicar perfil de priorização"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={applyProfile}>
              <Rocket className="size-4" />
              Aplicar perfil
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          O perfil <b className="text-ink-900">{state.profile.nome}</b> passa a valer para toda a operação.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
          <li>
            <b>{draftDiff.moved}</b> PDVs mudam de posição no ranking.
          </li>
          <li>
            <b>{draftDiff.newCritical}</b> PDVs passam para prioridade crítica.
          </li>
          <li>As rotas de <b>{promoters.length}</b> promotores são recalculadas e enviadas ao app.</li>
        </ul>
      </Modal>
    </div>
  )
}
