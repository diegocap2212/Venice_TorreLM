"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auditLog } from "@/lib/audit"
import { auth } from "@/auth"
import { addWeeks, addDays } from "date-fns"

// ─── CRIAR FOLLOW-UPS AUTOMÁTICOS AO ADMITIR COLABORADOR ────────────────────

export async function criarFollowUpsAdmissao(colaborador_id: string, data_admissao: Date) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    const followUps = [
      {
        colaborador_id,
        tipo: "SEMANA_1",
        data_prevista: addWeeks(data_admissao, 1),
        status: "PENDENTE"
      },
      {
        colaborador_id,
        tipo: "MES_1",
        data_prevista: addDays(data_admissao, 30),
        status: "PENDENTE"
      },
      {
        colaborador_id,
        tipo: "FEEDBACK_45",
        data_prevista: addDays(data_admissao, 45),
        status: "PENDENTE"
      },
      {
        colaborador_id,
        tipo: "FEEDBACK_90",
        data_prevista: addDays(data_admissao, 90),
        status: "PENDENTE"
      },
    ]

    await prisma.followUp.createMany({ data: followUps })
    await auditLog("CREATE", "FollowUp", colaborador_id, "Follow-ups de admissão criados automaticamente")
    revalidatePath("/pos-admissao")
    return { success: true }
  } catch (err) {
    console.error("[criarFollowUpsAdmissao]", err)
    return { error: "Erro ao criar follow-ups." }
  }
}

// ─── MARCAR FOLLOW-UP COMO REALIZADO ─────────────────────────────────────────

export async function marcarFollowUpRealizado(followup_id: string, notas?: string) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.followUp.update({
      where: { id: followup_id },
      data: {
        status: "REALIZADO",
        data_realizado: new Date(),
        notas
      }
    })

    await auditLog("UPDATE", "FollowUp", followup_id, "Follow-up marcado como realizado")
    revalidatePath("/pos-admissao")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao atualizar follow-up." }
  }
}

// ─── LISTAR FOLLOW-UPS PENDENTES ─────────────────────────────────────────────

export async function getFollowUpsPendentes() {
  const session = await auth()
  if (!session) return []

  return prisma.followUp.findMany({
    where: { status: "PENDENTE" },
    include: {
      colaborador: {
        select: { id: true, nome: true, cargo: true, squad: true, data_admissao: true, email: true }
      }
    },
    orderBy: { data_prevista: "asc" }
  })
}

// ─── MARCAR ONBOARDING ITEM COMO CONCLUÍDO (Checklist Setup) ─────────────────
// Estes itens são diferentes dos itens do kanban — são para o módulo Pós-Admissão
// e ficam armazenados em localStorage (não precisam de tabela separada por serem por colaborador)
// A lógica de persistência é coordenada pelo componente cliente.
