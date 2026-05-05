"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertTriangle, Calendar, ShieldAlert } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DemandaCardProps {
  demanda: {
    id: string;
    titulo: string;
    descricao?: string | null;
    tipo: string;
    etapa: string;
    prioridade: string;
    squad?: string | null;
    tags: string[];
    bloqueada: boolean;
    motivo_bloqueio?: string | null;
    data_criacao: Date;
    data_prevista?: Date | null;
    responsavel?: {
      name: string | null;
      id: string;
    } | null;
  };
  onClick?: () => void;
  isOverlay?: boolean;
}

const prioridadeColors: Record<string, string> = {
  CRITICA: "bg-red-50 text-red-600 border-red-100",
  ALTA: "bg-orange-50 text-orange-600 border-orange-100",
  NORMAL: "bg-blue-50 text-blue-600 border-blue-100",
  BAIXA: "bg-slate-50 text-slate-500 border-slate-100",
};

const prioridadeStrip: Record<string, string> = {
  CRITICA: "bg-red-500",
  ALTA: "bg-orange-500",
  NORMAL: "bg-blue-400",
  BAIXA: "bg-slate-300",
};

const tipoLabels: Record<string, string> = {
  INICIATIVA: "Iniciativa",
  PROJETO: "Projeto",
  TAREFA: "Tarefa",
  MELHORIA: "Melhoria",
};

export function DemandaCard({ demanda, onClick, isOverlay }: DemandaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demanda.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const diffInDays = Math.floor(
    (new Date().getTime() - new Date(demanda.data_criacao).getTime()) /
      (1000 * 3600 * 24)
  );

  const isOverdue =
    demanda.data_prevista && isPast(new Date(demanda.data_prevista)) && demanda.etapa !== "DONE";

  const visibleTags = demanda.tags.slice(0, 3);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group outline-none focus:ring-2 focus:ring-primary/20 rounded-xl ${isDragging ? "z-50" : ""}`}
    >
      <Card
        className={`relative bg-white border border-slate-200/60 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-grab active:cursor-grabbing overflow-hidden ${
          isOverlay ? "shadow-2xl border-primary/40 ring-1 ring-primary/10" : ""
        } ${demanda.bloqueada ? "border-red-200/80" : ""}`}
        onClick={() => {
          if (isDragging) return;
          onClick?.();
        }}
      >
        {/* Priority strip */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${prioridadeStrip[demanda.prioridade] || "bg-slate-300"} opacity-70`}
        />

        <CardContent className="p-4 pl-5 space-y-3">
          {/* Top: tipo + prioridade */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {tipoLabels[demanda.tipo] || demanda.tipo}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] uppercase font-extrabold px-1.5 py-0 border-0 rounded-md tracking-tighter ${
                prioridadeColors[demanda.prioridade] || ""
              }`}
            >
              {demanda.prioridade}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">
              {demanda.titulo}
            </p>
            {demanda.squad && (
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {demanda.squad}
              </p>
            )}
          </div>

          {/* Blocker */}
          {demanda.bloqueada && (
            <div className="flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-2">
              <ShieldAlert className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
              <span className="text-[10px] font-semibold text-red-600 leading-tight">
                {demanda.motivo_bloqueio || "Bloqueada"}
              </span>
            </div>
          )}

          {/* Due date + tags */}
          {(demanda.data_prevista || visibleTags.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              {demanda.data_prevista && (
                <div
                  className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isOverdue
                      ? "bg-red-50 text-red-500 border border-red-100"
                      : "bg-slate-50 text-slate-500 border border-slate-100"
                  }`}
                >
                  <Calendar className="w-2.5 h-2.5" />
                  {format(new Date(demanda.data_prevista), "dd/MMM", { locale: ptBR })}
                  {isOverdue && (
                    <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                  )}
                </div>
              )}
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer: responsável + dias */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-slate-100 text-[8px] font-black text-slate-500 uppercase">
                  {(demanda.responsavel?.name || "?")
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[100px]">
                {demanda.responsavel?.name || "Sem responsável"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold">{diffInDays}d</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
