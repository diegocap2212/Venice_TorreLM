"use client";

import { Users, Cake, UserPlus, UserMinus, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";

export interface DashboardData {
  totalAtivos: number;
  aniversariantes: Array<{ id: string; nome: string; cargo: string; data_nascimento: Date }>;
  contratacoesMes: Array<{ id: string; nome: string; cargo: string; data_admissao: Date }>;
  demissoesMes: Array<{ id: string; nome: string; cargo: string; data_desligamento: Date }>;
}

interface DashboardProps {
  data: DashboardData;
}

export function HomeDashboard({ data }: DashboardProps) {
  const { totalAtivos, aniversariantes, contratacoesMes, demissoesMes } = data;

  return (
    <div className="p-10 min-h-full bg-background relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        
        {/* Header Title Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
              Visão Geral da Torre
            </h2>
          </div>
          <p className="text-sm text-foreground/50 font-medium pl-14">
            Acompanhamento em tempo real das métricas vitais e saúde organizacional.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* População Ativa */}
          <Card className="rounded-[24px] border-border/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/50">População Ativa</CardDescription>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-foreground tracking-tighter">{totalAtivos}</span>
                <span className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Colaboradores
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Aniversariantes do Mês */}
          <Card className="rounded-[24px] border-border/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/50">Aniversariantes (Mês)</CardDescription>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Cake className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-foreground tracking-tighter">{aniversariantes.length}</span>
                <span className="text-xs font-bold text-amber-600 mb-2">Celebrações</span>
              </div>
              {aniversariantes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2">Próximos:</p>
                  <div className="space-y-1">
                    {aniversariantes.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground/80 truncate">{a.nome}</span>
                        <span className="text-foreground/50 font-mono text-[10px]">
                          {new Date(a.data_nascimento).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contratações do Mês */}
          <Card className="rounded-[24px] border-border/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/50">Novas Admissões</CardDescription>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-foreground tracking-tighter">{contratacoesMes.length}</span>
                <span className="text-xs font-bold text-blue-600 mb-2">Neste mês</span>
              </div>
              {contratacoesMes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2">Recentes:</p>
                  <div className="space-y-1">
                    {contratacoesMes.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex flex-col text-xs">
                        <span className="font-semibold text-foreground/80 truncate">{a.nome}</span>
                        <span className="text-foreground/40 text-[9px] uppercase tracking-wider truncate">{a.cargo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Turnover (Demissões) */}
          <Card className="rounded-[24px] border-border/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] bg-white/60 backdrop-blur-xl relative overflow-hidden group hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-colors" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-black uppercase tracking-widest text-foreground/50">Turnover (Saídas)</CardDescription>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <UserMinus className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-foreground tracking-tighter">{demissoesMes.length}</span>
                <span className="text-xs font-bold text-rose-600 mb-2">Desligamentos</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Detailed Placeholder Section for specific insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-[32px] border-border/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.05)] bg-white/40 backdrop-blur-xl p-8 min-h-[300px] flex flex-col justify-center items-center text-center group hover:border-primary/50 transition-colors duration-500 cursor-default">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
               <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2">Saúde Organizacional</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              Módulo de Heatmap e Distribuição de Senioridade integrado com o Cone Locavia em desenvolvimento.
            </p>
          </Card>

          <Card className="rounded-[32px] border-border/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.05)] bg-white/40 backdrop-blur-xl p-8 min-h-[300px] flex flex-col justify-center items-center text-center group hover:border-primary/50 transition-colors duration-500 cursor-default">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
               <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2">Crescimento da Torre</h3>
            <p className="text-sm text-foreground/50 max-w-sm">
              Gráfico de progressão da taxa de crescimento base x volume de features em breve.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
