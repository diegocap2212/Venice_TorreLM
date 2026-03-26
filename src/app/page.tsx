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

  let vagas: any[] = [];
  let colaboradores: any[] = [];
  let materials: any[] = [];

  try {
    vagas =
      (await prisma.vaga.findMany({
        include: { responsavel: true },
        orderBy: { data_etapa_atual: "desc" },
      })) || [];

    colaboradores =
      (await prisma.colaborador.findMany({
        orderBy: { nome: "asc" },
      })) || [];

    materials =
      (await prisma.material.findMany({
        orderBy: { data_upload: "desc" },
      })) || [];
  } catch (err) {
    console.error("[page] Prisma query failed, using empty data", err);
    vagas = [];
    colaboradores = [];
    materials = [];
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {view === "pipeline" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 px-6 pt-6 relative">
            <div className="absolute top-6 right-8 z-10">
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
        <div className="p-8 flex-1 overflow-auto bg-slate-50/10">
          <ColaboradoresTable initialData={colaboradores} />
        </div>
      ) : view === "reports" ? (
        <div className="p-8 flex-1 overflow-auto bg-slate-50/10">
          <MaterialList initialData={materials} />
        </div>
      ) : view === "ways-of-working" ? (
        <WebView url="https://portal-my-way.lovable.app" title="Venice | Ways of Working" />
      ) : (
        <WebView url="https://locavia-dashboard.vercel.app" title="Venice | Cone Locavia" />
      )}
    </div>
  );
}
