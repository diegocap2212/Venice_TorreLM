import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VagaCardProps {
  vaga: {
    id: string;
    titulo: string;
    perfil_tipo: string;
    senioridade: string;
    urgencia: string;
    data_etapa_atual: Date;
    sla_dias: number;
    responsavel: {
      name: string | null;
      role: string;
    };
  };
  onClick?: () => void;
}

export function VagaCard({ vaga, onClick }: VagaCardProps) {
  const diffInDays = Math.floor((new Date().getTime() - new Date(vaga.data_etapa_atual).getTime()) / (1000 * 3600 * 24));
  const isOverSLA = diffInDays >= vaga.sla_dias;
  const isNearSLA = !isOverSLA && diffInDays >= vaga.sla_dias - 2;

  const urgenciaColors: Record<string, string> = {
    CRITICA: "bg-red-100 text-red-700 border-red-200",
    ALTA: "bg-orange-100 text-orange-700 border-orange-200",
    NORMAL: "bg-blue-100 text-blue-700 border-blue-200",
    BAIXA: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <Card 
      onClick={onClick}
      className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] group border-l-4" 
      style={{ 
        borderLeftColor: vaga.urgencia === 'CRITICA' ? '#ef4444' : vaga.urgencia === 'ALTA' ? '#f97316' : '#94a3b8' 
      }}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 py-0 ${urgenciaColors[vaga.urgencia] || ""}`}>
            {vaga.urgencia}
          </Badge>
          <div className="flex items-center gap-1 text-slate-400">
             {isOverSLA ? (
               <Badge className="bg-red-500 hover:bg-red-600 text-[10px] h-5 px-1.5">
                 <AlertCircle className="w-3 h-3 mr-1" />
                 SLA VENCIDO
               </Badge>
             ) : (
               <span className={`text-[10px] flex items-center gap-1 ${isNearSLA ? 'text-orange-500 font-medium' : ''}`}>
                 <Clock className="w-3 h-3" />
                 {diffInDays}d na etapa
               </span>
             )}
          </div>
        </div>
        <CardTitle className="text-sm font-semibold text-slate-800 leading-snug mt-2 group-hover:text-primary transition-colors">
          {vaga.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
           <span>{vaga.perfil_tipo}</span>
           <span className="w-1 h-1 rounded-full bg-slate-300" />
           <span>{vaga.senioridade}</span>
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t pt-3 border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Responsável</span>
            <span className="text-xs font-medium text-slate-700">{vaga.responsavel.name}</span>
          </div>
          <Avatar className="h-6 w-6 border border-white">
            <AvatarFallback className="bg-slate-200 text-[10px] text-slate-600">
              {vaga.responsavel.role}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  );
}
