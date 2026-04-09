"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, ExternalLink, Link2 } from "lucide-react";
import { updateVagaEtapa, updateBriefing, toggleChecklistItem, getChecklistStatus, updateBizneoLink } from "@/app/actions/vaga-actions";

const CHECKLISTS: Record<string, string[]> = {
  REQUISICAO: [
    "Solicitação de vaga via Bizneo",
    "Alinhamento de expectativas e detalhes",
    "Definição de teste técnico se necessário"
  ],
  PREPARACAO: [
    "Perguntas para triagem via chatbot",
    "Abertura da vaga no Bizneo",
    "Criação de score card"
  ],
  TRIAGEM: [
    "Entrevista Soft Skill e Hard Skill",
    "Entrevista técnica quando necessário",
    "Busca ativa (Hunting) se poucas candidaturas",
    "Verificação de referências",
    "Análise jurídica / consulta CPF"
  ],
  SHORTLIST: [
    "Envio da shortlist ao cliente (e-mail/Teams)",
    "Feedback aos candidatos (positivo ou negativo)",
    "Agendamento da entrevista com o cliente"
  ],
  ENTREVISTA_CLIENTE: [
    "Participação na entrevista com o cliente",
    "Comunicação dos resultados ao cliente"
  ],
  APROVACAO_PROPOSTA: [
    "Envio de proposta via Bizneo",
    "Assinatura da proposta"
  ],
  CONTRATACAO: [
    "Abertura de chamado e envio de notebook (Discord)",
    "Elaboração e envio de contrato (Bizneo)",
    "Termo de uso do notebook (Bizneo)",
    "Atualização de planilha de colaboradores",
    "Envio de informações ao financeiro (Trello)"
  ],
  ONB_ADMINISTRATIVO: [
    "Agendamento e realização do onboarding financeiro",
    "Inserir colaborador no Discord",
    "Passar acessos ao cliente para abertura de chamado",
    "Inserir colaborador no Teams da LM",
    "Apresentar o colaborador ao time"
  ],
  ONB_OPERACIONAL: [
    "Apresentar processos de trabalho e rituais do time",
    "Alinhar ferramentas, forma de comunicação e cadência",
    "Definição de expectativas de entrega no contexto do cliente"
  ],
  SEMANA_1: [
    "Verificar adaptação + formulário de satisfação do suporte"
  ],
  MES_1_ALEM: [
    "Verificar adaptação e evolução geral",
    "Check-ins periódicos de processo e método de trabalho",
    "Insumo operacional no ciclo de feedback"
  ]
};

const STAGES = [
  "REQUISICAO", "PREPARACAO", "TRIAGEM", "SHORTLIST", "ENTREVISTA_CLIENTE",
  "APROVACAO_PROPOSTA", "CONTRATACAO", "ONB_ADMINISTRATIVO", "ONB_OPERACIONAL",
  "SEMANA_1", "MES_1_ALEM"
];

interface VagaDrawerProps {
  vaga: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VagaDrawer({ vaga, isOpen, onClose }: VagaDrawerProps) {
  if (!vaga) return null;

  const [briefing, setBriefing] = useState(vaga.briefing_handoff || "");
  const [bizneoLink, setBizneoLink] = useState(vaga.bizneo_link || "");
  const [editingBizneo, setEditingBizneo] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  // Checklist persistido — carrega do db, depois aplica mudanças locais
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
  const [loadingChecklist, setLoadingChecklist] = useState(true);

  useEffect(() => {
    setLoadingChecklist(true);
    getChecklistStatus(vaga.id, vaga.etapa_atual).then(status => {
      setChecklistState(status);
      setLoadingChecklist(false);
    });
  }, [vaga.id, vaga.etapa_atual]);

  const handleChecklistToggle = async (index: number, checked: boolean) => {
    setChecklistState(prev => ({ ...prev, [index]: checked }));
    await toggleChecklistItem(vaga.id, vaga.etapa_atual, index, checked);
  };

  const canAdvance = briefing.length >= 100;
  const currentIndex = STAGES.indexOf(vaga.etapa_atual);
  const nextStage = STAGES[currentIndex + 1];
  const isLastStage = currentIndex === STAGES.length - 1;

  const handleAdvance = async () => {
    if (!nextStage) return;
    setIsUpdating(true);

    if (briefing !== vaga.briefing_handoff) {
      await updateBriefing(vaga.id, briefing);
    }

    const res = await updateVagaEtapa(vaga.id, nextStage);
    if (res.success) {
      if (vaga.etapa_atual === "APROVACAO_PROPOSTA") {
        setTransitionTarget("onboarding");
      } else if (isLastStage) {
        onClose();
      } else {
        onClose();
      }
    }
    setIsUpdating(false);
  };

  const handleSaveBizneo = async () => {
    await updateBizneoLink(vaga.id, bizneoLink);
    setEditingBizneo(false);
  };

  const handleBoardSwitch = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", transitionTarget || "recrutamento");
    window.location.search = params.toString();
  };

  const checklistItems = CHECKLISTS[vaga.etapa_atual] || [];
  const completedCount = checklistItems.filter((_, i) => checklistState[i]).length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-0 border-l border-slate-200 shadow-2xl bg-white">
        <div className="h-2 w-full bg-primary/20" />

