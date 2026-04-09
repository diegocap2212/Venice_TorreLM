"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { hashCPF, maskCPF, validateCPF } from "@/lib/cpf-utils"
import { auditLog } from "@/lib/audit"
import { auth } from "@/auth"

// ─── CRIAR CANDIDATO ─────────────────────────────────────────────────────────

interface CreateCandidatoInput {
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  linkedin?: string
  observacoes?: string
  vaga_id?: string // Vincula diretamente a uma vaga
}

export async function createCandidato(input: CreateCandidatoInput) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    let cpf_hash: string | undefined
    let cpf_masked: string | undefined

    if (input.cpf) {
      const cpfDigits = input.cpf.replace(/\D/g, "")
      if (!validateCPF(cpfDigits)) {
        return { error: "CPF inválido. Verifique os dígitos e tente novamente." }
      }

      // Verificar duplicidade pelo hash
      cpf_hash = hashCPF(cpfDigits)
      cpf_masked = maskCPF(cpfDigits)

      const existing = await prisma.candidato.findUnique({ where: { cpf_hash } })
      if (existing) {
        return { error: "Este CPF já está cadastrado no sistema." }
      }
    }

    const candidato = await prisma.candidato.create({
      data: {
        nome: input.nome,
        cpf_hash,
        cpf_masked,
        telefone: input.telefone,
        email: input.email,
        linkedin: input.linkedin,
        observacoes: input.observacoes,
        ...(input.vaga_id && {
          vagas: {
            create: { vaga_id: input.vaga_id }
          }
        })
      }
    })

    await auditLog("CREATE", "Candidato", candidato.id, `Candidato criado: ${candidato.nome}`)
    revalidatePath("/candidatos")
    revalidatePath("/pipeline")
    return { success: true, candidato }
  } catch (err) {
    console.error("[createCandidato]", err)
    return { error: "Erro ao criar candidato." }
  }
}

// ─── ATUALIZAR STATUS DO CPF ─────────────────────────────────────────────────

export async function updateStatusCPF(
  candidato_id: string,
  status: "PENDENTE" | "APROVADO" | "REPROVADO"
) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.candidato.update({
      where: { id: candidato_id },
      data: { status_cpf: status }
    })

    await auditLog("UPDATE", "Candidato.status_cpf", candidato_id, `Status CPF → ${status}`)
    revalidatePath("/candidatos")
    revalidatePath("/pipeline")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao atualizar status do CPF." }
  }
}

// ─── VINCULAR CANDIDATO A VAGA ────────────────────────────────────────────────

export async function vincularCandidatoVaga(candidato_id: string, vaga_id: string) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.vagaCandidato.upsert({
      where: { vaga_id_candidato_id: { vaga_id, candidato_id } },
      create: { vaga_id, candidato_id },
      update: {}
    })

    revalidatePath("/pipeline")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao vincular candidato à vaga." }
  }
}

// ─── ATUALIZAR STATUS DO CANDIDATO NA VAGA ───────────────────────────────────

export async function updateVagaCandidatoStatus(
  vaga_id: string,
  candidato_id: string,
  status: "EM_PROCESSO" | "APROVADO" | "REPROVADO" | "DESISTIU"
) {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await prisma.vagaCandidato.update({
      where: { vaga_id_candidato_id: { vaga_id, candidato_id } },
      data: { status }
    })

    await auditLog("UPDATE", "VagaCandidato.status", candidato_id, `Status vaga ${vaga_id} → ${status}`)
    revalidatePath("/pipeline")
    revalidatePath("/candidatos")
    return { success: true }
  } catch (err) {
    return { error: "Erro ao atualizar status do candidato." }
  }
}

// ─── LISTAR CANDIDATOS ────────────────────────────────────────────────────────

export async function getCandidatos(vaga_id?: string) {
  const session = await auth()
  if (!session) return []

  return prisma.candidato.findMany({
    where: vaga_id ? { vagas: { some: { vaga_id } } } : undefined,
    include: {
      vagas: {
        include: { vaga: { select: { id: true, titulo: true, etapa_atual: true } } }
      }
    },
    orderBy: { created_at: "desc" }
  })
}
