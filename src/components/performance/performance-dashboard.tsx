"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight,
  Calendar, TrendingUp, Users, Loader2, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { atualizarCicloStatus, criarCicloPeriodo } from "@/app/actions/ciclo-actions"

const TIPO_CONFIG = {
  AUTOAVALIACAO: {
    label: "Autoavaliação",
    desc: "BP envia formulário de autoavaliação",
    icon: "📝",
    responsavel: "BP",
    color: "bg-violet-50 text-violet-700 border-violet-200"
  },
  FEEDBACK_CLIENTE: {
    label: "Feedback do Cliente",
    desc: "Gestor de Contas colhe feedback do cliente",
    icon: "💬",
    responsavel: "GESTOR_CONTAS",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  PDI: {
    label: "PDI",
    desc: "Plano de Desenvolvimento Individual",
    icon: "🎯",
    responsavel: "BP",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  PIP: {
    label: "PIP",
    desc: "Plano de Melhoria de Performance",
    icon: "⚡",
    responsavel: "BP",
    color: "bg-rose-50 text-rose-700 border-rose-200"
  },
}

const STATUS_CONFIG = {
  PENDENTE: { label: "Pendente", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  EM_ANDAMENTO: { label: "Em Andamento", icon: TrendingUp, color: "text-blue-600 bg-blue-50 border-blue-200" },
  CONCLUIDO: { label: "Concluído", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
}

interface PerformanceDashboardProps {
  colaboradores: any[]
  ciclosPendentes: any[]
  periodoAtual: string
}

export function PerformanceDashboard({ colaboradores, ciclosPendentes, periodoAtual }: PerformanceDashboardProps) {
  const [view, setView] = useState<"pendentes" | "colaboradores">("pendentes")
  const [expandedColab, setExpandedColab] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [criandoCiclo, setCriandoCiclo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [ciclos, setCiclos] = useState(ciclosPendentes)
  const [localColabs, setLocalColabs] = useState(colaboradores)

  const periodoLabel = periodoAtual.endsWith("S1") ? "1º Ciclo (Mar–Mai)" : "2º Ciclo (Out–Dez)"

  const concluidos = ciclosPendentes.filter(c => c.status === "CONCLUIDO").length
  const emAndamento = ciclosPendentes.filter(c => c.status === "EM_ANDAMENTO").length
  const pendentes = ciclosPendentes.filter(c => c.status === "PENDENTE").length

  const handleAtualizarStatus = (id: string, novoStatus: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO") => {
    setUpdatingId(id)
    startTransition(async () => {
      await atualizarCicloStatus(id, novoStatus)
      setCiclos(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c))
      setLocalColabs(prev => prev.map(col => ({
        ...col,
        ciclos_performance: col.ciclos_performance?.map((c: any) =>
          c.id === id ? { ...c, status: novoStatus } : c
        )
      })))
      setUpdatingId(null)
    })
  }

  const handleCriarCiclo = (colaborador_id: string) => {
    setCriandoCiclo(colaborador_id)
    startTransition(async () => {
      await criarCicloPeriodo(colaborador_id, periodoAtual)
      setCriandoCiclo(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Período Ativo", value: periodoLabel, isText: true, color: "text-slate-800", bg: "bg-white" },
          { label: "Pendentes", value: pendentes, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Em Andamento", value: emAndamento, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Concluídos", value: concluidos, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl border border-slate-100 p-5 shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
            <p className={`${kpi.isText ? "text-base" : "text-4xl"} font-black ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Timeline visual do calendário */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Calendário da Jornada de Performance
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { tempo: "1 Semana", resp: "BP", desc: "BP entra em contato para acolher percepções da primeira semana", icon: "🟢" },
            { tempo: "Ciclo Início", resp: "BP", desc: "BP envia formulário de autoavaliação para os colaboradores", icon: "📝" },
            { tempo: "45 Dias", resp: "Gestor de Contas", desc: "Gestor se aproxima para entender o primeiro período", icon: "💬" },
            { tempo: "90 Dias", resp: "Gestor de Contas", desc: "Gestor colhe feedback do cliente e revisita o colaborador", icon: "🎯" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{step.icon}</span>
                <div>
                  <p className="font-black text-sm text-slate-800">{step.tempo}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary">{step.resp}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Views */}
      <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
        {[{ id: "pendentes", label: "Ciclos Pendentes" }, { id: "colaboradores", label: "Por Colaborador" }].map(tab => (
          <button
            key={tab.id}
            id={`tab-perf-${tab.id}`}
            onClick={() => setView(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              view === tab.id ? "bg-white text-foreground shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ciclos Pendentes */}
      {view === "pendentes" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <span>Colaborador</span>
            <span>Tipo</span>
            <span>Prazo</span>
            <span>Status</span>
            <span>Ação</span>
          </div>

          {ciclos.filter(c => c.status !== "CONCLUIDO").length === 0 && (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
              <p className="font-semibold text-sm">Todos os ciclos concluídos!</p>
            </div>
          )}

          {ciclos.filter(c => c.status !== "CONCLUIDO").map(ciclo => {
            const tipoConfig = TIPO_CONFIG[ciclo.tipo as keyof typeof TIPO_CONFIG]
            const statusConfig = STATUS_CONFIG[ciclo.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = statusConfig?.icon

            return (
              <div key={ciclo.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-6 py-4 border-b border-slate-50 hover:bg-slate-50/40 last:border-0">
                <div>
                  <p className="font-bold text-sm text-slate-800">{ciclo.colaborador?.nome}</p>
                  <p className="text-[10px] text-slate-400">{ciclo.colaborador?.cargo} · {ciclo.colaborador?.squad}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span>{tipoConfig?.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tipoConfig?.color}`}>
                    {tipoConfig?.label}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-600">
                  {format(new Date(ciclo.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                </p>

                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${statusConfig?.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig?.label}
                </span>

                <div className="flex items-center gap-1">
                  {ciclo.status === "PENDENTE" && (
                    <Button variant="ghost" size="sm"
                      disabled={updatingId === ciclo.id}
                      onClick={() => handleAtualizarStatus(ciclo.id, "EM_ANDAMENTO")}
                      className="h-7 px-2.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg">
                      Iniciar
                    </Button>
                  )}
                  {ciclo.status === "EM_ANDAMENTO" && (
                    <Button variant="ghost" size="sm"
                      disabled={updatingId === ciclo.id}
                      onClick={() => handleAtualizarStatus(ciclo.id, "CONCLUIDO")}
                      className="h-7 px-2.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      Concluir
                    </Button>
                  )}
                  {updatingId === ciclo.id && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Por Colaborador */}
      {view === "colaboradores" && (
        <div className="space-y-2">
          {localColabs.map(colab => {
            const colabCiclos = colab.ciclos_performance || []
            const isExpanded = expandedColab === colab.id
            const hasCiclos = colabCiclos.length > 0
            const allDone = hasCiclos && colabCiclos.every((c: any) => c.status === "CONCLUIDO")

            return (
              <div key={colab.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/40 transition-colors"
                  onClick={() => setExpandedColab(isExpanded ? null : colab.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">
                      {colab.nome.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-slate-800">{colab.nome}</p>
                      <p className="text-[10px] text-slate-400">{colab.cargo} · {colab.squad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {allDone && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✅ Ciclo Completo</span>}
                    {!hasCiclos && <span className="text-[10px] font-black text-slate-400">Sem ciclo iniciado</span>}
                    {!allDone && hasCiclos && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {colabCiclos.filter((c: any) => c.status !== "CONCLUIDO").length} pendente(s)
                      </span>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {!hasCiclos ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Nenhum ciclo iniciado para {periodoLabel}</p>
                        <Button size="sm"
                          disabled={criandoCiclo === colab.id}
                          onClick={() => handleCriarCiclo(colab.id)}
                          className="rounded-xl bg-primary font-bold gap-2 text-xs">
                          {criandoCiclo === colab.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          Iniciar Ciclo
                        </Button>
                      </div>
                    ) : (
                      colabCiclos.map((ciclo: any) => {
                        const tipoConfig = TIPO_CONFIG[ciclo.tipo as keyof typeof TIPO_CONFIG]
                        const statusConfig = STATUS_CONFIG[ciclo.status as keyof typeof STATUS_CONFIG]

                        return (
                          <div key={ciclo.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className="text-base">{tipoConfig?.icon}</span>
                              <div>
                                <p className="font-bold text-xs text-slate-700">{tipoConfig?.label}</p>
                                <p className="text-[9px] text-slate-400">{tipoConfig?.desc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusConfig?.color}`}>
                                {statusConfig?.label}
                              </span>
                              {ciclo.status !== "CONCLUIDO" && (
                                <Button variant="ghost" size="sm"
                                  disabled={updatingId === ciclo.id}
                                  onClick={() => handleAtualizarStatus(ciclo.id, ciclo.status === "PENDENTE" ? "EM_ANDAMENTO" : "CONCLUIDO")}
                                  className="h-6 px-2 text-[9px] font-bold text-primary hover:bg-primary/10 rounded-lg">
                                  {ciclo.status === "PENDENTE" ? "Iniciar" : "Concluir"}
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
