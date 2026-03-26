"use client";

import { useSearchParams } from "next/navigation";
import { useRole, Role } from "@/components/providers/role-provider";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Briefcase, Target, Users, LayoutDashboard } from "lucide-react";

export function Topbar() {
  const { role, setRole } = useRole();
  const searchParams = useSearchParams();
  
  const currentView = searchParams.get("view") || "pipeline";
  const currentTab = searchParams.get("tab") || "recrutamento";

  const getTitle = () => {
    if (currentView === "ways-of-working") return "VENICE | WAYS OF WORKING";
    if (currentView === "cone-locavia") return "VENICE | CONE LOCAVIA";
    if (currentView === "colaboradores") return "VENICE | COLABORADORES";
    if (currentView === "reports") return "VENICE | REPORTS E MATERIAIS";
    return "VENICE | TORRE LM";
  };

  const getSubtitle = () => {
    if (currentView === "ways-of-working") return "Guia de Processos e Cultura Venice";
    if (currentView === "cone-locavia") return "Dashboard de Performance e Métricas";
    if (currentView === "colaboradores") return "Gestão de Pessoas e Times";
    if (currentView === "reports") return "Materiais, Atas e Documentos";
    return currentTab === "onboarding" ? "Pipeline de Integração (Onboarding)" : "Pipeline de Recrutamento (R&S)";
  };

  return (
    <header className="h-20 border-b border-slate-200 bg-emerald-500/[0.03] flex items-center justify-between px-8 shrink-0 relative overflow-hidden transition-all duration-300">
      {/* Visual Accents */}
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500/40 animate-pulse" />
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
              {getTitle()}
            </h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3.5 italic">
            {getSubtitle()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simular Perfil:</span>
          <Select value={role} onValueChange={(r) => setRole(r as Role)}>
            <SelectTrigger className="w-[160px] h-9 text-[10px] font-black uppercase tracking-widest bg-white border-slate-200 rounded-xl shadow-sm hover:border-primary/30 transition-all">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 rounded-xl overflow-hidden shadow-2xl">
              <SelectItem value="BP" className="text-[10px] font-black uppercase tracking-widest py-2.5">BP (RH)</SelectItem>
              <SelectItem value="G" className="text-[10px] font-black uppercase tracking-widest py-2.5">Gerente (G)</SelectItem>
              <SelectItem value="SDM" className="text-[10px] font-black uppercase tracking-widest py-2.5">Delivery (SDM)</SelectItem>
              <SelectItem value="DP" className="text-[10px] font-black uppercase tracking-widest py-2.5">Dep. Pessoal (DP)</SelectItem>
              <SelectItem value="ADMIN" className="text-[10px] font-black uppercase tracking-widest py-2.5">Admin Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[11px] font-black text-emerald-600 shadow-sm shadow-emerald-500/5">
          {role}
        </div>
      </div>
    </header>
  );
}
