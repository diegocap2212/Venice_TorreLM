"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { updateVagaEtapa, updateBriefing } from "@/app/actions/vaga-actions";

interface VagaDrawerProps {
  vaga: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VagaDrawer({ vaga, isOpen, onClose }: VagaDrawerProps) {
  if (!vaga) return null;

  const [briefing, setBriefing] = useState(vaga.briefing_handoff || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const canAdvance = briefing.length >= 100;

  const handleAdvance = async () => {
    setIsUpdating(true);
    // Determine next stage
    const stages = [
      "REQUISICAO", "PREPARACAO", "TRIAGEM", "SHORTLIST", "ENTREVISTA_CLIENTE", 
      "APROVACAO_PROPOSTA", "CONTRATACAO", "ONB_ADMINISTRATIVO", "ONB_OPERACIONAL", 
      "SEMANA_1", "MES_1_ALEM"
    ];
    const currentIndex = stages.indexOf(vaga.etapa_atual);
    const nextStage = stages[currentIndex + 1];

    if (nextStage) {
      // First save briefing if changed
      if (briefing !== vaga.briefing_handoff) {
        await updateBriefing(vaga.id, briefing);
      }
      const res = await updateVagaEtapa(vaga.id, nextStage);
      if (res.success) onClose();
    }
    setIsUpdating(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
              {vaga.etapa_atual}
            </Badge>
            <Badge variant="outline">{vaga.urgencia}</Badge>
          </div>
          <SheetTitle className="text-xl font-bold text-slate-900">{vaga.titulo}</SheetTitle>
          <SheetDescription className="text-slate-500">
            Cadastrada em {new Date(vaga.data_abertura).toLocaleDateString('pt-BR')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Perfil</p>
              <p className="text-sm font-semibold text-slate-700">{vaga.perfil_tipo}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Senioridade</p>
              <p className="text-sm font-semibold text-slate-700">{vaga.senioridade}</p>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Squad Destino</p>
              <p className="text-sm font-semibold text-slate-700">{vaga.squad_destino}</p>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Responsável</p>
              <p className="text-sm font-semibold text-slate-700">{vaga.responsavel.name}</p>
            </div>
          </div>

          <Separator />

          {/* Checklist da Etapa */}
          <div>
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Checklist da Etapa
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-md transition-colors group">
                <Checkbox id="task-1" />
                <label htmlFor="task-1" className="text-sm text-slate-600 leading-none cursor-pointer">
                  Validar perfil técnico com o SDM responsável
                </label>
              </div>
              <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-md transition-colors">
                <Checkbox id="task-2" />
                <label htmlFor="task-2" className="text-sm text-slate-600 leading-none cursor-pointer">
                  Abrir vaga no Bizneo e sincronizar ID
                </label>
              </div>
            </div>
          </div>

          {/* Handoff Gate (Only show if in relevant stage or moving to it) */}
          <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
            <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              Briefing de Handoff
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Obrigatório para avançar para <strong>Onboarding Operacional</strong>. Mínimo 100 caracteres.
            </p>
            <Textarea 
              placeholder="Descreva o contexto do squad, rituais, principais desafios e expectativas de entrega..."
              className="min-h-[120px] bg-white border-primary/20 focus-visible:ring-primary"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
            />
            <div className="mt-2 flex justify-between items-center">
              <span className={`text-[10px] font-medium ${canAdvance ? 'text-green-600' : 'text-slate-400'}`}>
                {briefing.length} / 100 caracteres
              </span>
              {canAdvance && <Badge className="bg-green-500">Pode Avançar</Badge>}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90" 
              disabled={!canAdvance || isUpdating}
              onClick={handleAdvance}
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Avançar Etapa
            </Button>
            <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
              Congelar Vaga
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
