"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Shield, CheckCircle2, Clock, XCircle, ExternalLink, UserRound } from "lucide-react"
import { AddCandidatoDialog } from "./add-candidato-dialog"
import { updateStatusCPF } from "@/app/actions/candidato-actions"

const CPF_STATUS_CONFIG = {
  PENDENTE: { label: "Pendente", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  APROVADO: { label: "CPF OK", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REPROVADO: { label: "Reprovado", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
}

const CANDIDATO_STATUS_CONFIG = {
  EM_PROCESSO: { label: "Em Processo", color: "bg-blue-50 text-blue-700 border-blue-200" },
  APROVADO: { label: "Aprovado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REPROVADO: { label: "Reprovado", color: "bg-rose-50 text-rose-700 border-rose-200" },
  DESISTIU: { label: "Desistiu", color: "bg-slate-50 text-slate-500 border-slate-200" },
}

interface CandidatosListProps {
  initialData: any[]
}

export function CandidatosList({ initialData }: CandidatosListProps) {
  const [candidatos, setCandidatos] = useState(initialData)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updatingCPF, setUpdatingCPF] = useState<string | null>(null)

  const filtered = candidatos.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleUpdateCPF = async (candidato_id: string, status: "APROVADO" | "REPROVADO" | "PENDENTE") => {
    setUpdatingCPF(candidato_id)
    const res = await updateStatusCPF(candidato_id, status)
    if (res.success) {
      setCandidatos(prev => prev.map(c =>
        c.id === candidato_id ? { ...c, status_cpf: status } : c
      ))
    }
    setUpdatingCPF(null)
  }

  const totais = {
    total: candidatos.length,
    pendentes: candidatos.filter(c => c.status_cpf === "PENDENTE").length,
    aprovados: candidatos.filter(c => c.status_cpf === "APROVADO").length,
    reprovados: candidatos.filter(c => c.status_cpf === "REPROVADO").length,
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total de Candidatos", value: totais.total, color: "text-slate-800", bg: "bg-white/60", iconColor: "bg-slate-100 text-slate-600" },
          { label: "CPF Pendente", value: totais.pendentes, color: "text-amber-700", bg: "bg-white/60 bg-amber-50/20", iconColor: "bg-amber-100 text-amber-700" },
          { label: "CPF Aprovado", value: totais.aprovados, color: "text-emerald-700", bg: "bg-white/60 bg-emerald-50/20", iconColor: "bg-emerald-100 text-emerald-700" },
          { label: "Reprovados", value: totais.reprovados, color: "text-rose-700", bg: "bg-white/60 bg-rose-50/20", iconColor: "bg-rose-100 text-rose-700" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} backdrop-blur-xl rounded-[24px] border border-border/40 p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{kpi.label}</p>
               <div className={`p-1.5 rounded-lg ${kpi.iconColor}`}>
                  <UserRound className="w-3.5 h-3.5" />
               </div>
            </div>
            <p className={`text-5xl font-black tracking-tighter ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[24px] bg-white/60 backdrop-blur-xl border border-border/40 shadow-sm relative z-10">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl border-slate-200 bg-white shadow-inner"
          />
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-xl h-11 px-6 gap-2 bg-primary hover:bg-primary/90 font-bold shadow-md shadow-primary/20 w-full sm:w-auto"
          id="btn-add-candidato"
        >
          <Plus className="w-4 h-4" />
          Novo Candidato
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden relative z-10">
        <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr_auto] gap-4 items-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 px-8 py-5 border-b border-border/50 bg-slate-50/50">
          <span>Candidato</span>
          <span>Status CPF</span>
          <span>Contato</span>
          <span>Vagas Vinculadas</span>
          <span className="text-right">Ações</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserRound className="w-12 h-12 mb-4 opacity-30 text-primary" />
            <p className="font-bold text-base text-foreground/60">Nenhum candidato encontrado</p>
            <p className="text-sm mt-1 text-foreground/40">Clique em "Novo Candidato" para adicionar</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map((candidato) => {
              const cpfConfig = CPF_STATUS_CONFIG[candidato.status_cpf as keyof typeof CPF_STATUS_CONFIG] || CPF_STATUS_CONFIG.PENDENTE
              const StatusIcon = cpfConfig.icon

              return (
                <div
                  key={candidato.id}
                  className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr_auto] gap-4 items-center px-8 py-5 hover:bg-white transition-all duration-300 group"
                >
                  {/* Nome */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm shrink-0 border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                      {candidato.nome.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-slate-800 truncate">{candidato.nome}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{candidato.email || "—"}</p>
                    </div>
                  </div>

                  {/* Status CPF — sempre mascarado */}
                  <div className="flex flex-col gap-1.5 justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${cpfConfig.color} w-fit shadow-sm`}>
                      <StatusIcon className="w-3 h-3" />
                      {cpfConfig.label}
                    </span>
                    {candidato.cpf_masked && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold ml-1">
                        <Shield className="w-2.5 h-2.5" />
                        <span className="font-mono tracking-widest">{candidato.cpf_masked}</span>
                      </div>
                    )}
                  </div>

                  {/* Contato */}
                  <div className="flex flex-col gap-1 justify-center">
                    <p className="text-xs font-semibold text-slate-600">{candidato.telefone || "—"}</p>
                    {candidato.linkedin && (
                      <a
                        href={candidato.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 group/link"
                      >
                        LinkedIn <ExternalLink className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </a>
                    )}
                  </div>

                  {/* Vagas */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {candidato.vagas.slice(0, 2).map((vc: any) => (
                      <span
                        key={vc.vaga.id}
                        className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        {vc.vaga.titulo.substring(0, 25)}{vc.vaga.titulo.length > 25 ? "…" : ""}
                      </span>
                    ))}
                    {candidato.vagas.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-black px-1">+{candidato.vagas.length - 2}</span>
                    )}
                    {candidato.vagas.length === 0 && <span className="text-[10px] font-bold text-slate-300 italic">Sem vaga vinculada</span>}
                  </div>

                  {/* Ações CPF */}
                  <div className="flex items-center justify-end gap-2">
                    {candidato.status_cpf !== "APROVADO" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingCPF === candidato.id}
                        onClick={() => handleUpdateCPF(candidato.id, "APROVADO")}
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 rounded-xl"
                      >
                        Aprovar
                      </Button>
                    )}
                    {candidato.status_cpf !== "REPROVADO" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingCPF === candidato.id}
                        onClick={() => handleUpdateCPF(candidato.id, "REPROVADO")}
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        Reprovar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddCandidatoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(novo) => setCandidatos(prev => [novo, ...prev])}
      />
    </div>
  )
}
