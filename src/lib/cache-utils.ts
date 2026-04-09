import { prisma } from "@/lib/prisma";

export const getCachedDashboardData = async (firstDay: Date, lastDay: Date) => {
  const today = new Date();
  const currentMonth = today.getMonth();

  const [
    totalAtivos,
    aniversariantesRaw,
    contratacoesMes,
    demissoesMes,
    vagasData,
    allAtivosSquads
  ] = await Promise.all([
    prisma.colaborador.count({ where: { status: "Ativo" } }),
    
    prisma.colaborador.findMany({
      where: { status: "Ativo" },
      select: { id: true, nome: true, cargo: true, data_nascimento: true }
    }),

    prisma.colaborador.findMany({
      where: {
        data_admissao: { gte: firstDay, lte: lastDay }
      },
      select: { id: true, nome: true, cargo: true, data_admissao: true }
    }),

    prisma.colaborador.findMany({
      where: {
        data_desligamento: { gte: firstDay, lte: lastDay }
      },
      select: { id: true, nome: true, cargo: true, data_desligamento: true }
    }),

    prisma.vaga.findMany({
      select: { etapa_atual: true }
    }),

    prisma.colaborador.findMany({
      where: { status: "Ativo" },
      select: { squad: true }
    })
  ]);

  return {
    totalAtivos,
    aniversariantesRaw,
    contratacoesMes,
    demissoesMes,
    vagasData,
    allAtivosSquads
  };
};
