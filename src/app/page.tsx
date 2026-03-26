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

  const sampleColaboradores = [
    {
      id: "sample-1",
      nome: "Ana Souza",
      cargo: "Analista de RH",
      status: "Ativo",
      data_admissao: new Date().toISOString(),
      data_nascimento: new Date(1990, 5, 10).toISOString(),
      torre: "Venice",
      squad: "Growth",
      email: "ana.souza@example.com",
      informacoes_internas: "Foco em recrutamento técnico",
    },
    {
      id: "sample-2",
      nome: "Bruno Lima",
      cargo: "Talent Partner",
      status: "Ativo",
      data_admissao: new Date().toISOString(),
      data_nascimento: new Date(1988, 10, 3).toISOString(),
      torre: "Venice",
      squad: "TA",
      email: "bruno.lima@example.com",
      informacoes_internas: "Atende squads de produto",
    },
  ];

  if (colaboradores.length === 0) {
    colaboradores = sampleColaboradores;
  }

  const recrutamentoStages = [
    "REQUISICAO",
    "PREPARACAO",
    "TRIAGEM",
    "SHORTLIST",
    "ENTREVISTA_CLIENTE",
    "APROVACAO_PROPOSTA",
  ];

  const onboardingStages = [
    "CONTRATACAO",
    "ONB_ADMINISTRATIVO",
    "ONB_OPERACIONAL",
    "SEMANA_1",
    "MES_1_ALEM",
  ];

  const rsVagas = vagas.filter((v) => recrutamentoStages.includes(v.etapa_atual));
  const onboardingVagas = vagas.filter((v) => onboardingStages.includes(v.etapa_atual));

  return (
    <div className="h-full flex flex-col bg-white">
      {view === "pipeline" ? (
        <div className="flex-1 p-6 overflow-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-600">Pipeline de Contratações</h2>
            <CreateVagaDialog />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">RH / Talent</h3>
              <KanbanBoard initialVagas={rsVagas} initialTab="RECRUTAMENTO" hideHeader={true} />
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Onboarding</h3>
              <KanbanBoard initialVagas={onboardingVagas} initialTab="ONBOARDING" hideHeader={true} />
            </section>
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
