"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SensitiveField } from "@/components/ui/sensitive-field";
import { useState, useEffect } from "react";
import {
  Loader2, Save, Trash2, User, Briefcase, Building2, Users,
  Mail, Calendar, Phone, Link2, FileText, DollarSign, Hash, AlertCircle
} from "lucide-react";
import { updateColaborador, deleteColaborador, createColaborador } from "@/app/actions/colaborador-actions";
import { format } from "date-fns";
import { parseUTCDate } from "@/lib/utils";

interface ColaboradorDrawerProps {
  colaborador: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm = () => ({
  nome: "", cargo: "", status: "Ativo", torre: "", squad: "", email: "",
  cpf: "", telefone: "", linkedin: "",
  tipo_contrato: "", regime: "", salario: "", centro_custo: "",
  data_admissao: format(new Date(), "yyyy-MM-dd"),
  data_nascimento: "", data_desligamento: "", motivo_desligamento: "",
  informacoes_internas: "",
});

export function ColaboradorDrawer({ colaborador, isOpen, onClose }: ColaboradorDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [cpfError, setCpfError] = useState("");
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome ?? "",
        cargo: colaborador.cargo ?? "",
        status: colaborador.status ?? "Ativo",
        torre: colaborador.torre ?? "",
        squad: colaborador.squad ?? "",
        email: colaborador.email ?? "",
        cpf: colaborador.cpf_masked ?? "",
        telefone: colaborador.telefone ?? "",
        linkedin: colaborador.linkedin ?? "",
        tipo_contrato: colaborador.tipo_contrato ?? "",
        regime: colaborador.regime ?? "",
        salario: colaborador.salario != null ? String(colaborador.salario) : "",
        centro_custo: colaborador.centro_custo ?? "",
        data_admissao: colaborador.data_admissao ? format(parseUTCDate(colaborador.data_admissao), "yyyy-MM-dd") : "",
        data_nascimento: colaborador.data_nascimento ? format(parseUTCDate(colaborador.data_nascimento), "yyyy-MM-dd") : "",
        data_desligamento: colaborador.data_desligamento ? format(parseUTCDate(colaborador.data_desligamento), "yyyy-MM-dd") : "",
        motivo_desligamento: colaborador.motivo_desligamento ?? "",
        informacoes_internas: colaborador.informacoes_internas ?? "",
      });
    } else {
      setFormData(emptyForm());
    }
    setCpfError("");
  }, [colaborador, isOpen]);

  if (!formData) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (field === "cpf") setCpfError("");
  };

  const isDesligado = formData.status === "Desligado";

  const handleSave = async () => {
    if (!formData.nome || !formData.cargo) {
      alert("Nome e Cargo são obrigatórios.");
      return;
    }
    setIsUpdating(true);
    const dataToSave: any = {
      ...formData,
      data_admissao: new Date(formData.data_admissao),
      data_nascimento: formData.data_nascimento ? new Date(formData.data_nascimento) : new Date(),
      data_desligamento: formData.data_desligamento ? new Date(formData.data_desligamento) : null,
      salario: formData.salario !== "" ? parseFloat(formData.salario) : null,
    };

    try {
      const result = colaborador?.id
        ? await updateColaborador(colaborador.id, dataToSave)
        : await createColaborador(dataToSave);

      if (result && "error" in result) {
        if (result.error?.includes("CPF")) setCpfError(result.error);
        else alert(result.error);
        return;
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error);
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja remover este colaborador?")) {
      setIsUpdating(true);
      await deleteColaborador(colaborador.id);
      setIsUpdating(false);
      onClose();
    }
  };

  const fieldClass = "pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-0 border-l border-slate-200 shadow-2xl bg-white">
        <div className="h-2 w-full bg-emerald-500/20" />

        <div className="p-8 space-y-8">
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {formData.nome || "Novo Colaborador"}
                </SheetTitle>
                <SheetDescription className="text-slate-400 font-medium text-xs">
                  {colaborador?.id ? `ID: ${colaborador.id.substring(0, 8)} • Editando informações` : "Preencha os dados do novo integrante da Torre"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* ── Dados Pessoais ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b border-slate-100 pb-2">Dados Pessoais</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className={labelClass}>Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} value={formData.nome} onChange={e => handleChange("nome", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Cargo</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} value={formData.cargo} onChange={e => handleChange("cargo", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>CPF</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input
                    className={`${fieldClass} font-mono ${cpfError ? "border-red-300 focus:ring-red-500/20" : ""}`}
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={e => handleChange("cpf", e.target.value)}
                  />
                </div>
                {cpfError && (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{cpfError}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} placeholder="(11) 99999-9999" value={formData.telefone} onChange={e => handleChange("telefone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>LinkedIn</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} placeholder="linkedin.com/in/..." value={formData.linkedin} onChange={e => handleChange("linkedin", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Data Nascimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} type="date" value={formData.data_nascimento} onChange={e => handleChange("data_nascimento", e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Alocação ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b border-slate-100 pb-2">Alocação</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className={labelClass}>Torre</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} value={formData.torre} onChange={e => handleChange("torre", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Squad</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} value={formData.squad} onChange={e => handleChange("squad", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Centro de Custo</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} value={formData.centro_custo} onChange={e => handleChange("centro_custo", e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Contrato ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b border-slate-100 pb-2">Contrato</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className={labelClass}>Tipo de Contrato</Label>
                <select
                  className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.tipo_contrato}
                  onChange={e => handleChange("tipo_contrato", e.target.value)}
                >
                  <option value="">— Selecione —</option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Estágio">Estágio</option>
                  <option value="Temporário">Temporário</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Regime</Label>
                <select
                  className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.regime}
                  onChange={e => handleChange("regime", e.target.value)}
                >
                  <option value="">— Selecione —</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Flex">Flex</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Salário (sensível)</Label>
                <SensitiveField
                  prefix="R$"
                  value={formData.salario}
                  onChange={v => handleChange("salario", v)}
                  placeholder="0,00"
                  className="h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Status</Label>
                <select
                  className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.status}
                  onChange={e => handleChange("status", e.target.value)}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Férias">Férias</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Desligado">Desligado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Data Admissão</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                  <Input className={fieldClass} type="date" value={formData.data_admissao} onChange={e => handleChange("data_admissao", e.target.value)} />
                </div>
              </div>
              {isDesligado && (
                <div className="space-y-2">
                  <Label className={labelClass}>Data Desligamento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-rose-300" />
                    <Input
                      className="pl-10 h-11 bg-rose-50/30 border-rose-200 rounded-xl focus:ring-rose-500/20"
                      type="date"
                      value={formData.data_desligamento}
                      onChange={e => handleChange("data_desligamento", e.target.value)}
                    />
                  </div>
                </div>
              )}
              {isDesligado && (
                <div className="col-span-2 space-y-2">
                  <Label className={labelClass}>Motivo do Desligamento</Label>
                  <Input
                    className="h-11 bg-rose-50/30 border-rose-200 rounded-xl focus:ring-rose-500/20"
                    placeholder="Ex: Pedido de demissão, fim de contrato..."
                    value={formData.motivo_desligamento}
                    onChange={e => handleChange("motivo_desligamento", e.target.value)}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── Informações Internas ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Save className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-900">Informações Internas</Label>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Notas e observações privadas</p>
              </div>
            </div>
            <Textarea
              placeholder="Adicione observações internas sobre o colaborador, histórico, pontos de atenção, etc..."
              className="min-h-[120px] bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-emerald-500/20 text-sm font-medium p-4"
              value={formData.informacoes_internas}
              onChange={e => handleChange("informacoes_internas", e.target.value)}
            />
          </section>

          <div className="flex items-center gap-4 pt-4 pb-8">
            <Button
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-tight shadow-xl shadow-emerald-500/20 gap-2"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {colaborador?.id ? "Salvar Alterações" : "Criar Colaborador"}
            </Button>
            {colaborador?.id && (
              <Button
                variant="outline"
                className="h-12 w-12 rounded-2xl border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-bold p-0"
                onClick={handleDelete}
                disabled={isUpdating}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
