"use client";

import { useState, useEffect } from "react";
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
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DemandaColumn } from "./demanda-column";
import { DemandaCard } from "./demanda-card";
import { DemandaDrawer } from "./demanda-drawer";
import { CreateDemandaDialog } from "./create-demanda-dialog";
import { updateDemandaEtapa } from "@/app/actions/demanda-actions";

const COLUNAS = [
  { id: "BACKLOG", title: "Backlog", color: "bg-slate-400" },
  { id: "TODO", title: "To Do", color: "bg-blue-500" },
  { id: "DOING", title: "Doing", color: "bg-amber-500" },
  { id: "DONE", title: "Done", color: "bg-emerald-500" },
];

interface DemandaBoardProps {
  initialDemandas: any[];
}

export function DemandaBoard({ initialDemandas }: DemandaBoardProps) {
  const [demandas, setDemandas] = useState(initialDemandas);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDemanda, setSelectedDemanda] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setDemandas(initialDemandas);
  }, [initialDemandas]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const demandaId = active.id as string;
    const overId = over.id as string;

    const activeDemanda = demandas.find((d) => d.id === demandaId);
    if (!activeDemanda) return;

    let targetEtapa = overId;
    const overDemanda = demandas.find((d) => d.id === overId);
    if (overDemanda) targetEtapa = overDemanda.etapa;

    if (activeDemanda.etapa !== targetEtapa) {
      setDemandas((prev) =>
        prev.map((d) => (d.id === demandaId ? { ...d, etapa: targetEtapa } : d))
      );

      try {
        await updateDemandaEtapa(demandaId, targetEtapa);
      } catch {
        setDemandas(initialDemandas);
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex justify-end">
        <CreateDemandaDialog onCreated={(d) => setDemandas((prev) => [d, ...prev])} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-x-auto gap-4 pb-8 scrollbar-thin scrollbar-thumb-slate-200 select-none">
          {COLUNAS.map((col) => {
            const colDemandas = demandas.filter((d) => d.etapa === col.id);
            return (
              <SortableContext
                key={col.id}
                items={colDemandas.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <DemandaColumn
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  demandas={colDemandas}
                  onDemandaClick={(d) => {
                    setSelectedDemanda(d);
                    setIsDrawerOpen(true);
                  }}
                />
              </SortableContext>
            );
          })}
          <div className="w-4 shrink-0" />
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            <div className="rotate-2 scale-105 transition-transform duration-200 shadow-2xl">
              <DemandaCard
                demanda={demandas.find((d) => d.id === activeId)}
                onClick={() => {}}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DemandaDrawer
        key={selectedDemanda?.id}
        demanda={selectedDemanda}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={(updated) =>
          setDemandas((prev) =>
            prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
          )
        }
        onDelete={(id) => {
          setDemandas((prev) => prev.filter((d) => d.id !== id));
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}
