import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface VagaCardProps {
  vaga: {
    id: string;
    titulo: string;
    perfil_tipo: string;
    senioridade: string;
    urgencia: string;
    etapa_atual: string;
    data_etapa_atual: Date;
    sla_dias: number;
    responsavel: {
      name: string | null;
      role: string;
    };
  };
  onClick?: () => void;
  isOverlay?: boolean;
}

export function VagaCard({ vaga, onClick, isOverlay }: VagaCardProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: vaga.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const diffInDays = Math.floor((new Date().getTime() - new Date(vaga.data_etapa_atual).getTime()) / (1000 * 3600 * 24));
  const isOverSLA = diffInDays >= vaga.sla_dias;
  const isNearSLA = !isOverSLA && diffInDays >= vaga.sla_dias - 2;

  const urgenciaColors: Record<string, string> = {
    CRITICA: "bg-red-50 text-red-600 border-red-100",
    ALTA: "bg-orange-50 text-orange-600 border-orange-100",
    NORMAL: "bg-slate-50 text-slate-500 border-slate-100",
    BAIXA: "bg-slate-50 text-slate-400 border-slate-100",
  };

  const statusIndicatorColor = vaga.urgencia === 'CRITICA' ? 'bg-red-500' : vaga.urgencia === 'ALTA' ? 'bg-orange-500' : 'bg-slate-300';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group outline-none focus:ring-2 focus:ring-primary/20 rounded-xl ${isDragging ? 'z-50' : ''}`}
    >
      <Card 
        className={`relative bg-white border border-slate-200/60 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-grab active:cursor-grabbing overflow-hidden ${isOverlay ? 'shadow-2xl border-primary/40 ring-1 ring-primary/10' : ''}`}
        onClick={(e) => {
          // If we're dragging, don't trigger click
          if (isDragging) return;
          onClick?.();
        }}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusIndicatorColor} opacity-70`} />
        
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start gap-2">
            <Badge variant="outline" className={`text-[9px] uppercase font-extrabold px-1.5 py-0 border-0 rounded-md tracking-tighter ${urgenciaColors[vaga.urgencia] || ""}`}>
              {vaga.urgencia}
            </Badge>
            <div className="flex items-center gap-1 text-slate-400">
               {isOverSLA ? (
                 <div className="flex items-center gap-1 text-red-500">
                   <AlertCircle className="w-3 h-3" />
                   <span className="text-[9px] font-black uppercase">SLA VENCIDO</span>
                 </div>
               ) : (
                 <span className={`text-[9px] font-bold uppercase tracking-tight flex items-center gap-1 ${isNearSLA ? 'text-orange-500' : 'text-slate-400'}`}>
                   <Clock className="w-2.5 h-2.5" />
                   {diffInDays}d na etapa
                 </span>
               )}
            </div>
          </div>
          <CardTitle className="text-[13px] font-bold text-slate-800 leading-tight mt-3 group-hover:text-primary transition-colors">
            {vaga.titulo}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
             <span>{vaga.perfil_tipo}</span>
             <span className="w-1 h-1 rounded-full bg-slate-200" />
             <span>{vaga.senioridade}</span>
          </div>
          
          <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Responsável</span>
              <span className="text-[11px] font-bold text-slate-700 -mt-0.5">{vaga.responsavel.name || 'Sem nome'}</span>
            </div>
            <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-slate-100 text-[9px] font-black text-slate-500 uppercase">
                {vaga.responsavel.role.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Atalhos de Transição Visual entre Esteiras */}
          {vaga.etapa_atual === 'CONTRATACAO' && (
            <div className="mt-3 overflow-hidden rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(); // Open drawer so user can move it
                }}
                className="w-full py-2 px-3 flex items-center justify-between group/btn"
              >
                <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50 animate-pulse" />
                  Finalizar para Onboarding
                </div>
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/btn:translate-x-1 transition-transform">
                  <div className="border-t-2 border-r-2 border-primary w-1.5 h-1.5 rotate-45 mr-0.5" />
                </div>
              </button>
            </div>
          )}

          {vaga.etapa_atual === 'ONB_ADMINISTRATIVO' && (
            <div className="mt-3 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(); // Open drawer
                }}
                className="w-full py-2 px-3 flex items-center justify-between group/btn"
              >
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Retornar ao Recrutamento
                </div>
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/btn:-translate-x-1 transition-transform">
                  <div className="border-b-2 border-l-2 border-slate-400 w-1.5 h-1.5 rotate-45 ml-0.5" />
                </div>
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
