import { ScrollArea } from "@/components/ui/scroll-area";
import { VagaCard } from "./vaga-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  vagas: any[];
  onVagaClick?: (vaga: any) => void;
}

export function KanbanColumn({ id, title, color, vagas, onVagaClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-80 bg-slate-100/50 rounded-xl border border-slate-200/60 overflow-hidden shrink-0">
      <div className={`h-1.5 w-full ${color}`} />
      <div className="p-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
          {title}
          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
            {vagas.length}
          </span>
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-3 pt-0">
        <div className="flex flex-col gap-3 pb-4">
          {vagas.map((vaga) => (
            <VagaCard key={vaga.id} vaga={vaga} onClick={() => onVagaClick?.(vaga)} />
          ))}
          {vagas.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex items-center justify-center text-center">
               <p className="text-xs text-slate-400 italic">Nenhuma vaga nesta etapa</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
