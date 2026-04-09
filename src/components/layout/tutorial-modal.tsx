"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, LayoutDashboard, Users, UserPlus, Clock, Target, PlayCircle, Briefcase, ClipboardCheck, TrendingUp, ShieldCheck } from "lucide-react";

export function TutorialModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Visão Geral & Radar de Gestão",
      description: "O painel principal onde você monitora a saúde corporativa em tempo real.",
      icon: LayoutDashboard,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Acompanhe o número total de colaboradores ativos, quem está de férias e as métricas de distribuição por área em painéis dinâmicos.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Métricas Principais</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">População Ativa</span>
                <span className="text-2xl font-black text-slate-800">56</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Horas Extras</span>
                <span className="text-2xl font-black text-rose-600">12h</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Recrutamento & Aprovação Fiscal",
      description: "Controle de Talentos, CPFs mascarados para LGPD e Vínculo de Vagas.",
      icon: UserPlus,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Gerencie novos talentos. A nova lei exige que os CPFs sejam auditados e aprovados pelo compliance de forma segura, os mantendo mascarados.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-800">Candidato Em Processo</span>
                     <span className="text-[9px] text-slate-400 font-mono">CPF: ***.***.318-70</span>
                   </div>
                   <span className="text-[9px] border border-amber-200 bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold uppercase">Pendente</span>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <span className="text-[9px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-1 rounded">APROVAR</span>
                  <span className="text-[9px] font-bold text-rose-600 border border-rose-100 bg-rose-50 px-2 py-1 rounded">REPROVAR</span>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Pipeline de Atração & Kanban",
      description: "Arraste os candidatos pelas esteiras visuais de Recrutamento.",
      icon: Briefcase,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Acompanhe o funil de contratação na aba **Pipeline**. Os candidatos passam de Triagem para Entrevista, e depois Proposta.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-2 h-32 overflow-hidden">
             {/* Col 1 */}
             <div className="flex-1 bg-slate-100 rounded-lg p-2 border border-slate-200 flex flex-col gap-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Triagem (2)</span>
                <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
                  <div className="h-2 w-1/2 bg-blue-100 rounded mb-1"></div>
                  <div className="h-1.5 w-1/4 bg-slate-100 rounded"></div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
                  <div className="h-2 w-3/4 bg-slate-200 rounded mb-1"></div>
                </div>
             </div>
             {/* Col 2 */}
             <div className="flex-1 bg-slate-100 rounded-lg p-2 border border-slate-200 flex flex-col gap-2 opacity-60">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Entrevista (1)</span>
                <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
                  <div className="h-2 w-1/2 bg-purple-100 rounded mb-1"></div>
                  <div className="h-1.5 w-1/3 bg-slate-100 rounded"></div>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Checklist Pós-Admissão",
      description: "Rotinas automáticas de Enxoval e Acessos ao aprovar uma vaga.",
      icon: ClipboardCheck,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Assim que um candidato move para **Onboarding**, um Checklist inteligente é criado paraTI, Facilities e RH.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-emerald-500 text-white flex justify-center items-center text-[10px]">✓</div>
                  <span className="text-xs font-bold text-slate-700 line-through opacity-50">Email Corporativo Criado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                  <span className="text-xs font-bold text-slate-700">Liberação de Acesso VPN</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                  <span className="text-xs font-bold text-slate-700">Envio do Notebook</span>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Gestão Operacional (Times)",
      description: "Apontamento de horas extras, ocorrências e agendamento de conversas.",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Na aba **Colaboradores**, a gestão de campo acontece: audite times por Squad/Torre e registre eventos importantes para cada recurso.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
            <div className="flex flex-col gap-2 relative z-10">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 font-black text-xs flex justify-center items-center text-slate-600">JS</div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-800">João Silva</span>
                     <span className="text-[9px] text-slate-400 font-medium">Desenvolvedor Back-End</span>
                   </div>
                 </div>
                 <div className="flex gap-1">
                   <span className="text-[8px] bg-rose-50 text-rose-600 px-2 py-1 rounded font-bold uppercase">Hora Extra</span>
                   <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">Follow-up</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Radar de Performance",
      description: "Mapas de Feedback, Avaliações 360 e PDIs integrados.",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Dentro de **Performance**, administre históricos de ciclos de avaliação. Verifique facilmente os high-performers e retenção de talentos.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-black uppercase text-slate-800">H1 2026 - Avaliação de Líder</span>
                   <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded uppercase">Excede Expectativas</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[90%]"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">"Entrega consistente de projetos complexos no prazo..."</p>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Cone Locavia & Hub Documental",
      description: "Integração Externa Jira e Base de Conhecimento Interna.",
      icon: ShieldCheck,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Em **Cone Locavia** veja os indicadores diários de entregas (Throughput/Burndown). Em **Repositório**, acesse as políticas (Ways of Working).
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
             <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary">
                <Target className="w-6 h-6 text-blue-500" />
                <span className="text-[9px] font-bold text-slate-600 uppercase text-center">Dashboard<br/>Locavia</span>
             </div>
             <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary">
                <ShieldCheck className="w-6 h-6 text-indigo-500" />
                <span className="text-[9px] font-bold text-slate-600 uppercase text-center">Repositório<br/>Legal</span>
             </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onOpenChange(false);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 rounded-[32px] overflow-hidden border-border/40 shadow-2xl">
        <div className="flex flex-col md:flex-row h-full min-h-[450px]">
          {/* Sidebar Gradient */}
          <div className="w-full md:w-[240px] bg-foreground text-primary py-8 px-6 flex flex-col justify-between shrink-0 relative overflow-hidden">
             <div className="absolute top-0 right-[-50%] w-[250px] h-[250px] bg-primary/10 blur-[100px] rounded-full" />
             <div className="absolute bottom-[-20%] left-[-20%] w-[200px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full" />
             
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-8 border-b border-primary/20 pb-4">
                 <PlayCircle className="w-5 h-5 text-primary" />
                 <span className="font-black text-sm uppercase tracking-widest text-white">Guia da Plataforma</span>
               </div>
               
               <div className="space-y-4">
                 {steps.map((s, i) => {
                   const StepIcon = s.icon;
                   return (
                     <div 
                       key={i} 
                       className={`flex items-center gap-3 transition-all duration-300 cursor-pointer ${i === step ? 'opacity-100 translate-x-1' : 'opacity-40 hover:opacity-70'}`}
                       onClick={() => setStep(i)}
                     >
                       <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${i === step ? 'bg-primary text-foreground' : 'bg-white/5 text-primary'}`}>
                         <StepIcon className="w-3.5 h-3.5" />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-white truncate pr-2">
                         {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                       </span>
                     </div>
                   );
                 })}
               </div>
             </div>
             
             <div className="mt-8 md:mt-0 relative z-10 pt-6 border-t border-primary/20">
               <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                 <div 
                   className="bg-primary h-full transition-all duration-500" 
                   style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                 />
               </div>
               <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold text-center">
                 Passo {step + 1} de {steps.length}
               </p>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 bg-white flex flex-col justify-between">
             <div>
               <DialogHeader className="mb-6 border-b border-slate-100 pb-4">
                 <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                   {steps[step].title}
                 </DialogTitle>
                 <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                   {steps[step].description}
                 </DialogDescription>
               </DialogHeader>
               
               <div className="mb-8 animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both" key={step}>
                 {steps[step].content}
               </div>
             </div>

             <div className="flex items-center justify-between mt-auto pt-4">
               <Button 
                variant="ghost" 
                onClick={handlePrev} 
                disabled={step === 0}
                className={`text-slate-400 hover:text-slate-600 font-bold transition-all ${step === 0 ? 'opacity-0' : 'opacity-100'}`}
               >
                 <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
               </Button>
               
               <Button 
                 onClick={handleNext} 
                 className="bg-primary hover:bg-primary/90 text-foreground font-black uppercase tracking-wider rounded-xl px-6 shadow-md shadow-primary/20 hover:scale-105 transition-transform"
               >
                 {step === steps.length - 1 ? 'Explorar Sistema' : (
                   <>Próximo <ChevronRight className="w-4 h-4 ml-1" /></>
                 )}
               </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
