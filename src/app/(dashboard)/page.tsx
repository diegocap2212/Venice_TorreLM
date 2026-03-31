import { HomeDashboard, DashboardData } from "@/components/dashboard/home-dashboard";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  let colaboradores: any[] = [];

  try {
    colaboradores = await prisma.colaborador.findMany({
      orderBy: { nome: "asc" },
    }) || [];
  } catch (err) {
    console.error("[page] Prisma query failed, using empty data", err);
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
    },
  ];

  if (colaboradores.length === 0) {
    colaboradores = sampleColaboradores;
  }

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
        <HomeDashboard data={homeData} />
      </div>
    </div>
  );
}
