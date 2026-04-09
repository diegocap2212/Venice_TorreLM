"use client"

import { useState } from "react"
import { format, isPast, isToday, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CheckCircle2, Clock, AlertCircle, MessageSquare, Users,
  Timer, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { marcarFollowUpRealizado } from "@/app/actions/followup-actions"
import { HoraExtraTable } from "./hora-extra-table"

const TIPO_CONFIG = {
  SEMANA_1: { label: "1ª Semana", icon: "🟢", days: 7 },
  MES_1: { label: "1 Mês", icon: "🔵", days: 30 },
  FEEDBACK_45: { label: "45 Dias (Gestor)", icon: "🟡", days: 45 },
  FEEDBACK_90: { label: "90 Dias (Gestor)", icon: "🟠", days: 90 },
}

const MENSAGEM_PADRAO = (nome: string) => `Bom dia, ${nome.split(" ")[0]}! Tudo bem?

Segue nosso material de onboarding 😊
Qualquer dúvida ou suporte que precisar, fico à disposição!

Alguns pontos importantes:
• Atualize seu LinkedIn com sua atuação na LM/Venice e utilize nosso fundo de capa;
• Segue também nosso NPS para avaliar sua experiência até o onboarding;
• O e-mail da Venice deve ser utilizado no dia a dia — comunicações sobre espelho de nota e pagamento serão enviadas por lá;
• Nosso contato será realizado via Discord, então é importante se manter logado.

Informações financeiras:
• O pagamento é realizado em parcela única, sempre até o 5º dia útil;
• O espelho de nota será enviado pelo financeiro entre os dias 1 e 3 de cada mês;
• A planilha de horas extras deve ser enviada no último dia do mês, dentro do horário comercial.`

interface PosAdmissaoDashboardProps {
  colaboradores: any[]
  followUpsPendentes: any[]
  horasExtrasMes: any[]
  mesAtual: string
}

export function PosAdmissaoDashboard({
  colaboradores,
  followUpsPendentes,
  horasExtrasMes,
  mesAtual
}: PosAdmissaoDashboardProps) {
  const [activeTab, setActiveTab] = useState<"followups" | "horas" | "mensagem">("followups")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [notaTexts, setNotaTexts] = useState<Record<string, string>>({})
  const [markingDone, setMarkingDone] = useState<string | null>(null)
  const [doneFeedback, setDoneFeedback] = useState<string | null>(null)
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null)
  const [mensagemColaborador, setMensagemColaborador] = useState(colaboradores[0]?.nome || "")

  const atrasados = followUpsPendentes.filter(f => isPast(new Date(f.data_prevista)) && !isToday(new Date(f.data_prevista)))
  const hoje = followUpsPendentes.filter(f => isToday(new Date(f.data_prevista)))
  const proximos = followUpsPendentes.filter(f => !isPast(new Date(f.data_prevista)) || isToday(new Date(f.data_prevista)))

  const handleMarcarRealizado = async (followup_id: string) => {
    setMarkingDone(followup_id)
    const nota = notaTexts[followup_id]
    await marcarFollowUpRealizado(followup_id, nota)
    setDoneFeedback(followup_id)
    setTimeout(() => { setDoneFeedback(null); setMarkingDone(null) }, 1500)
  }

  const handleCopyMensagem = (nome: string, id: string) => {
    navigator.clipboard.writeText(MENSAGEM_PADRAO(nome))
    setCopiedMsg(id)
    setTimeout(() => setCopiedMsg(null), 2000)
  }

  const tabs = [
    { id: "followups", label: "Follow-ups", count: followUpsPendentes.length, alert: atrasados.length > 0 },
    { id: "horas", label: "Horas Extras", count: horasExtrasMes.length },
    { id: "mensagem", label: "Template Mensagem" },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs de Alerta */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-5 ${atrasados.length > 0 ? "bg-rose-50 border-rose-200" : "bg-white border-slate-100"} shadow-sm`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Follow-ups Atrasados</p>
          <p className={`text-4xl font-black ${atrasados.length > 0 ? "text-rose-700" : "text-slate-800"}`}>{atrasados.length}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${hoje.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"} shadow-sm`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Para Hoje</p>
          <p className={`text-4xl font-black ${hoje.length > 0 ? "text-amber-700" : "text-slate-800"}`}>{hoje.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Horas Extras ({mesAtual})</p>
          <p className="text-4xl font-black text-slate-800">{horasExtrasMes.reduce((a, h) => a + h.horas, 0)}h</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-white text-foreground shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.alert && <span className="w-2 h-2 bg-rose-500 rounded-full" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === "followups" && (
        <div className="space-y-3">
          {followUpsPendentes.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-semibold">Tudo em dia! Nenhum follow-up pendente.</p>
            </div>
          )}

          {atrasados.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 overflow-hidden">
              <div className="px-5 py-3 bg-rose-100/70 border-b border-rose-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Atrasados
                </p>
              </div>
              {atrasados.map(f => (
                <FollowUpRow key={f.id} followup={f} expandedCard={expandedCard} setExpandedCard={setExpandedCard}
                  notaTexts={notaTexts} setNotaTexts={setNotaTexts} markingDone={markingDone}
                  doneFeedback={doneFeedback} handleMarcarRealizado={handleMarcarRealizado} isAtrasado />
              ))}
            </div>
          )}

          {proximos.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Próximos
                </p>
              </div>
              {proximos.map(f => (
                <FollowUpRow key={f.id} followup={f} expandedCard={expandedCard} setExpandedCard={setExpandedCard}
                  notaTexts={notaTexts} setNotaTexts={setNotaTexts} markingDone={markingDone}
                  doneFeedback={doneFeedback} handleMarcarRealizado={handleMarcarRealizado} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "horas" && (
        <HoraExtraTable
          horasExtras={horasExtrasMes}
          colaboradores={colaboradores}
          mesAtual={mesAtual}
        />
      )}

      {activeTab === "mensagem" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Mensagem Pós-Onboarding
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Selecione o colaborador para personalizar</p>
            </div>

            <div className="mb-4">
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 bg-white"
                value={mensagemColaborador}
                onChange={e => setMensagemColaborador(e.target.value)}
              >
                {colaboradores.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {MENSAGEM_PADRAO(mensagemColaborador)}
              </pre>
              <Button
                onClick={() => handleCopyMensagem(mensagemColaborador, "main")}
                className={`absolute top-3 right-3 h-8 gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  copiedMsg === "main"
                    ? "bg-emerald-500 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {copiedMsg === "main" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedMsg === "main" ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-componente: Row do Follow-up ────────────────────────────────────────

function FollowUpRow({
  followup, expandedCard, setExpandedCard, notaTexts, setNotaTexts,
  markingDone, doneFeedback, handleMarcarRealizado, isAtrasado = false
}: any) {
  const tipoConfig = TIPO_CONFIG[followup.tipo as keyof typeof TIPO_CONFIG]
  const isExpanded = expandedCard === followup.id
  const diasRestantes = differenceInDays(new Date(followup.data_prevista), new Date())
  const isDone = doneFeedback === followup.id

  return (
    <div className={`border-b border-slate-100 last:border-0 transition-colors ${isAtrasado ? "hover:bg-rose-50/30" : "hover:bg-slate-50/50"}`}>
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setExpandedCard(isExpanded ? null : followup.id)}
      >
        <div className="flex items-center gap-4">
          <span className="text-xl">{tipoConfig?.icon}</span>
          <div>
            <p className="font-bold text-sm text-slate-800">{followup.colaborador.nome}</p>
            <p className="text-[10px] text-slate-400 font-medium">{followup.colaborador.cargo} · {followup.colaborador.squad}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-[10px] font-black uppercase tracking-widest ${isAtrasado ? "text-rose-600" : "text-slate-400"}`}>
              {tipoConfig?.label}
            </p>
            <p className="text-xs font-bold text-slate-600">
              {format(new Date(followup.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
              {isAtrasado && <span className="text-rose-600 ml-1">({Math.abs(diasRestantes)}d atrás)</span>}
            </p>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <Textarea
            placeholder="Registrar notas do contato (opcional)..."
            className="rounded-xl border-slate-200 text-sm min-h-[80px] resize-none"
            value={notaTexts[followup.id] || ""}
            onChange={e => setNotaTexts((p: any) => ({ ...p, [followup.id]: e.target.value }))}
          />
          <Button
            onClick={() => handleMarcarRealizado(followup.id)}
            disabled={!!markingDone}
            className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-wider gap-2 transition-all ${
              isDone ? "bg-emerald-500" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isDone ? <><Check className="w-4 h-4" /> Realizado!</> : <><CheckCircle2 className="w-4 h-4" /> Marcar como Realizado</>}
          </Button>
        </div>
      )}
    </div>
  )
}
