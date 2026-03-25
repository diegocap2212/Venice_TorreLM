import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateVagaDialog } from "@/components/kanban/create-vaga-dialog";

export default async function KanbanPage() {
  // Fetch real data from SQLite
  const vagas = await prisma.vaga.findMany({
    include: {
      responsavel: true,
    },
    orderBy: {
      data_etapa_atual: "desc",
    },
  });

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pipeline de Processos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe o Hand-off e os SLAs das vagas ativas da Torre LM.
          </p>
        </div>
        <CreateVagaDialog />
      </div>
      
      <KanbanBoard initialVagas={vagas} />
    </div>
  );
}
