import { ScrollArea } from "@/components/ui/scroll-area";
import { VagaCard } from "./vaga-card";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  vagas: any[];
  onVagaClick?: (vaga: any) => void;
}

export function KanbanColumn({ id, title, color, vagas, onVagaClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col w-80 rounded-2xl border transition-all shrink-0 overflow-hidden min-h-[500px] ${
        isOver 
          ? "bg-slate-100 border-primary/20 shadow-inner" 
          : "bg-slate-50/50 border-slate-200/50"
      }`}
    >
      <div className={`h-1 w-full ${color} opacity-80`} />
      <div className="p-5 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">
            {title}
          </h3>
          <span className="bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-extrabold ring-1 ring-slate-200/50">
            {vagas.length}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 pt-4">
        <div className="flex flex-col gap-4 pb-6">
          {vagas.map((vaga) => (
            <VagaCard key={vaga.id} vaga={vaga} onClick={() => onVagaClick?.(vaga)} />
          ))}
          {vagas.length === 0 && (
            <div className="border-2 border-dashed border-slate-200/60 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white/30 transition-all">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                 <div className="w-1 h-1 rounded-full bg-slate-300" />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sem itens</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
