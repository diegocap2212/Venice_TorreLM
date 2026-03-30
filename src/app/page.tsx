import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateVagaDialog } from "@/components/kanban/create-vaga-dialog";
import { WebView } from "@/components/shared/webview";
import { ColaboradoresTable } from "@/components/colaboradores/colaboradores-table";
import { MaterialList } from "@/components/reports/material-list";
import { HomeDashboard, DashboardData } from "@/components/dashboard/home-dashboard";
import { prisma } from "@/lib/prisma";

export default async function KanbanPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string; view?: string }> 
}) {
  const { tab, view = "home" } = await searchParams;

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

  // --- Processamento de Métricas para a Home Dashboard ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const totalAtivos = colaboradores.filter(c => c.status === "Ativo").length;

  const aniversariantes = colaboradores.filter(c => {
    if (!c.data_nascimento) return false;
    return new Date(c.data_nascimento).getMonth() === currentMonth;
  });

  const contratacoesMes = colaboradores.filter(c => {
    if (!c.data_admissao) return false;
    const admissionDate = new Date(c.data_admissao);
    return admissionDate.getMonth() === currentMonth && admissionDate.getFullYear() === currentYear;
  });

  const demissoesMes = colaboradores.filter(c => {
    if (!c.data_desligamento) return false;
    const demissionDate = new Date(c.data_desligamento);
    return demissionDate.getMonth() === currentMonth && demissionDate.getFullYear() === currentYear;
  });

  const homeData: DashboardData = {
    totalAtivos,
    aniversariantes,
    contratacoesMes,
    demissoesMes
  };
  // -------------------------------------------------------

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-auto transition-all duration-500 ease-in-out">
        {view === "home" ? (
          <HomeDashboard data={homeData} />
        ) : view === "pipeline" ? (
          <div className="p-10 min-h-full bg-[#f8fafc]/50">
            <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Pipeline de Contratações</h2>
                  <p className="text-sm text-slate-500 font-medium tracking-wide">Fluxo end-to-end de Recrutamento e Onboarding.</p>
                </div>
                <CreateVagaDialog />
              </div>

              <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
                {tab === "onboarding" ? (
                  /* Onboarding Column */
                  <section className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Onboarding Experience</h3>
                    </div>
                    <KanbanBoard initialVagas={onboardingVagas} initialTab="ONBOARDING" hideHeader={true} />
                  </section>
                ) : (
                  /* RH / Talent Column */
                  <section className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">RH / Talent Recruiting</h3>
                    </div>
                    <KanbanBoard initialVagas={rsVagas} initialTab="RECRUTAMENTO" hideHeader={true} />
                  </section>
                )}
              </div>
            </div>
          </div>
        ) : view === "colaboradores" ? (
          <div className="p-10 min-h-full bg-[#f8fafc]/50">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Equipe Torre LM</h2>
                <p className="text-sm text-slate-500 font-medium">Gestão centralizada de talentos e squads.</p>
              </div>
              <ColaboradoresTable initialData={colaboradores} />
            </div>
          </div>
        ) : view === "reports" ? (
          <div className="p-10 min-h-full bg-[#f8fafc]/50">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Repositório de Materiais</h2>
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
