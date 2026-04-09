import { prisma } from "@/lib/prisma";

export const getCachedDashboardData = async (firstDay: Date, lastDay: Date) => {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [
    totalAtivos,
    aniversariantesRaw,
    contratacoesMes,
    demissoesMes,
    vagasData,
    allAtivosSquads,
    headcountPorTorreRaw,
    totalHorasExtrasRaw,
    followupsPendentes
  ] = await Promise.all([
    // População Ativa (Ativo + Férias)
    prisma.colaborador.count({ 
      where: { 
        status: { in: ["Ativo", "Férias"] } 
      } 
    }),
    
    prisma.colaborador.findMany({
      where: { status: { in: ["Ativo", "Férias"] } },
      select: { id: true, nome: true, cargo: true, data_nascimento: true }
    }),

    prisma.colaborador.findMany({
      where: { data_admissao: { gte: firstDay, lte: lastDay } },
      select: { id: true, nome: true, cargo: true, data_admissao: true }
    }),

    prisma.colaborador.findMany({
      where: { data_desligamento: { gte: firstDay, lte: lastDay } },
      select: { id: true, nome: true, cargo: true, data_desligamento: true }
    }),

    prisma.vaga.findMany({
      select: { etapa_atual: true }
    }),

    prisma.colaborador.findMany({
      where: { status: { in: ["Ativo", "Férias"] } },
      select: { squad: true }
    }),

    // NOVO: Headcount por Torre
    prisma.colaborador.groupBy({
      by: ["torre"],
      where: { status: { in: ["Ativo", "Férias"] } },
      _count: { _all: true }
    }),

    // NOVO: Horas Extras do Mês
    prisma.horaExtra.aggregate({
      where: { mes_referencia: currentMonthStr },
      _sum: { horas: true }
    }),

    // NOVO: Follow-ups Pendentes
    prisma.followUp.count({
      where: { status: "PENDENTE" }
    })
  ]);

  const headcountPorTorre = headcountPorTorreRaw.map(t => ({
    torre: t.torre || "Outros",
    count: t._count._all
  })).sort((a, b) => b.count - a.count);

  const totalHorasExtras = totalHorasExtrasRaw._sum.horas || 0;

  return {
    totalAtivos,
    aniversariantesRaw,
    contratacoesMes,
    demissoesMes,
    vagasData,
    allAtivosSquads,
    headcountPorTorre,
    totalHorasExtras,
    followupsPendentes
  };
};