        <div className="p-8 space-y-8">
          <SheetHeader className="text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">
                  {vaga.etapa_atual}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight border-slate-200 text-slate-400">
                Urgência: {vaga.urgencia}
              </Badge>
            </div>

            <div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {vaga.titulo}
              </SheetTitle>
              <SheetDescription className="text-slate-400 font-medium text-xs mt-1">
                Ref: {vaga.id.substring(0, 8)} · Aberta em {new Date(vaga.data_abertura).toLocaleDateString("pt-BR")}
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Feedback de Transição entre Boards */}
          {transitionTarget && (
            <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-2xl shadow-blue-500/30 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Vaga Movida com Sucesso!</h3>
                  <p className="text-blue-100 text-sm font-medium mt-1">
                    Este item agora faz parte do pipeline de <strong>{transitionTarget === "onboarding" ? "Onboarding" : "Recrutamento"}</strong>.
                  </p>
                </div>
                <div className="flex flex-col w-full gap-3 pt-4">
                  <Button onClick={handleBoardSwitch} className="w-full h-12 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                    Ver no Quadro de {transitionTarget === "onboarding" ? "Onboarding" : "Recrutamento"}
                  </Button>
                  <Button variant="ghost" onClick={onClose} className="w-full text-white/70 hover:text-white hover:bg-white/10 font-bold">
                    Permanecer aqui
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cards de Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Perfil", value: vaga.perfil_tipo },
              { label: "Senioridade", value: vaga.senioridade },
              { label: "Squad", value: vaga.squad_destino },
              { label: "Responsável", value: vaga.responsavel?.name },
            ].map((info) => (
              <div key={info.label} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:border-slate-200">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">{info.label}</p>
                <p className="text-sm font-bold text-slate-700 tracking-tight">{info.value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Link Bizneo */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Link2 className="w-3 h-3" /> Link Bizneo
              </p>
              {!editingBizneo && (
                <button onClick={() => setEditingBizneo(true)} className="text-[10px] font-bold text-primary hover:underline">
                  {bizneoLink ? "Editar" : "Adicionar"}
                </button>
              )}
            </div>
            {editingBizneo ? (
              <div className="flex gap-2">
                <Input
                  value={bizneoLink}
                  onChange={e => setBizneoLink(e.target.value)}
                  placeholder="https://app.bizneo.com/..."
                  className="rounded-xl border-slate-200 text-sm h-9"
                />
                <Button size="sm" onClick={handleSaveBizneo} className="rounded-xl bg-primary font-bold text-xs h-9">Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingBizneo(false)} className="rounded-xl text-slate-400 h-9">Cancelar</Button>
              </div>
            ) : bizneoLink ? (
              <a href={bizneoLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir no Bizneo
              </a>
            ) : (
              <p className="text-xs text-slate-400">Nenhum link cadastrado</p>
            )}
          </div>

          <Separator className="bg-slate-100" />

          {/* Checklist Persistido */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Checklist Obrigatório
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                {loadingChecklist ? "…" : `${completedCount} / ${checklistItems.length}`}
              </span>
            </div>

            {/* Barra de progresso */}
            {checklistItems.length > 0 && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
                />
              </div>
            )}

            <div className="grid gap-2.5">
              {checklistItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all group cursor-pointer"
                  onClick={() => handleChecklistToggle(index, !checklistState[index])}
                >
                  <Checkbox
                    id={`task-${vaga.id}-${index}`}
                    checked={!!checklistState[index]}
                    onCheckedChange={(checked) => handleChecklistToggle(index, !!checked)}
                    className="mt-1 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    onClick={e => e.stopPropagation()}
                  />
                  <label
                    htmlFor={`task-${vaga.id}-${index}`}
                    className={`text-[13px] font-semibold leading-tight cursor-pointer transition-colors ${
                      checklistState[index] ? "text-slate-400 line-through" : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Handoff Gate */}
          <section className="p-6 bg-primary/[0.02] rounded-3xl border-2 border-dashed border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm tracking-tight">Briefing de Handoff</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Portão de Qualidade — mín. 100 caracteres</p>
              </div>
            </div>

            <Textarea
              placeholder="Descreva o contexto do squad, rituais, principais desafios e expectativas de entrega..."
              className="min-h-[140px] bg-white border-slate-200 rounded-2xl focus-visible:ring-primary/20 text-sm font-medium"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
            />

            <div className="mt-4 flex justify-between items-center px-1">
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${canAdvance ? "text-green-500" : "text-slate-300"}`}>
                  Progresso: {briefing.length} / 100
                </span>
                <div className="w-32 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${canAdvance ? "bg-green-500" : "bg-primary"}`}
                    style={{ width: `${Math.min((briefing.length / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {canAdvance && (
                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Validado</span>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pb-8">
            <Button
              className="flex-[2] h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm tracking-tight shadow-lg shadow-primary/20 disabled:opacity-30"
              disabled={!canAdvance || isUpdating || isLastStage}
              onClick={handleAdvance}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : isLastStage ? "Etapa Final" : "Avançar Próxima Etapa"}
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600">
              Congelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
