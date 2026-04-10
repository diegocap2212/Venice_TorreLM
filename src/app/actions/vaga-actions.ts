"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateVagaEtapa(vagaId: string, novaEtapa: string) {
  const session = await auth()
  if (!session) return { success: false, error: "Não autenticado" }

  try {
    const vaga = await prisma.vaga.findUnique({ where: { id: vagaId } })
    if (!vaga) throw new Error("Vaga não encontrada")

    await prisma.vaga.update({
      where: { id: vagaId },
      data: {
        etapa_atual: novaEtapa,
        data_etapa_atual: new Date(),
      },
    })

    revalidatePath("/pipeline")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar etapa:", error)
    return { success: false, error: "Falha ao atualizar etapa" }
  }
}

export async function updateBriefing(vagaId: string, briefing: string) {
  const session = await auth()
  if (!session) return { success: false, error: "Não autenticado" }

  try {
    await prisma.vaga.update({
      where: { id: vagaId },
      data: { briefing_handoff: briefing },
    })
    revalidatePath("/pipeline")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar briefing:", error)
    return { success: false }
  }
}

export async function updateBizneoLink(vagaId: string, bizneoLink: string) {
  const session = await auth()
  if (!session) return { success: false, error: "Não autenticado" }

  try {
    await prisma.vaga.update({
      where: { id: vagaId },
      data: { bizneo_link: bizneoLink },
    })
    revalidatePath("/pipeline")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar link Bizneo:", error)
    return { success: false }
  }
}

// ─── CHECKLIST PERSISTIDO ────────────────────────────────────────────────────

export async function toggleChecklistItem(
  vaga_id: string,
  etapa: string,
  item_index: number,
  concluido: boolean
) {
  const session = await auth()
  if (!session) return { success: false, error: "Não autenticado" }

  try {
    await prisma.checklistItemStatus.upsert({
      where: { vaga_id_etapa_item_index: { vaga_id, etapa, item_index } },
      create: { vaga_id, etapa, item_index, concluido },
      update: { concluido }
    })
    revalidatePath("/pipeline")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar checklist:", error)
    return { success: false }
  }
}

export async function getChecklistStatus(vaga_id: string, etapa: string) {
  const session = await auth()
  if (!session) return {}

  try {
    const items = await prisma.checklistItemStatus.findMany({
      where: { vaga_id, etapa }
    })
    return items.reduce((acc, item) => {
      acc[item.item_index] = item.concluido
      return acc
    }, {} as Record<number, boolean>)
  } catch {
    return {}
  }
}
