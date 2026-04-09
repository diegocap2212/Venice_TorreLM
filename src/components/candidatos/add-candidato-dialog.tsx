"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Shield, UserPlus } from "lucide-react"
import { createCandidato } from "@/app/actions/candidato-actions"

interface AddCandidatoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (candidato: any) => void
  vagaId?: string
}

export function AddCandidatoDialog({ open, onOpenChange, onSuccess, vagaId }: AddCandidatoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    linkedin: "",
    observacoes: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim()) { setError("Nome é obrigatório."); return }

    setIsSubmitting(true)
    setError(null)

    const res = await createCandidato({
      nome: form.nome,
      cpf: form.cpf || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      linkedin: form.linkedin || undefined,
      observacoes: form.observacoes || undefined,
      vaga_id: vagaId,
    })

    setIsSubmitting(false)

    if (res.error) {
      setError(res.error)
      return
    }

    onSuccess?.(res.candidato)
    onOpenChange(false)
    setForm({ nome: "", cpf: "", telefone: "", email: "", linkedin: "", observacoes: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-0 shadow-2xl" id="add-candidato-dialog">
        <div className="h-1.5 w-full bg-primary/20" />

        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                Adicionar Candidato
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-sm flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              CPF será armazenado de forma segura — conforme LGPD.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nome Completo *</Label>
              <Input
                id="candidato-nome"
                value={form.nome}
                onChange={e => handleChange("nome", e.target.value)}
                placeholder="Ex: João da Silva"
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">CPF</Label>
                <Input
                  id="candidato-cpf"
                  value={form.cpf}
                  onChange={e => handleChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="rounded-xl border-slate-200 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Telefone</Label>
                <Input
                  id="candidato-telefone"
                  value={form.telefone}
                  onChange={e => handleChange("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">E-mail</Label>
              <Input
                id="candidato-email"
                type="email"
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
                placeholder="candidato@email.com"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">LinkedIn</Label>
              <Input
                id="candidato-linkedin"
                value={form.linkedin}
                onChange={e => handleChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Observações</Label>
              <Textarea
                id="candidato-observacoes"
                value={form.observacoes}
                onChange={e => handleChange("observacoes", e.target.value)}
                placeholder="Notas do processo seletivo, pontos de atenção..."
                className="rounded-xl border-slate-200 min-h-[80px] resize-none"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] rounded-xl bg-primary hover:bg-primary/90 font-bold gap-2 shadow-md shadow-primary/20"
                id="btn-submit-candidato"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Cadastrar Candidato
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
