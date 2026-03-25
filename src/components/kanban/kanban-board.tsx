"use client";

import { useState } from "react";
import { KanbanColumn } from "./kanban-column";
import { VagaDrawer } from "./vaga-drawer";

interface KanbanBoardProps {
  initialVagas: any[];
}

export function KanbanBoard({ initialVagas }: KanbanBoardProps) {
  const [aba, setAba] = useState<"RECRUTAMENTO" | "ONBOARDING">("RECRUTAMENTO");
  const [selectedVaga, setSelectedVaga] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleVagaClick = (vaga: any) => {
    setSelectedVaga(vaga);
    setIsDrawerOpen(true);
  };

  const colunasRS = [
    { id: "REQUISICAO", title: "Requisição", color: "bg-blue-500" },
    { id: "PREPARACAO", title: "Preparação", color: "bg-purple-900" },
    { id: "TRIAGEM", title: "Triagem & Entrevistas", color: "bg-amber-600" },
    { id: "SHORTLIST", title: "Shortlist ao Cliente", color: "bg-amber-500" },
    { id: "ENTREVISTA_CLIENTE", title: "Entrevista Cliente", color: "bg-amber-400" },
    { id: "APROVACAO_PROPOSTA", title: "Aprovação & Proposta", color: "bg-purple-600" },
  ];

  const colunasOnboarding = [
    { id: "CONTRATACAO", title: "Contratação", color: "bg-green-700" },
    { id: "ONB_ADMINISTRATIVO", title: "Onboarding Adm", color: "bg-teal-600" },
    { id: "ONB_OPERACIONAL", title: "Onboarding Op", color: "bg-purple-500" },
    { id: "SEMANA_1", title: "Semana 1", color: "bg-blue-400" },
    { id: "MES_1_ALEM", title: "Mês 1 e Além", color: "bg-purple-800" },
  ];

  const colunasAtuais = aba === "RECRUTAMENTO" ? colunasRS : colunasOnboarding;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-200/50 rounded-lg self-start">
        <button
          onClick={() => setAba("RECRUTAMENTO")}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
            aba === "RECRUTAMENTO"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Recrutamento & Seleção
        </button>
        <button
          onClick={() => setAba("ONBOARDING")}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
            aba === "ONBOARDING"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Onboarding
        </button>
      </div>

      {/* Board Scroll Area */}
      <div className="flex flex-1 overflow-x-auto gap-6 pb-6 scrollbar-thin scrollbar-thumb-slate-200">
        {colunasAtuais.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            vagas={initialVagas.filter((v) => v.etapa_atual === col.id)}
            onVagaClick={handleVagaClick}
          />
        ))}
        {/* Espaçador final para o scroll não colar no canto */}
        <div className="w-1 shrink-0" />
      </div>

      <VagaDrawer 
        key={selectedVaga?.id}
        vaga={selectedVaga} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
