"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateVagaEtapa(vagaId: string, novaEtapa: string) {
  try {
    const vaga = await prisma.vaga.findUnique({
      where: { id: vagaId },
    });

    if (!vaga) throw new Error("Vaga não encontrada");

    // Lógica simples de avanço para MVP
    // Futuramente aqui entrarão os Gates de Checklist e Briefing
    
    await prisma.vaga.update({
      where: { id: vagaId },
      data: {
        etapa_atual: novaEtapa,
        data_etapa_atual: new Date(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar etapa:", error);
    return { success: false, error: "Falha ao atualizar etapa" };
  }
}

export async function updateBriefing(vagaId: string, briefing: string) {
  try {
    await prisma.vaga.update({
      where: { id: vagaId },
      data: {
        briefing_handoff: briefing,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar briefing:", error);
    return { success: false };
  }
}
