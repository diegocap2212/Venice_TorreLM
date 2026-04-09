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
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total de Candidatos", value: totais.total, color: "text-slate-800", bg: "bg-white" },
          { label: "CPF Pendente", value: totais.pendentes, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "CPF Aprovado", value: totais.aprovados, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Reprovados", value: totais.reprovados, color: "text-rose-700", bg: "bg-rose-50" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl border border-slate-100 p-5 shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
            <p className={`text-4xl font-black ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de ações */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-xl gap-2 bg-primary hover:bg-primary/90 font-bold"
          id="btn-add-candidato"
        >
          <Plus className="w-4 h-4" />
          Novo Candidato
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <span>Candidato</span>
          <span>Status CPF</span>
          <span>Contato</span>
          <span>Vagas Vinculadas</span>
          <span>Ações</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <UserRound className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-sm">Nenhum candidato encontrado</p>
            <p className="text-xs mt-1">Clique em "Novo Candidato" para adicionar</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((candidato) => {
              const cpfConfig = CPF_STATUS_CONFIG[candidato.status_cpf as keyof typeof CPF_STATUS_CONFIG] || CPF_STATUS_CONFIG.PENDENTE
              const StatusIcon = cpfConfig.icon

              return (
                <div
                  key={candidato.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] items-center px-6 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Nome */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm shrink-0">
                      {candidato.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{candidato.nome}</p>
                      <p className="text-[10px] text-slate-400">{candidato.email || "—"}</p>
                    </div>
                  </div>

                  {/* Status CPF — sempre mascarado */}
                  <div className="flex flex-col gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cpfConfig.color} w-fit`}>
                      <StatusIcon className="w-3 h-3" />
                      {cpfConfig.label}
                    </span>
                    {candidato.cpf_masked && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Shield className="w-2.5 h-2.5" />
                        <span className="font-mono">{candidato.cpf_masked}</span>
                      </div>
                    )}
                  </div>

                  {/* Contato */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-slate-600">{candidato.telefone || "—"}</p>
                    {candidato.linkedin && (
                      <a
                        href={candidato.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                      >
                        LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {/* Vagas */}
                  <div className="flex flex-wrap gap-1.5">
                    {candidato.vagas.slice(0, 2).map((vc: any) => (
                      <span
                        key={vc.vaga.id}
                        className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200"
                      >
                        {vc.vaga.titulo.substring(0, 25)}{vc.vaga.titulo.length > 25 ? "…" : ""}
                      </span>
                    ))}
                    {candidato.vagas.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold">+{candidato.vagas.length - 2}</span>
                    )}
                    {candidato.vagas.length === 0 && <span className="text-[10px] text-slate-300">Sem vaga</span>}
                  </div>

                  {/* Ações CPF */}
                  <div className="flex items-center gap-2">
                    {candidato.status_cpf !== "APROVADO" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingCPF === candidato.id}
                        onClick={() => handleUpdateCPF(candidato.id, "APROVADO")}
                        className="h-7 px-2.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      >
                        Aprovar CPF
                      </Button>
                    )}
                    {candidato.status_cpf !== "REPROVADO" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updatingCPF === candidato.id}
                        onClick={() => handleUpdateCPF(candidato.id, "REPROVADO")}
                        className="h-7 px-2.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
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
