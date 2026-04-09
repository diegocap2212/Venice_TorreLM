"use client";

import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronRight,
  Briefcase, UserRound, Users, ClipboardCheck, TrendingUp,
  ArrowRight, Check, Play
} from "lucide-react";

// ─── JORNADA COMPLETA: PONTA A PONTA ─────────────────────────────────────────

const JORNADA = [
  {
    step: 1,
    fase: "Abertura de Vaga",
    modulo: "Pipeline",
    icon: Briefcase,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    href: "/pipeline",
    o_que: "A BP recebe a requisição de vaga do gestor de contas ou cliente.",
    como: [
      "Acesse Pipeline → clique em Nova Vaga",
      "Preencha: título, perfil, senioridade, squad destino e urgência",
      "A vaga entra automaticamente na etapa REQUISIÇÃO do quadro Recrutamento",
    ],
    conecta: "Os candidatos serão vinculados à vaga ao longo do processo.",
    emoji: "📋",
  },
  {
    step: 2,
    fase: "Recrutamento e Candidatos",
    modulo: "Pipeline + Candidatos",
    icon: UserRound,
    color: "bg-violet-500",
    lightColor: "bg-violet-50 border-violet-200 text-violet-800",
    href: "/candidatos",
    o_que: "A BP conduz triagens, entrevistas e valida o CPF de cada candidato.",
    como: [
      "No drawer da vaga, cole o link do Bizneo para rastrear a vaga externa",
      "Acesse Candidatos → cadastre cada candidato com nome, CPF (protegido LGPD) e contato",
      "Marque o status do CPF: Pendente → Aprovado ou Reprovado",
      "Avance a vaga pelas etapas: PREPARAÇÃO → TRIAGEM → SHORTLIST → ENTREVISTA_CLIENTE",
      "Cada etapa tem um checklist que fica salvo — marque enquanto executa",
      "O Briefing de Handoff (mín. 100 char) é obrigatório para avançar",
    ],
    conecta: "Ao chegar em APROVACAO_PROPOSTA, o candidato vira colaborador.",
    emoji: "🔍",
  },
  {
    step: 3,
    fase: "Contratação",
    modulo: "Pipeline → Colaboradores",
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 border-blue-200 text-blue-800",
    href: "/colaboradores",
    o_que: "Proposta aceita — o candidato se torna colaborador da Torre LM.",
    como: [
      "Avance a vaga até CONTRATAÇÃO, complete o checklist de documentação",
      "O colaborador é criado em Colaboradores com data de admissão",
      "Preencha CPF (protegido LGPD), telefone e LinkedIn",
      "A vaga se move automaticamente para o board de Onboarding",
    ],
    conecta: "Admitido → os follow-ups de onboarding são criados automaticamente.",
    emoji: "✍️",
  },
  {
    step: 4,
    fase: "Onboarding e Pós-Admissão",
    modulo: "Pós-Admissão",
    icon: ClipboardCheck,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 border-orange-200 text-orange-800",
    href: "/pos-admissao",
    o_que: "A BP acompanha o colaborador nas primeiras semanas com uma cadência estruturada.",
    como: [
      "O sistema cria automaticamente os follow-ups: 1ª Semana · 1 Mês · 45 Dias · 90 Dias",
      "Acesse Pós-Admissão → aba Follow-ups para ver os pendentes e atrasados",
      "Ao realizar o contato, clique em Marcar como Realizado e registre notas",
      "Use o Template de Mensagem para copiar o texto de onboarding já personalizado",
      "Horas Extras: lance no último dia do mês → Validar → Enviar ao Financeiro",
    ],
    conecta: "Após os 90 dias, o colaborador entra no ciclo de performance.",
    emoji: "🤝",
  },
  {
    step: 5,
    fase: "Ciclo de Performance",
    modulo: "Performance",
    icon: TrendingUp,
    color: "bg-pink-500",
    lightColor: "bg-pink-50 border-pink-200 text-pink-800",
    href: "/performance",
    o_que: "A cada semestre (S1: Mar–Mai | S2: Out–Dez), a BP conduz o ciclo de avaliação.",
    como: [
      "Acesse Performance → aba Por Colaborador",
      "Clique em Iniciar Ciclo para gerar: Autoavaliação + Feedback Gestor + PDI",
      "Acompanhe o calendário: BP age na 1ª semana e no início do ciclo; Gestor de Contas nos 45d e 90d",
      "Avance cada item: Iniciar → Concluir",
      "Colaboradores com PIP recebem um plano de melhoria em paralelo",
    ],
    conecta: "Ciclo concluído → o colaborador retorna à fase de onboarding contínuo até o próximo semestre.",
    emoji: "📈",
  },
];

