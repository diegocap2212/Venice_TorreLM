"use client";

import { 
  Users, Cake, UserPlus, UserMinus, TrendingUp, Activity, Briefcase, BarChart2, LayoutDashboard 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { TutorialPanel } from "@/components/dashboard/tutorial-panel";

export interface DashboardData {
  totalAtivos: number;
  aniversariantes: Array<{ id: string; nome: string; cargo: string; data_nascimento: Date }>;
  contratacoesMes: Array<{ id: string; nome: string; cargo: string; data_admissao: Date }>;
  demissoesMes: Array<{ id: string; nome: string; cargo: string; data_desligamento: Date }>;
  vagasRecrutamento?: number;
  vagasOnboarding?: number;
  headcountPorSquad?: Array<{squad: string; count: number}>;
  headcountPorTorre?: Array<{torre: string; count: number}>;
  totalHorasExtras?: number;
  followupsPendentes?: number;
}

interface DashboardProps {
  data: DashboardData;
}

export function HomeDashboard({ data }: DashboardProps) {
  const { 
    totalAtivos, 
    aniversariantes, 
    contratacoesMes, 
    demissoesMes, 
    vagasRecrutamento, 
    vagasOnboarding, 
    headcountPorSquad,
    headcountPorTorre,
    totalHorasExtras,
    followupsPendentes
  } = data;

  return (
    <div className="p-10 min-h-full bg-background relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-inner">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                Radar de Gestão <span className="text-primary">Torre LM</span>
              </h2>
            </div>
            <p className="text-sm text-foreground/50 font-medium pl-14">
              Monitoramento centralizado de performance, pessoas e governança Venice.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-border/40 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Sincronizado via SharePoint</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* População Ativa */}
          <Card className="rounded-[32px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] transition-all duration-700 border-t-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/40">Headcount Ativo</CardDescription>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shadow-sm group-hover:rotate-12 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-foreground tracking-tighter">{totalAtivos}</span>
                <div className="mb-2">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                    <TrendingUp className="w-3 h-3" /> Atualizado
                  </div>
                  <div className="text-[9px] text-foreground/30 font-bold uppercase">Base de Prestadores</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saúde de Governança (Horas Extras) */}
          <Card className="rounded-[32px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] transition-all duration-700">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/40">Horas Extras (Mês)</CardDescription>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shadow-sm">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-foreground tracking-tighter">{totalHorasExtras}</span>
                <div className="mb-2">
                  <div className={`text-[10px] font-bold uppercase tracking-tight ${totalHorasExtras && totalHorasExtras > 100 ? 'text-rose-600' : 'text-amber-600'}`}>
                    Total Horas
                  </div>
                  <div className="text-[9px] text-foreground/30 font-bold uppercase">Registradas no período</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-ups Pendentes */}
          <Card className="rounded-[32px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] transition-all duration-700">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/40">Follow-ups Pendentes</CardDescription>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shadow-sm">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-foreground tracking-tighter">{followupsPendentes}</span>
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                    Agendados
                  </div>
                  <div className="text-[9px] text-foreground/30 font-bold uppercase">Próximas ações de BP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Turnover Mensal (Misto) */}
          <Card className="rounded-[32px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_30px_60px_-12_rgba(0,0,0,0.12)] transition-all duration-700">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/40">Turnover (Mês)</CardDescription>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shadow-sm">
                  <UserMinus className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between w-full">
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-foreground tracking-tighter">{demissoesMes.length}</span>
                  <div className="mb-2 uppercase text-[9px] font-black text-foreground/30 leading-tight">Saídas<br/>no mês</div>
                </div>
                <div className="flex flex-col items-end gap-1 mb-1">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black">
                      <UserPlus className="w-3 h-3" /> {contratacoesMes.length} Entradas
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Dashboard Panels Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Distribuição por Torre - Left 7 columns */}
          <Card className="lg:col-span-12 xl:col-span-8 rounded-[40px] border-border/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/60 backdrop-blur-xl p-10 group hover:border-primary/30 transition-all duration-1000">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-foreground text-primary flex items-center justify-center shadow-lg">
                  <BarChart2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-wider">Força de Trabalho por Torre</h3>
                  <p className="text-sm text-foreground/40 font-medium">Headcount distribuído por unidade de operação.</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Métrica Exclusiva Venice</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {headcountPorTorre?.map((t, i) => {
                const percentage = (t.count / totalAtivos) * 100;
                return (
                  <div key={i} className="space-y-3 group/item">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-foreground/80 lowercase tracking-widest">{t.torre}</span>
                        <div className="h-[1px] w-8 bg-border group-hover/item:w-12 transition-all" />
                      </div>
                      <span className="text-sm font-black text-foreground">{t.count} <span className="text-[10px] text-foreground/30 ml-1">({percentage.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                      <div 
                        className="h-full bg-foreground rounded-full transition-all duration-1000 ease-out shadow-[0_2px_10px_rgba(0,0,0,0.1)]" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pipeline & Squads - Right 4 columns */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            {/* Top Squads */}
            <Card className="rounded-[40px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl p-8 group">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Briefcase className="w-5 h-5" />
                 </div>
                 <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Headcount por Squad</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {(headcountPorSquad || []).slice(0, 6).map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:scale-[1.02]">
                    <span className="text-xs font-bold text-slate-700">{s.squad}</span>
                    <span className="text-sm font-black text-blue-600">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline Recap */}
            <Card className="rounded-[40px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] bg-foreground p-8 text-primary overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary text-foreground">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Pipeline de Talentos</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-3xl font-black">{vagasRecrutamento}</span>
                      <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Em Seleção</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-3xl font-black">{vagasOnboarding}</span>
                      <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Em Onboarding</p>
                    </div>
                 </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Celebrations & Followups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
           <Card className="rounded-[40px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] bg-white/60 backdrop-blur-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Cake className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Aniversariantes do Mês</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aniversariantes.length > 0 ? aniversariantes.slice(0, 4).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">{a.nome.charAt(0)}</div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-slate-800 truncate">{a.nome}</span>
                      <span className="text-[10px] font-medium text-slate-400">Dia {new Date(a.data_nascimento).getDate()}</span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-6 text-sm text-slate-400 font-medium italic">Nenhum aniversariante previsto para este mês.</div>
                )}
              </div>
           </Card>

           <Card className="rounded-[40px] border-border/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] bg-white/60 backdrop-blur-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Equipe por Área (Consolidado)</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {headcountPorTorre?.map((t, i) => (
                  <div key={i} className="px-4 py-2 bg-white rounded-full border border-border/40 text-[10px] font-black uppercase tracking-wider text-foreground/60 shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {t.torre} <span className="text-foreground ml-1">{t.count}</span>
                  </div>
                ))}
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
}

// Sub-components as icons/placeholders
function ClipboardList(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  );
}
