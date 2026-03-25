"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, Target, ChevronDown, Briefcase } from "lucide-react";
import { useRole } from "@/components/providers/role-provider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useRole();

  const currentTab = searchParams.get("tab") || "recrutamento";
  const currentView = searchParams.get("view") || "pipeline";

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    router.push(`/?${params.toString()}`);
  };

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    params.set("view", "pipeline"); // Always switch back to pipeline when changing tabs
    router.push(`/?${params.toString()}`);
  };


  return (
    <aside className="w-72 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30 text-slate-900 flex flex-col shrink-0 min-h-screen border-r border-slate-200 transition-all duration-300">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 bg-emerald-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-10">
          <div className="w-12 h-12 rounded-full bg-emerald-500 blur-xl" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black tracking-tighter text-slate-800 text-sm uppercase flex items-center gap-1.5">
              <span className="text-emerald-600">[</span>
              VENICE - TORRE LM
              <span className="text-emerald-600">]</span>
            </h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de Talentos</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-8">
        {/* Navigation Group */}
        <section className="space-y-4">
          <div>
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pipeline Contratações</p>
            <div className="space-y-1.5">
              <button
                onClick={() => setView("pipeline")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                  currentView === "pipeline" 
                    ? "bg-white border-primary/20 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/5" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${currentView === "pipeline" ? "bg-primary text-white" : "bg-slate-200/50 text-slate-400"}`}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                Portal Kanban
              </button>
              
                <div className="mt-2 pl-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/20 outline-none transition-all hover:bg-primary/10 shadow-sm shadow-primary/5">
                      <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${currentTab === "onboarding" ? "bg-orange-500 shadow-orange-500/40 animate-pulse" : "bg-blue-600 shadow-blue-600/40 animate-pulse"}`} />
                        {currentTab === "onboarding" ? "2 - Onboarding" : "1 - R & S"}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border-slate-200 text-slate-700 shadow-xl rounded-xl p-1 animate-in slide-in-from-top-2 duration-200" align="start">
                      <DropdownMenuItem 
                        onClick={() => setTab("recrutamento")}
                        className={`text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${currentTab !== "onboarding" ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${currentTab !== "onboarding" ? 'bg-blue-600 shadow-sm shadow-blue-600/50' : 'bg-slate-300'}`} />
                        1 - Recrutamento & Seleção
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setTab("onboarding")}
                        className={`text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${currentTab === "onboarding" ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${currentTab === "onboarding" ? 'bg-orange-600 shadow-sm shadow-orange-600/50' : 'bg-slate-300'}`} />
                        2 - Onboarding
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              <button
                onClick={() => setView("colaboradores")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                  currentView === "colaboradores" 
                    ? "bg-white border-primary/20 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/5" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${currentView === "colaboradores" ? "bg-primary text-white" : "bg-slate-200/50 text-slate-400"}`}>
                  <Users className="w-4 h-4" />
                </div>
                Colaboradores
              </button>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Conexões Venice</p>
            <div className="space-y-1.5">
              <button
                onClick={() => setView("ways-of-working")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                  currentView === "ways-of-working" 
                    ? "bg-white border-emerald-500/20 text-emerald-600 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/5" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${currentView === "ways-of-working" ? "bg-emerald-500 text-white" : "bg-slate-200/50 text-slate-400"}`}>
                  <Target className="w-4 h-4" />
                </div>
                Ways of Working
              </button>
              
              <button
                onClick={() => setView("cone-locavia")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                  currentView === "cone-locavia" 
                    ? "bg-white border-emerald-500/20 text-emerald-600 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/5" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${currentView === "cone-locavia" ? "bg-emerald-500 text-white" : "bg-slate-200/50 text-slate-400"}`}>
                  <Users className="w-4 h-4" />
                </div>
                Cone Locavia
              </button>

              <button
                onClick={() => setView("reports")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                  currentView === "reports" 
                    ? "bg-white border-emerald-500/20 text-emerald-600 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/5" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${currentView === "reports" ? "bg-emerald-500 text-white" : "bg-slate-200/50 text-slate-400"}`}>
                  <Settings className="w-4 h-4" />
                </div>
                Reports e Materiais
              </button>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer Profile placeholder */}
      <div className="p-4 border-t border-slate-200 bg-white/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">
            {role}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter line-height-none">Usuário Ativo</span>
            <span className="text-xs font-bold text-slate-800 -mt-0.5">Torre Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
