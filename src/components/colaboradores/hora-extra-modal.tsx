"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2, Save, Clock } from "lucide-react";
import { createHoraExtra } from "@/app/actions/colaborador-actions";
import { format } from "date-fns";

interface HoraExtraModalProps {
  colaborador: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HoraExtraModal({ colaborador, isOpen, onClose }: HoraExtraModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    mes_referencia: "",
    horas: "",
    observacao: ""
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        mes_referencia: format(new Date(), "yyyy-MM"),
        horas: "",
        observacao: ""
      });
    }
  }, [isOpen]);

  if (!colaborador) return null;

  const handleSave = async () => {
    if (!formData.mes_referencia || !formData.horas) {
        alert("Mês de referência e Horas são obrigatórios.");
        return;
    }
    
    setIsUpdating(true);

    try {
      await createHoraExtra({
        colaborador_id: colaborador.id,
        mes_referencia: formData.mes_referencia,
        horas: parseFloat(formData.horas),
        observacao: formData.observacao
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar hora extra:", error);
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
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  Lançar Hora Extra
                </SheetTitle>
                <SheetDescription className="text-slate-400 font-medium text-xs">
                  {colaborador.nome}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mês de Referência (YYYY-MM)</Label>
              <Input 
                type="month"
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                value={formData.mes_referencia}
                onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantidade de Horas</Label>
              <Input 
                type="number"
                step="0.5"
                placeholder="Ex: 2.5"
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20"
                value={formData.horas}
                onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observações Extras</Label>
              <Textarea 
                placeholder="Detalhes ou justificativa..."
                className="min-h-[100px] bg-slate-50/50 border-slate-200 rounded-xl focus:ring-emerald-500/20 text-sm p-4"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
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
              Salvar Lançamento
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
