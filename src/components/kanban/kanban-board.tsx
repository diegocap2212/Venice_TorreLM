"use client";

import { useState, useEffect } from "react";
import { KanbanColumn } from "./kanban-column";
import { VagaDrawer } from "./vaga-drawer";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove 
} from "@dnd-kit/sortable";
import { updateVagaEtapa } from "@/app/actions/vaga-actions";
import { useRouter } from "next/navigation";
import { VagaCard } from "./vaga-card";

interface KanbanBoardProps {
  initialVagas: any[];
  initialTab?: "RECRUTAMENTO" | "ONBOARDING";
  hideHeader?: boolean;
}

export function KanbanBoard({ initialVagas, initialTab = "RECRUTAMENTO", hideHeader = false }: KanbanBoardProps) {
  const [vagas, setVagas] = useState(initialVagas);
  const [aba, setAba] = useState<"RECRUTAMENTO" | "ONBOARDING">(initialTab);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedVaga, setSelectedVaga] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  // Update local state when initialVagas change
  useEffect(() => {
    setVagas(initialVagas);
  }, [initialVagas]);

  // Sync state with prop if it changes externally (e.g. sidebar navigation)
  useEffect(() => {
    setAba(initialTab);
  }, [initialTab]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleVagaClick = (vaga: any) => {
    setSelectedVaga(vaga);
    setIsDrawerOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const vagaId = active.id as string;
    const overId = over.id as string;

    // Check if dropping over a column or another card
    const activeVaga = vagas.find((v) => v.id === vagaId);
    if (!activeVaga) return;

    // Determine target column
    let targetEtapa = overId;
    // If dropped over another card, get its column
    const overVaga = vagas.find((v) => v.id === overId);
    if (overVaga) {
      targetEtapa = overVaga.etapa_atual;
    }

    if (activeVaga.etapa_atual !== targetEtapa) {
      // Optimistic update
      setVagas((prev) => 
        prev.map((v) => 
          v.id === vagaId ? { ...v, etapa_atual: targetEtapa } : v
        )
      );

      try {
        await updateVagaEtapa(vagaId, targetEtapa);
        router.refresh();
      } catch (error) {
        // Rollback on error
        setVagas(initialVagas);
      }
    }
  };

  const colunasRS = [
    { id: "REQUISICAO", title: "Requisição", color: "bg-blue-600" },
    { id: "PREPARACAO", title: "Preparação", color: "bg-orange-500" },
    { id: "TRIAGEM", title: "Triagem & Entrevistas", color: "bg-purple-600" },
    { id: "SHORTLIST", title: "Shortlist ao Cliente", color: "bg-teal-600" },
    { id: "ENTREVISTA_CLIENTE", title: "Entrevista Cliente", color: "bg-amber-600" },
    { id: "APROVACAO_PROPOSTA", title: "Aprovação & Proposta", color: "bg-emerald-600" },
  ];

  const colunasOnboarding = [
    { id: "CONTRATACAO", title: "Contratação", color: "bg-purple-600" },
    { id: "ONB_ADMINISTRATIVO", title: "Onboarding Adm", color: "bg-orange-600" },
    { id: "ONB_OPERACIONAL", title: "Onboarding Op", color: "bg-emerald-600" },
    { id: "SEMANA_1", title: "Semana 1", color: "bg-blue-600" },
    { id: "MES_1_ALEM", title: "Mês 1 e Além", color: "bg-teal-600" },
  ];

  const colunasAtuais = aba === "RECRUTAMENTO" ? colunasRS : colunasOnboarding;

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Board Header - Unified Venice Style */}
      {!hideHeader && (
        <div className="h-20 px-8 border-b border-slate-200 bg-emerald-500/[0.02] flex items-center justify-between shrink-0 mb-8 -mx-6 -mt-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 animate-pulse" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                Pipeline de Contratações
              </h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">
              Gestão de Talentos Torre LM
            </p>
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set("tab", "recrutamento");
                window.history.replaceState(null, "", `?${params.toString()}`);
                setAba("RECRUTAMENTO");
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                aba === "RECRUTAMENTO" 
                  ? "bg-white text-blue-600 shadow-sm shadow-blue-500/10 border border-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              1 - R & S
            </button>
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set("tab", "onboarding");
                window.history.replaceState(null, "", `?${params.toString()}`);
                setAba("ONBOARDING");
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                aba === "ONBOARDING" 
                  ? "bg-white text-orange-600 shadow-sm shadow-orange-500/10 border border-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              2 - Onboarding
            </button>
          </div>
        </div>
      )}

      {/* Board Scroll Area */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-x-auto gap-6 pb-8 scrollbar-thin scrollbar-thumb-slate-200 select-none">
          {colunasAtuais.map((col) => {
            const columnVagas = vagas.filter((v) => v.etapa_atual === col.id);
            return (
              <SortableContext 
                key={col.id} 
                items={columnVagas.map(v => v.id)} 
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  vagas={columnVagas}
                  onVagaClick={handleVagaClick}
                />
              </SortableContext>
            );
          })}
          {/* Final Spacer */}
          <div className="w-4 shrink-0" />
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            <div className="rotate-2 scale-105 transition-transform duration-200 shadow-2xl">
              <VagaCard 
                vaga={vagas.find(v => v.id === activeId)} 
                onClick={() => {}} 
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <VagaDrawer 
        key={selectedVaga?.id}
        vaga={selectedVaga} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
