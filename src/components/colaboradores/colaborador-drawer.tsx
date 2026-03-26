"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2, Save, Trash2, User, Briefcase, Building2, Users, Mail, Calendar } from "lucide-react";
import { updateColaborador, deleteColaborador, createColaborador } from "@/app/actions/colaborador-actions";
import { format } from "date-fns";

interface ColaboradorDrawerProps {
  colaborador: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ColaboradorDrawer({ colaborador, isOpen, onClose }: ColaboradorDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        cargo: colaborador.cargo,
        status: colaborador.status,
        torre: colaborador.torre || "",
        squad: colaborador.squad || "",
        email: colaborador.email || "",
        informacoes_internas: colaborador.informacoes_internas || "",
        data_admissao: colaborador.data_admissao ? format(new Date(colaborador.data_admissao), "yyyy-MM-dd") : "",
        data_nascimento: colaborador.data_nascimento ? format(new Date(colaborador.data_nascimento), "yyyy-MM-dd") : "",
      });
    } else {
      setFormData({
        nome: "",
        cargo: "",
        status: "Ativo",
        torre: "",
        squad: "",
        email: "",
        informacoes_internas: "",
        data_admissao: format(new Date(), "yyyy-MM-dd"),
        data_nascimento: "",
      });
    }
  }, [colaborador, isOpen]);

  if (!formData) return null;

  const handleSave = async () => {
    if (!formData.nome || !formData.cargo) {
        alert("Nome e Cargo são obrigatórios.");
        return;
    }
    
    setIsUpdating(true);
    const dataToSave = {
      ...formData,
      data_admissao: new Date(formData.data_admissao),
      data_nascimento: formData.data_nascimento ? new Date(formData.data_nascimento) : new Date(),
    };

    try {
      if (colaborador?.id) {
        await updateColaborador(colaborador.id, dataToSave);
      } else {
        await createColaborador(dataToSave);
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargo</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  value={formData.cargo}
                  onChange={(e) => handleChange("cargo", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Torre</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  value={formData.torre}
                  onChange={(e) => handleChange("torre", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Squad</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  value={formData.squad}
                  onChange={(e) => handleChange("squad", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</Label>
              <select 
                className="w-full h-11 px-4 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20 text-sm font-medium outline-none"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Admissão</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => handleChange("data_admissao", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Nascimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <Input 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleChange("data_nascimento", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
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
              className="min-h-[160px] bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-emerald-500/20 text-sm font-medium p-4"
              value={formData.informacoes_internas}
              onChange={(e) => handleChange("informacoes_internas", e.target.value)}
            />
          </div>

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