export function TutorialPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const progressoSteps = JORNADA.length;

  return (
    <div className="rounded-[32px] border border-dashed border-primary/30 bg-primary/[0.02] overflow-hidden transition-all duration-500">
      {/* Header clicável */}
      <button
        id="btn-toggle-tutorial"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Jornada Completa do BP Hub
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Como o sistema se conecta de ponta a ponta — do pedido de vaga ao ciclo de performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1">
            {JORNADA.map((j, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full text-[9px] font-black text-white flex items-center justify-center ${j.color}`}>
                  {j.step}
                </div>
                {i < JORNADA.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
              </div>
            ))}
          </div>
          <div className={`p-2 rounded-xl bg-white border border-slate-100 shadow-sm transition-all duration-300 ${isOpen ? "bg-primary/5 border-primary/20" : ""}`}>
            {isOpen
              ? <ChevronDown className="w-4 h-4 text-primary" />
              : <ChevronRight className="w-4 h-4 text-slate-400" />
            }
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {isOpen && (
        <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">

          {/* Linha do tempo visual */}
          <div className="relative flex items-start gap-0 mb-6 overflow-x-auto pb-2">
            {JORNADA.map((j, i) => {
              const Icon = j.icon;
              const isActive = activeStep === j.step;
              return (
                <div key={j.step} className="flex items-center shrink-0">
                  <button
                    id={`tutorial-step-${j.step}`}
                    onClick={() => setActiveStep(isActive ? null : j.step)}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200 min-w-[120px] ${
                      isActive
                        ? `${j.lightColor} border-current shadow-sm`
                        : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${j.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isActive ? "opacity-60" : "text-slate-400"}`}>
                        Etapa {j.step}
                      </div>
                      <p className="text-[10px] font-black leading-tight">{j.fase}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-white/60 px-1.5 py-0.5 rounded-full border">
                      {j.modulo}
                    </span>
                  </button>

                  {i < JORNADA.length - 1 && (
                    <div className="flex flex-col items-center px-2 shrink-0">
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detalhe da etapa selecionada */}
          {activeStep && (() => {
            const j = JORNADA.find(x => x.step === activeStep)!;
            const Icon = j.icon;
            const prevStep = JORNADA.find(x => x.step === activeStep - 1);
            const nextStep = JORNADA.find(x => x.step === activeStep + 1);

            return (
              <div className={`rounded-2xl border p-6 ${j.lightColor} animate-in fade-in slide-in-from-top-2 duration-200`}>
                {/* Cabeçalho da etapa */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${j.color} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Etapa {j.step} de {JORNADA.length}</p>
                      <h4 className="font-black text-base">{j.fase}</h4>
                      <p className="text-[10px] font-bold opacity-60">{j.modulo}</p>
                    </div>
                  </div>
                  <span className="text-3xl">{j.emoji}</span>
                </div>

                {/* O que é esta etapa */}
                <div className="bg-white/50 rounded-xl p-4 mb-4 border border-white/60">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">O que acontece aqui</p>
                  <p className="text-sm font-semibold leading-relaxed">{j.o_que}</p>
                </div>

                {/* Passo a passo */}
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Como fazer</p>
                  <div className="space-y-2">
                    {j.como.map((passo, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/40 rounded-xl p-3 border border-white/50">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5 ${j.color}`}>
                          {idx + 1}
                        </div>
                        <p className="text-xs font-semibold leading-relaxed">{passo}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conexão com próxima etapa */}
                {nextStep && (
                  <div className="flex items-center gap-3 bg-white/30 rounded-xl p-3 border border-white/40">
                    <ArrowRight className="w-4 h-4 shrink-0 opacity-60" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5">Conexão com próxima etapa</p>
                      <p className="text-xs font-semibold">{j.conecta}</p>
                    </div>
                    <button
                      onClick={() => setActiveStep(nextStep.step)}
                      className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-widest bg-white/60 px-2.5 py-1.5 rounded-lg border border-white hover:bg-white/80 transition-colors"
                    >
                      Próxima etapa →
                    </button>
                  </div>
                )}

                {/* Última etapa — loop */}
                {!nextStep && (
                  <div className="flex items-center gap-3 bg-white/30 rounded-xl p-3 border border-white/40">
                    <Check className="w-4 h-4 shrink-0 opacity-60" />
                    <p className="text-xs font-semibold">{j.conecta}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Dica rápida quando nenhuma etapa está selecionada */}
          {!activeStep && (
            <div className="flex items-center gap-3 bg-white/60 border border-slate-100 rounded-2xl px-5 py-4">
              <Play className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-slate-500 font-medium">
                Clique em qualquer etapa acima para ver o passo a passo detalhado e como ela se conecta à próxima.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
