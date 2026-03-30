"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Target, 
  ChevronDown, 
  Briefcase, 
  ShieldCheck, 
  ClipboardList,
  Sparkles,
  LogOut
} from "lucide-react";
import { useRole } from "@/components/providers/role-provider";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Sidebar() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useRole();

  const currentTab = searchParams.get("tab") || "recrutamento";
  const currentView = searchParams.get("view") || "home";
  const [pipelineOpen, setPipelineOpen] = useState(currentView === "pipeline");

  // Feature Flag para funcionalidade futura
  const showPipeline = false;

  useEffect(() => {
    if (currentView === "pipeline") setPipelineOpen(true);
  }, [currentView]);

  const setView = (view: string, tab?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    if (tab) {
      params.set("tab", tab);
    } else if (view === "pipeline") {
      params.set("tab", "recrutamento");
    } else {
      params.delete("tab");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <aside className="w-72 bg-background border-r border-border flex flex-col h-full overflow-hidden transition-all duration-300 relative">

      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-6 pb-24 px-4 space-y-1">

        {/* Dashboard Home */}
        <button
          onClick={() => setView("home")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${
            currentView === "home" 
              ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50" 
              : "text-foreground/50 hover:text-foreground hover:bg-white/60"
          }`}
        >
          <div className={`p-2 rounded-lg transition-all duration-500 ${currentView === "home" ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"}`}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider">Visão Geral</span>
        </button>

        {/* Pipeline & Onboarding Group */}
        {showPipeline && (
          <div className="space-y-1">
            <button
              onClick={() => setPipelineOpen(!pipelineOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                currentView === "pipeline" 
                  ? "bg-white text-emerald-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${currentView === "pipeline" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Pipeline Gestão</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${pipelineOpen ? "rotate-180" : ""}`} />
            </button>

            {pipelineOpen && (
              <div className="ml-10 pr-2 space-y-1 animate-in slide-in-from-top-2 duration-500">
                <button
                  onClick={() => setView("pipeline", "recrutamento")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    currentView === "pipeline" && currentTab === "recrutamento"
                      ? "text-emerald-700 bg-emerald-50/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentView === "pipeline" && currentTab === "recrutamento" ? "bg-emerald-500 scale-125 shadow-sm" : "bg-slate-200"}`} />
                  Recrutamento
                </button>
                <button
                  onClick={() => setView("pipeline", "onboarding")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    currentView === "pipeline" && currentTab === "onboarding"
                      ? "text-orange-700 bg-orange-50/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentView === "pipeline" && currentTab === "onboarding" ? "bg-orange-500 scale-125 shadow-sm" : "bg-slate-200"}`} />
                  Onboarding
                </button>
              </div>
            )}
          </div>
        )}

        {/* Governance Sections */}


        <button
          onClick={() => setView("colaboradores")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${
            currentView === "colaboradores" 
              ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50" 
              : "text-foreground/50 hover:text-foreground hover:bg-white/60"
          }`}
        >
          <div className={`p-2 rounded-lg transition-all duration-500 ${currentView === "colaboradores" ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"}`}>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider">Colaboradores</span>
        </button>

        <button
          onClick={() => setView("ways-of-working")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${
            currentView === "ways-of-working" 
              ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50" 
              : "text-foreground/50 hover:text-foreground hover:bg-white/60"
          }`}
        >
          <div className={`p-2 rounded-lg transition-all duration-500 ${currentView === "ways-of-working" ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"}`}>
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider">Ways of Working</span>
        </button>

        <button
          onClick={() => setView("cone-locavia")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${
            currentView === "cone-locavia" 
              ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50" 
              : "text-foreground/50 hover:text-foreground hover:bg-white/60"
          }`}
        >
          <div className={`p-2 rounded-lg transition-all duration-500 ${currentView === "cone-locavia" ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"}`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider">Cone Locavia</span>
        </button>

        <button
          onClick={() => setView("reports")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${
            currentView === "reports" 
              ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50" 
              : "text-foreground/50 hover:text-foreground hover:bg-white/60"
          }`}
        >
          <div className={`p-2 rounded-lg transition-all duration-500 ${currentView === "reports" ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider">Repositório</span>
        </button>
      </div>
      
      {/* Footer Profile */}
      <div className="absolute bottom-0 w-full p-6 border-t border-border bg-white/40 backdrop-blur-xl">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-border/50 shadow-sm transition-all duration-500 group hover:shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center text-primary text-xs font-black border border-border shadow-inner transition-all duration-500 shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-black text-foreground/40 uppercase tracking-tighter">Logado como</span>
              <span className="text-[11px] font-black text-foreground -mt-0.5 truncate">{session?.user?.name || "Usuário"}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="p-2 rounded-lg text-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all duration-300 shrink-0"
            title="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
