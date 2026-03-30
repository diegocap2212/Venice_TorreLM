"use client";

import { useSearchParams } from "next/navigation";
import { useRole, Role } from "@/components/providers/role-provider";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Image from "next/image";
import { Briefcase, Target, Users, LayoutDashboard, User as UserIcon, ShieldCheck } from "lucide-react";

export function Topbar() {
  const { data: session } = useSession();
  const { role, setRole } = useRole();
  const searchParams = useSearchParams();

  const currentView = searchParams.get("view") || "home";
  const currentTab = searchParams.get("tab") || "recrutamento";

  useEffect(() => {
    if ((session?.user as any)?.role) {
      setRole((session?.user as any).role as Role);
    }
  }, [session, setRole]);

  const getTitle = () => {
    if (currentView === "home") return "VENICE | VISÃO GERAL";
    if (currentView === "ways-of-working") return "VENICE | WAYS OF WORKING";
    if (currentView === "cone-locavia") return "VENICE | CONE LOCAVIA";
    if (currentView === "colaboradores") return "VENICE | COLABORADORES";
    if (currentView === "reports") return "VENICE | REPORTS E MATERIAIS";
    if (currentView === "pipeline") {
      return currentTab === "onboarding" ? "VENICE | ONBOARDING" : "VENICE | RECRUTAMENTO";
    }
    return "VENICE | SISTEMA";
  };

  const getSubtitle = () => {
    if (currentView === "home") return "Centro de Controle e Indicadores da Torre";
    if (currentView === "ways-of-working") return "Guia de Processos e Cultura Venice";
    if (currentView === "cone-locavia") return "Dashboard de Performance e Métricas";
    if (currentView === "colaboradores") return "Gestão de Pessoas e Times";
    if (currentView === "reports") return "Materiais, Atas e Documentos";
    if (currentView === "pipeline") {
      return currentTab === "onboarding" ? "Pipeline de Integração (Experiência Onboarding)" : "Pipeline de Recrutamento (Seleção e R&S)";
    }
    return "Painel de Acesso Corporativo";
  };

  return (
    <header className="h-24 border-b border-border bg-white/40 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 relative overflow-hidden transition-all duration-500">
      {/* Decorative Gradient Accent */}
      <div className="absolute top-0 right-[15%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center gap-10 relative z-10">
        <div className="flex items-center gap-6 pr-8 border-r border-border/50">
          <div className="relative w-28 h-8 flex items-center justify-center transition-transform duration-500 hover:scale-105">
            <Image 
              src="/venice-logo-black.png"
              alt="Venice Logo" 
              className="w-full h-full object-contain" 
              width={112}
              height={32}
              priority
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(0,255,153,0.5)] animate-pulse" />
            <h1 className="text-base font-black text-foreground uppercase tracking-[0.1em]">
              {getTitle()}
            </h1>
          </div>
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] pl-5 italic">
            {getSubtitle()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-8 relative z-10">
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-3 group cursor-default">
            <span className="text-[11px] font-black text-foreground uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
              {session?.user?.name || "Usuário"}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-foreground text-primary flex items-center justify-center text-xs font-black border border-border shadow-inner group-hover:scale-105 transition-transform">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
