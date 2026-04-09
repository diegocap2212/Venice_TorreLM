"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2, Save, MessageSquare } from "lucide-react";
import { createFollowup } from "@/app/actions/colaborador-actions";
import { format } from "date-fns";

interface FollowupModalProps {
  colaborador: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FollowupModal({ colaborador, isOpen, onClose }: FollowupModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "SEMANA_1",
    data_prevista: "",
    notas: ""
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo: "SEMANA_1",
        data_prevista: format(new Date(), "yyyy-MM-dd"),
        notas: ""
      });
    }
  }, [isOpen]);

  if (!colaborador) return null;

  const handleSave = async () => {
    if (!formData.tipo || !formData.data_prevista) {
        alert("Tipo e Previsão são obrigatórios.");
        return;
    }
    
    setIsUpdating(true);

    try {
      await createFollowup({
        colaborador_id: colaborador.id,
        tipo: formData.tipo,
        data_prevista: new Date(formData.data_prevista),
        notas: formData.notas
      });
      onClose();
    } catch (error) {
      console.error("Erro ao agendar followup:", error);
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto p-0 border-l border-slate-200 shadow-2xl bg-white">
        <div className="h-2 w-full bg-emerald-500/20" />
        
        <div className="p-8 space-y-8">
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  Agendar Follow-up
                </SheetTitle>
                <SheetDescription className="text-slate-400 font-medium text-xs">
                  {colaborador.nome}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Follow-up</Label>
              <select 
                className="w-full h-11 px-4 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20 text-sm font-medium outline-none"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="SEMANA_1">Semana 1</option>
                <option value="MES_1">Mês 1</option>
                <option value="FEEDBACK_45">Feedback 45 dias</option>
                <option value="FEEDBACK_90">Feedback 90 dias</option>
                <option value="OUTRO">Outro (Ad hoc)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Prevista</Label>
              <Input 
                type="date"
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                value={formData.data_prevista}
                onChange={(e) => setFormData({ ...formData, data_prevista: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pauta ou Notas Iniciais</Label>
              <Textarea 
                placeholder="Detalhes ou do que se trata..."
                className="min-h-[100px] bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20 text-sm p-4"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 pb-8">
            <Button 
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-tight shadow-xl shadow-emerald-500/20 gap-2"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Agendamento
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
