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
  Sparkles
} from "lucide-react";
import { useRole } from "@/components/providers/role-provider";
import { useState, useEffect } from "react";

export function Sidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useRole();

  const currentTab = searchParams.get("tab") || "recrutamento";
  const currentView = searchParams.get("view") || "pipeline";
  const [pipelineOpen, setPipelineOpen] = useState(currentView === "pipeline");

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
    <aside className="w-72 bg-[#f8fafc] border-r border-[#e2e8f0] flex flex-col h-screen overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="h-24 flex flex-col justify-center px-8 border-b border-[#e2e8f0] bg-white relative group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black tracking-tighter text-slate-800 text-base uppercase leading-none">
              Venice
            </h1>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Torre LM</span>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-6 pb-24 px-4 space-y-1">


        {/* Pipeline & Onboarding Group */}
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
                <LayoutDashboard className="w-4 h-4" />
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

        {/* Governance Sections */}


        <button
          onClick={() => setView("colaboradores")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
            currentView === "colaboradores" 
              ? "bg-white text-emerald-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors duration-300 ${currentView === "colaboradores" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">Colaboradores</span>
        </button>

        <button
          onClick={() => setView("ways-of-working")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
            currentView === "ways-of-working" 
              ? "bg-white text-emerald-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors duration-300 ${currentView === "ways-of-working" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
            <Target className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">Ways of Working</span>
        </button>

        <button
          onClick={() => setView("cone-locavia")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
            currentView === "cone-locavia" 
              ? "bg-white text-emerald-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors duration-300 ${currentView === "cone-locavia" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">Cone Locavia</span>
        </button>

        <button
          onClick={() => setView("reports")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
            currentView === "reports" 
              ? "bg-white text-emerald-700 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100" 
              : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors duration-300 ${currentView === "reports" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">Repositório</span>
        </button>
      </div>
      
      {/* Footer Profile */}
      <div className="absolute bottom-0 w-72 p-6 border-t border-[#e2e8f0] bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all duration-300 cursor-pointer hover:border-emerald-200 group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-700 text-xs font-black border border-emerald-100 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              {role.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter line-height-none">Role Atribuída</span>
              <span className="text-xs font-black text-slate-800 -mt-0.5">{role === "BP" ? "Business Partner" : "Administrador"}</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400 opacity-20 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </div>
    </aside>
  );
}
