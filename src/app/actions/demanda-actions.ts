"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getDemandas() {
  return prisma.demanda.findMany({
    include: { responsavel: true, criado_por: true },
    orderBy: { data_criacao: "desc" },
  });
}

export async function createDemanda(data: {
  titulo: string;
  tipo?: string;
  prioridade?: string;
  squad?: string;
  descricao?: string;
  data_prevista?: string;
  tags?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Não autenticado" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { success: false, error: "Usuário não encontrado no sistema" };

  try {
    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const demanda = await prisma.demanda.create({
      data: {
        titulo: data.titulo,
        tipo: data.tipo || "INICIATIVA",
        prioridade: data.prioridade || "NORMAL",
        squad: data.squad || null,
        descricao: data.descricao || null,
        data_prevista: data.data_prevista ? new Date(data.data_prevista) : null,
        tags,
        criado_por_id: dbUser.id,
        responsavel_id: dbUser.id,
      },
      include: { responsavel: true, criado_por: true },
    });

    revalidatePath("/demandas");
    return { success: true, demanda };
  } catch (error) {
    console.error("[createDemanda]", error);
    return { success: false, error: "Erro ao criar demanda" };
  }
}

export async function updateDemanda(
  id: string,
  data: {
    titulo?: string;
    descricao?: string;
    tipo?: string;
    prioridade?: string;
    squad?: string;
    data_prevista?: string | null;
    tags?: string;
    responsavel_id?: string | null;
  }
) {
  try {
    const tags =
      data.tags !== undefined
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined;

    await prisma.demanda.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.prioridade !== undefined && { prioridade: data.prioridade }),
        ...(data.squad !== undefined && { squad: data.squad }),
        ...(data.data_prevista !== undefined && {
          data_prevista: data.data_prevista ? new Date(data.data_prevista) : null,
        }),
        ...(tags !== undefined && { tags }),
        ...(data.responsavel_id !== undefined && {
          responsavel_id: data.responsavel_id,
        }),
      },
    });

    revalidatePath("/demandas");
    return { success: true };
  } catch (error) {
    console.error("[updateDemanda]", error);
    return { success: false, error: "Erro ao atualizar demanda" };
  }
}

export async function updateDemandaEtapa(id: string, etapa: string) {
  try {
    await prisma.demanda.update({
      where: { id },
      data: { etapa },
    });

    revalidatePath("/demandas");
    return { success: true };
  } catch (error) {
    console.error("[updateDemandaEtapa]", error);
    return { success: false, error: "Erro ao mover demanda" };
  }
}

export async function toggleBloqueio(
  id: string,
  bloqueada: boolean,
  motivo?: string
) {
  try {
    await prisma.demanda.update({
      where: { id },
      data: {
        bloqueada,
        motivo_bloqueio: bloqueada ? (motivo || null) : null,
      },
    });

    revalidatePath("/demandas");
    return { success: true };
  } catch (error) {
    console.error("[toggleBloqueio]", error);
    return { success: false, error: "Erro ao atualizar bloqueio" };
  }
}

export async function deleteDemanda(id: string) {
  try {
    await prisma.demanda.delete({ where: { id } });
    revalidatePath("/demandas");
    return { success: true };
  } catch (error) {
    console.error("[deleteDemanda]", error);
    return { success: false, error: "Erro ao excluir demanda" };
  }
}
