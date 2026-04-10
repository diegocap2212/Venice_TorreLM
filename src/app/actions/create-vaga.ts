"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createVaga(formData: any) {
  const session = await auth();
  if (!session) return { success: false, error: "Não autenticado" };

  try {
    // Para o MVP, pegamos o primeiro usuário BP como criador/responsável padrão
    const bp = await prisma.user.findFirst({ where: { role: "BP" } });
    if (!bp) throw new Error("Nenhum usuário BP encontrado");

    await prisma.vaga.create({
      data: {
        titulo: formData.titulo,
        perfil_tipo: formData.perfil_tipo,
        senioridade: formData.senioridade,
        squad_destino: formData.squad_destino,
        urgencia: formData.urgencia,
        responsavel_id: bp.id,
        criado_por_id: bp.id,
        sla_dias: formData.sla_dias || 3,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar vaga:", error);
    return { success: false };
  }
}
