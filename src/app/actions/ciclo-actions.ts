"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auditLog } from "@/lib/audit"
import { auth } from "@/auth"

// ─── CRIAR CICLO DE PERFORMANCE ───────────────────────────────────────────────

export async function criarCicloPeriodo(
  colaborador_id: string,
  periodo: string // "2026-S1"
) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    const dataBase = periodo.endsWith("S1")
      ? new Date(`${periodo.substring(0, 4)}-03-01`)
      : new Date(`${periodo.substring(0, 4)}-10-01`)

    const ciclos = [
      {
        colaborador_id, periodo, tipo: "AUTOAVALIACAO", responsavel: "BP",
        data_prevista: dataBase, status: "PENDENTE"
      },
      {
        colaborador_id, periodo, tipo: "FEEDBACK_CLIENTE", responsavel: "GESTOR_CONTAS",
        data_prevista: new Date(dataBase.getTime() + 45 * 24 * 60 * 60 * 1000), status: "PENDENTE"
      },
      {
        colaborador_id, periodo, tipo: "PDI", responsavel: "BP",
        data_prevista: new Date(dataBase.getTime() + 60 * 24 * 60 * 60 * 1000), status: "PENDENTE"
      },
    ]

    await prisma.cicloPerformance.createMany({ data: ciclos })
    await auditLog("CREATE", "CicloPerformance", colaborador_id, `Ciclo ${periodo} criado`)
    revalidatePath("/performance")
    return { success: true }
  } catch (err) {
    console.error("[criarCicloPeriodo]", err)
    return { error: "Erro ao criar ciclo." }
  }
}

// ─── ATUALIZAR STATUS DO CICLO ────────────────────────────────────────────────

export async function atualizarCicloStatus(
  ciclo_id: string,
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO",
  conteudo?: object
) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.cicloPerformance.update({
      where: { id: ciclo_id },
      data: {
        status,
        conteudo: conteudo as any,
        data_realizado: status === "CONCLUIDO" ? new Date() : undefined
      }
    })

    await auditLog("UPDATE", "CicloPerformance", ciclo_id, `Status → ${status}`)
    revalidatePath("/performance")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao atualizar ciclo." }
  }
}

// ─── LISTAR CICLOS POR COLABORADOR ────────────────────────────────────────────

export async function getCiclosColaborador(colaborador_id: string) {
  const session = await auth()
  if (!session) return []

  return prisma.cicloPerformance.findMany({
    where: { colaborador_id },
    orderBy: [{ periodo: "desc" }, { data_prevista: "asc" }]
  })
}

// ─── LISTAR TODOS OS CICLOS PENDENTES ─────────────────────────────────────────

export async function getCiclosPendentes(periodo?: string) {
  const session = await auth()
  if (!session) return []

  return prisma.cicloPerformance.findMany({
    where: {
      status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
      ...(periodo && { periodo })
    },
    include: {
      colaborador: {
        select: { id: true, nome: true, cargo: true, squad: true }
      }
    },
    orderBy: { data_prevista: "asc" }
  })
}
