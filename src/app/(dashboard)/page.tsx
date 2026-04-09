import { HomeDashboard } from "@/components/dashboard/home-dashboard";
import { getCachedDashboardData } from "@/lib/cache-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let dashboardResults: any = {
    totalAtivos: 0,
    aniversariantes: [],
    contratacoesMes: [],
    demissoesMes: [],
    vagasRecrutamento: 0,
    vagasOnboarding: 0,
    headcountPorSquad: []
  };

  try {
    const {
      totalAtivos,
      aniversariantesRaw,
      contratacoesMes,
      demissoesMes,
      vagasData,
      allAtivosSquads
    } = await getCachedDashboardData(firstDayOfMonth, lastDayOfMonth);

    // Processamento leve em memória para filtros complexos
    const currentMonth = today.getMonth();
    const aniversariantes = aniversariantesRaw.filter((c: any) => 
      c.data_nascimento && new Date(c.data_nascimento).getMonth() === currentMonth
    );

    const recrutamentoStages = ["REQUISICAO", "PREPARACAO", "TRIAGEM", "SHORTLIST", "ENTREVISTA_CLIENTE", "APROVACAO_PROPOSTA"];
    const onboardingStages = ["CONTRATACAO", "ONB_ADMINISTRATIVO", "ONB_OPERACIONAL", "SEMANA_1", "MES_1_ALEM"];

    const vagasRecrutamento = vagasData.filter(v => recrutamentoStages.includes(v.etapa_atual)).length;
    const vagasOnboarding = vagasData.filter(v => onboardingStages.includes(v.etapa_atual)).length;

    // Headcount por Squad (Desta vez processando apenas o campo 'squad')
    const squadCounts: Record<string, number> = {};
    allAtivosSquads.forEach(c => {
      if (c.squad) squadCounts[c.squad] = (squadCounts[c.squad] || 0) + 1;
    });

    const headcountPorSquad = Object.entries(squadCounts)
      .map(([squad, count]) => ({ squad, count }))
      .sort((a, b) => b.count - a.count);

    dashboardResults = {
      totalAtivos,
      aniversariantes,
      contratacoesMes,
      demissoesMes,
      vagasRecrutamento,
      vagasOnboarding,
      headcountPorSquad
    };

  } catch (err) {
    console.error("[page] Dashboard optimization failed", err);
  }
  // -------------------------------------------------------

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-auto transition-all duration-500 ease-in-out">
        {/* @ts-ignore */}
        <HomeDashboard data={dashboardResults} />
      </div>
    </div>
  );
}
