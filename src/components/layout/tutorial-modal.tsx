"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, LayoutDashboard, Users, UserPlus, Clock, Target, PlayCircle } from "lucide-react";

export function TutorialModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Visão Geral & Radar de Gestão",
      description: "O painel principal onde você monitora a saúde da sua operação em tempo real.",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Acompanhe o número total de colaboradores ativos, quem está de férias e as métricas de distribuição por área.
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
      title: "Gestão de Colaboradores",
      description: "Controle todo o seu time, adicione horas extras e marque acompanhamentos.",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Na aba Colaboradores, você tem acesso rápido a todo o histórico de cada membro do time e pode agendar Follow-ups.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
            <div className="flex flex-col gap-2 relative z-10">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 font-black text-xs flex justify-center items-center">B</div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-800">Bruna Steffen</span>
                     <span className="text-[9px] text-slate-400 font-medium">Contábil/Fiscal</span>
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
      title: "Recrutamento & Talentos",
      description: "Auditoria de CPFs, Banco de Talentos e Vínculo de Vagas.",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Gerencie o pipeeline de contratações. Todos os CPFs ficam ocultos (proteção LGPD) e devem ser aprovados antes da admissão.
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
                  <span className="text-[9px] font-bold text-emerald-600">APROVAR CPF</span>
                  <span className="text-[9px] font-bold text-rose-600">REPROVAR</span>
                </div>
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
      <DialogContent className="sm:max-w-[600px] p-0 rounded-[32px] overflow-hidden border-border/40 shadow-2xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Sidebar Gradient */}
          <div className="w-full md:w-[200px] bg-foreground text-primary p-6 flex flex-col justify-between shrink-0 relative overflow-hidden">
             <div className="absolute top-0 right-[-50%] w-[200px] h-[200px] bg-primary/20 blur-[100px] rounded-full" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-8">
                 <PlayCircle className="w-5 h-5 text-primary" />
                 <span className="font-black text-sm uppercase tracking-widest text-white">Tutorial</span>
               </div>
               <div className="space-y-4">
                 {steps.map((_, i) => (
                   <div key={i} className={`flex items-center gap-3 transition-opacity ${i === step ? 'opacity-100' : 'opacity-40'}`}>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === step ? 'bg-primary text-foreground' : 'border border-primary/50 text-primary'}`}>
                       {i + 1}
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                       {i === 0 ? 'Radar' : i === 1 ? 'Gestão' : 'Talentos'}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="mt-8 md:mt-0 relative z-10">
               <p className="text-[9px] text-white/40 uppercase tracking-widest font-black mb-1">Status</p>
               <p className="text-xs text-primary font-bold">
                 {step + 1} de {steps.length} concluído
               </p>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 bg-white flex flex-col justify-between min-h-[400px]">
             <div>
               <DialogHeader className="mb-6">
                 <DialogTitle className="text-xl font-black text-slate-800">
                   {steps[step].title}
                 </DialogTitle>
                 <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                   {steps[step].description}
                 </DialogDescription>
               </DialogHeader>
               
               <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" key={step}>
                 {steps[step].content}
               </div>
             </div>

             <div className="flex items-center justify-between mt-4">
               <Button 
                variant="ghost" 
                onClick={handlePrev} 
                className={`text-slate-400 hover:text-slate-600 font-bold ${step === 0 ? 'invisible' : ''}`}
               >
                 <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
               </Button>
               
               <Button 
                 onClick={handleNext} 
                 className="bg-primary hover:bg-primary/90 text-foreground font-black uppercase tracking-wider rounded-xl px-6"
               >
                 {step === steps.length - 1 ? 'Concluir' : (
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
