import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateVagaDialog } from "@/components/kanban/create-vaga-dialog";
import { WebView } from "@/components/shared/webview";
import { ColaboradoresTable } from "@/components/colaboradores/colaboradores-table";
import { MaterialList } from "@/components/reports/material-list";
import { prisma } from "@/lib/prisma";

export default async function KanbanPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string; view?: string }> 
}) {
  const { tab, view = "pipeline" } = await searchParams;
  
  // Fetch real data from SQLite with safety checks
  const vagas = await (prisma as any).vaga?.findMany({
    include: { responsavel: true },
    orderBy: { data_etapa_atual: "desc" },
  }) || [];

  const colaboradores = await (prisma as any).colaborador?.findMany({
    orderBy: { nome: "asc" },
  }) || [];

  const materials = await (prisma as any).material?.findMany({
    orderBy: { data_upload: "desc" },
  }) || [];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-auto transition-all duration-500 ease-in-out">
        {view === "pipeline" ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 px-8 pt-8 relative">
              <div className="absolute top-8 right-10 z-20">
                <CreateVagaDialog />
              </div>
              <KanbanBoard 
                initialVagas={vagas} 
                initialTab={tab === "onboarding" ? "ONBOARDING" : "RECRUTAMENTO"} 
                hideHeader={true}
              />
            </div>
          </div>
        ) : view === "colaboradores" ? (
          <div className="p-10 min-h-full bg-[#f8fafc]/50">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-800">Equipe Torre LM</h2>
                <p className="text-sm text-slate-500 font-medium">Gestão centralizada de talentos e squads.</p>
              </div>
              <ColaboradoresTable initialData={colaboradores} />
            </div>
          </div>
        ) : view === "reports" ? (
          <div className="p-10 min-h-full bg-[#f8fafc]/50">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-800">Repositório de Materiais</h2>
                <p className="text-sm text-slate-500 font-medium">Acesso rápido a documentos e apresentações oficiais.</p>
              </div>
              <MaterialList initialData={materials} />
            </div>
          </div>
        ) : view === "ways-of-working" ? (
          <div className="h-full animate-in fade-in duration-500">
            <WebView url="https://portal-my-way.lovable.app" title="Venice | Ways of Working" />
          </div>
        ) : (
          <div className="h-full animate-in fade-in duration-500">
            <WebView url="https://locavia-dashboard.vercel.app" title="Venice | Cone Locavia" />
          </div>
        )}
      </div>
    </div>
  );
}
