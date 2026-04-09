"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// ─── LANÇAR / ATUALIZAR HORA EXTRA ────────────────────────────────────────────

export async function upsertHoraExtra(
  colaborador_id: string,
  mes_referencia: string, // "2026-04"
  horas: number,
  observacao?: string
) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  if (horas < 0 || horas > 300) {
    return { error: "Valor de horas inválido." }
  }

  try {
    await prisma.horaExtra.upsert({
      where: { colaborador_id_mes_referencia: { colaborador_id, mes_referencia } },
      create: { colaborador_id, mes_referencia, horas, observacao, status: "PENDENTE" },
      update: { horas, observacao }
    })

    revalidatePath("/pos-admissao")
    return { success: true }
  } catch (err) {
    console.error("[upsertHoraExtra]", err)
    return { error: "Erro ao lançar hora extra." }
  }
}

// ─── VALIDAR HORA EXTRA ────────────────────────────────────────────────────────

export async function validarHoraExtra(id: string) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.horaExtra.update({
      where: { id },
      data: { status: "VALIDADO" }
    })
    revalidatePath("/pos-admissao")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao validar hora extra." }
  }
}

// ─── MARCAR COMO ENVIADO AO FINANCEIRO ───────────────────────────────────────

export async function marcarHoraExtraEnviada(id: string) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.horaExtra.update({
      where: { id },
      data: { status: "ENVIADO" }
    })
    revalidatePath("/pos-admissao")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao marcar como enviado." }
  }
}

// ─── LISTAR HORAS EXTRAS POR MÊS ──────────────────────────────────────────────

export async function getHorasExtrasMes(mes_referencia: string) {
  const session = await auth()
  if (!session) return []

  return prisma.horaExtra.findMany({
    where: { mes_referencia },
    include: {
      colaborador: {
        select: { id: true, nome: true, cargo: true, squad: true, email: true }
      }
    },
    orderBy: { colaborador: { nome: "asc" } }
  })
}
