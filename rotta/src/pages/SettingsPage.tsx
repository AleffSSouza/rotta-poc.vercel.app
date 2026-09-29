import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { NORMALIZATION_DOMAINS, PRIORITY_THRESHOLDS, WEIGHT_KEYS } from '../services/scoringService'
import { AVG_SPEED_KMH, DISTANCE_PENALTY_PER_KM } from '../services/routeService'
import { SLA_MINUTES } from '../services/occurrenceService'
import { ROAD_FACTOR } from '../utils/geo'
import { VARIABLES } from '../utils/meta'

export default function SettingsPage() {
  const { resetDemo } = useApp()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)

  const reset = () => {
    resetDemo()
    setConfirm(false)
    toast.push({ tone: 'info', title: 'Dados da demonstração restaurados', description: 'Perfil, ocorrências e visitas voltaram ao estado inicial.' })
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Configurações" subtitle="Parâmetros do motor de priorização e dados da demonstração." />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold text-ink-900">Dados da demonstração</h3>
            <p className="mt-0.5 max-w-xl text-[13px] text-ink-500">
              Tudo o que você altera fica salvo neste navegador (perfil, pesos, ocorrências e visitas). Restaurar volta a demonstração ao ponto inicial.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setConfirm(true)}>
            <RotateCcw className="size-4" />
            Restaurar dados da demonstração
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Normalização das variáveis" subtitle="Cada variável é convertida para uma escala de 0 a 100 antes de receber o peso." className="pb-4" />
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-y border-ink-100 bg-ink-50 text-xs font-semibold text-ink-500">
                  <th className="px-5 py-2.5">Variável</th>
                  <th className="px-3 py-2.5">Escala usada</th>
                  <th className="px-5 py-2.5">Sentido</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_KEYS.map((key) => (
                  <tr key={key} className="border-b border-ink-100 last:border-b-0">
                    <td className="px-5 py-3 font-semibold text-ink-900">{VARIABLES[key].label}</td>
                    <td className="px-3 py-3 tabular-nums text-ink-700">
                      {NORMALIZATION_DOMAINS[key].min} a {NORMALIZATION_DOMAINS[key].max} {NORMALIZATION_DOMAINS[key].unidade}
                    </td>
                    <td className="px-5 py-3 text-ink-500">{VARIABLES[key].direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Níveis de prioridade" subtitle="Faixas de score que definem a classificação do PDV." />
            <ul className="space-y-2 px-5 pb-5 pt-4 text-sm">
              <li className="flex justify-between"><span className="font-semibold text-crit-700">Crítico</span><span className="tabular-nums text-ink-700">score a partir de {PRIORITY_THRESHOLDS.critico}</span></li>
              <li className="flex justify-between"><span className="font-semibold text-warn-700">Alto</span><span className="tabular-nums text-ink-700">de {PRIORITY_THRESHOLDS.alto} a {PRIORITY_THRESHOLDS.critico - 0.1}</span></li>
              <li className="flex justify-between"><span className="font-semibold text-info-600">Médio</span><span className="tabular-nums text-ink-700">de {PRIORITY_THRESHOLDS.medio} a {PRIORITY_THRESHOLDS.alto - 0.1}</span></li>
              <li className="flex justify-between"><span className="font-semibold text-ink-600">Baixo</span><span className="tabular-nums text-ink-700">abaixo de {PRIORITY_THRESHOLDS.medio}</span></li>
            </ul>
          </Card>
          <Card>
            <CardHeader title="Prazo de atendimento (SLA)" subtitle="Tempo para tratar uma ruptura, por criticidade." />
            <ul className="grid grid-cols-2 gap-2 px-5 pb-5 pt-4 text-sm sm:grid-cols-4">
              {(Object.keys(SLA_MINUTES) as (keyof typeof SLA_MINUTES)[]).map((key) => (
                <li key={key} className="rounded-xl bg-ink-50 px-3 py-2.5">
                  <p className="text-xs font-semibold text-ink-500">{key}</p>
                  <p className="text-base font-extrabold tabular-nums text-ink-900">{SLA_MINUTES[key]} min</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Como a roteirização decide a ordem" subtitle="Heurística simples, suficiente para demonstrar o conceito." />
        <div className="grid gap-3 px-5 pb-5 pt-4 text-sm text-ink-700 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-ink-50 p-3.5"><p className="text-xs font-semibold text-ink-500">Saída do promotor</p><p className="mt-0.5 font-bold text-ink-900">08:00, da base</p></div>
          <div className="rounded-xl bg-ink-50 p-3.5"><p className="text-xs font-semibold text-ink-500">Velocidade média</p><p className="mt-0.5 font-bold text-ink-900">{AVG_SPEED_KMH} km/h</p></div>
          <div className="rounded-xl bg-ink-50 p-3.5"><p className="text-xs font-semibold text-ink-500">Distância viária</p><p className="mt-0.5 font-bold text-ink-900">Linha reta × {String(ROAD_FACTOR).replace('.', ',')}</p></div>
          <div className="rounded-xl bg-ink-50 p-3.5"><p className="text-xs font-semibold text-ink-500">Penalização de trajeto</p><p className="mt-0.5 font-bold text-ink-900">{String(DISTANCE_PENALTY_PER_KM).replace('.', ',')} ponto de score por km</p></div>
        </div>
        <p className="border-t border-ink-100 px-5 py-4 text-[13px] leading-relaxed text-ink-500">
          A cada parada, o Rotta escolhe o PDV com maior valor de (score menos a penalização pelos km até ele). Esta POC não usa serviços de mapa nem otimizador de rotas completo; ambos entram na versão de produção.
        </p>
      </Card>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Restaurar dados da demonstração?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button variant="danger" onClick={reset}>Restaurar dados</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">O perfil de priorização, as ocorrências criadas e o andamento das visitas voltam ao estado inicial. Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}
