"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Clock, Send, Plus, Loader2 } from "lucide-react"
import { upsertHoraExtra, validarHoraExtra, marcarHoraExtraEnviada } from "@/app/actions/hora-extra-actions"

const STATUS_CONFIG = {
  PENDENTE: { label: "Pendente", color: "bg-amber-50 text-amber-700 border-amber-200" },
  VALIDADO: { label: "Validado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ENVIADO: { label: "Enviado", color: "bg-blue-50 text-blue-700 border-blue-200" },
}

interface HoraExtraTableProps {
  horasExtras: any[]
  colaboradores: any[]
  mesAtual: string
}

export function HoraExtraTable({ horasExtras, colaboradores, mesAtual }: HoraExtraTableProps) {
  const [horas, setHoras] = useState<any[]>(horasExtras)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [novaHoras, setNovaHoras] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [addingFor, setAddingFor] = useState<string | null>(null)

  // Colaboradores sem hora extra lançada neste mês
  const colaboradoresSemHora = colaboradores.filter(
    c => !horas.find(h => h.colaborador_id === c.id)
  )

  const handleUpsert = (colaborador_id: string, colaborador: any) => {
    const h = parseFloat(novaHoras[colaborador_id] || "0")
    if (isNaN(h) || h < 0) return

    startTransition(async () => {
      const res = await upsertHoraExtra(colaborador_id, mesAtual, h)
      if (res.success) {
        setHoras(prev => {
          const existing = prev.find(x => x.colaborador_id === colaborador_id)
          if (existing) return prev.map(x => x.colaborador_id === colaborador_id ? { ...x, horas: h } : x)
          return [...prev, { id: Date.now().toString(), colaborador_id, mes_referencia: mesAtual, horas: h, status: "PENDENTE", colaborador }]
        })
        setEditingId(null)
        setAddingFor(null)
        setNovaHoras(p => ({ ...p, [colaborador_id]: "" }))
      }
    })
  }

  const handleValidar = (id: string) => {
    startTransition(async () => {
      await validarHoraExtra(id)
      setHoras(prev => prev.map(h => h.id === id ? { ...h, status: "VALIDADO" } : h))
    })
  }

  const handleEnviar = (id: string) => {
    startTransition(async () => {
      await marcarHoraExtraEnviada(id)
      setHoras(prev => prev.map(h => h.id === id ? { ...h, status: "ENVIADO" } : h))
    })
  }

  const totalHoras = horas.reduce((a, h) => a + h.horas, 0)

  return (
    <div className="space-y-4">
      {/* Header com total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total do Mês</p>
            <p className="text-2xl font-black text-slate-800">{totalHoras}h</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colaboradores</p>
            <p className="text-2xl font-black text-slate-800">{horas.length}</p>
          </div>
        </div>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <span>Colaborador</span>
          <span>Horas ({mesAtual})</span>
          <span>Status</span>
          <span>Ações</span>
        </div>

        {horas.length === 0 && (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <Clock className="w-8 h-8 mb-2 opacity-30" />
            <p className="font-semibold text-sm">Nenhuma hora extra lançada este mês</p>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {horas.map(hora => {
            const statusConfig = STATUS_CONFIG[hora.status as keyof typeof STATUS_CONFIG]
            const isEditing = editingId === hora.id

            return (
              <div key={hora.id} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center px-6 py-4 hover:bg-slate-50/40">
                <div>
                  <p className="font-bold text-sm text-slate-800">{hora.colaborador.nome}</p>
                  <p className="text-[10px] text-slate-400">{hora.colaborador.cargo}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={novaHoras[hora.colaborador_id] ?? hora.horas}
                      onChange={e => setNovaHoras(p => ({ ...p, [hora.colaborador_id]: e.target.value }))}
                      className="w-20 h-8 rounded-lg border-slate-200 text-sm font-bold"
                      autoFocus
                    />
                  ) : (
                    <span className="text-lg font-black text-slate-800">{hora.horas}h</span>
                  )}
                </div>

                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border w-fit ${statusConfig?.color}`}>
                  {statusConfig?.label}
                </span>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Button size="sm" onClick={() => handleUpsert(hora.colaborador_id, hora.colaborador)}
                      className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary">
                      Salvar
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingId(hora.id)
                      setNovaHoras(p => ({ ...p, [hora.colaborador_id]: String(hora.horas) }))
                    }}
                      className="h-7 px-2.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                      Editar
                    </Button>
                  )}
                  {hora.status === "PENDENTE" && (
                    <Button variant="ghost" size="sm" onClick={() => handleValidar(hora.id)}
                      className="h-7 px-2.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Validar
                    </Button>
                  )}
                  {hora.status === "VALIDADO" && (
                    <Button variant="ghost" size="sm" onClick={() => handleEnviar(hora.id)}
                      className="h-7 px-2.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg gap-1">
                      <Send className="w-3 h-3" /> Enviar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Adicionar colaborador sem hora extra */}
        {colaboradoresSemHora.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            {addingFor ? (
              <div className="flex items-center gap-3">
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium flex-1"
                  value={addingFor}
                  onChange={e => setAddingFor(e.target.value)}
                >
                  {colaboradoresSemHora.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <Input
                  type="number"
                  placeholder="Horas"
                  onChange={e => setNovaHoras(p => ({ ...p, [addingFor]: e.target.value }))}
                  className="w-24 rounded-xl border-slate-200 text-sm font-bold"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpsert(addingFor, colaboradoresSemHora.find(c => c.id === addingFor)!)}
                  className="rounded-xl bg-primary font-bold text-xs"
                >
                  Lançar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAddingFor(null)}
                  className="rounded-xl text-slate-400">
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setAddingFor(colaboradoresSemHora[0].id)}
                className="text-primary hover:bg-primary/5 rounded-xl font-bold text-xs gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Lançar horas extras para colaborador
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
