import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateVagaDialog } from "@/components/kanban/create-vaga-dialog";
import { WebView } from "@/components/shared/webview";
import { ColaboradoresTable } from "@/components/colaboradores/colaboradores-table";
import { MaterialList } from "@/components/reports/material-list";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import SQLite from "better-sqlite3";

const db = new SQLite("prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

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
