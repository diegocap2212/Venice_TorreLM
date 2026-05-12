"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getMapaSquads() {
  const [colaboradores, metadados] = await Promise.all([
    prisma.colaborador.findMany({
      where: { squad: { not: null }, status: "Ativo" },
      select: { id: true, nome: true, cargo: true, torre: true, squad: true },
      orderBy: { nome: "asc" },
    }),
    prisma.squadMetadata.findMany(),
  ])

  const metaMap = new Map(metadados.map((m) => [m.squad, m]))

  const squadMap = new Map<
    string,
    {
      squad: string
      torre: string | null
      membros: typeof colaboradores
      metadata: (typeof metadados)[0] | null
    }
  >()

  // Popula squads a partir dos colaboradores
  for (const col of colaboradores) {
    const key = col.squad!
    if (!squadMap.has(key)) {
      squadMap.set(key, {
        squad: key,
        torre: col.torre ?? null,
        membros: [],
        metadata: metaMap.get(key) ?? null,
      })
    }
    squadMap.get(key)!.membros.push(col)
  }

  // Inclui squads do metadata que ainda não têm colaboradores (ex: GOL, JETTA, OPTIMUS…)
  for (const meta of metadados) {
    if (!squadMap.has(meta.squad)) {
      squadMap.set(meta.squad, {
        squad: meta.squad,
        torre: meta.torre ?? null,
        membros: [],
        metadata: meta,
      })
    }
  }

  return Array.from(squadMap.values()).sort(
    (a, b) =>
      (a.torre ?? "").localeCompare(b.torre ?? "") ||
      a.squad.localeCompare(b.squad)
  )
}

export async function upsertSquadMetadata(data: {
  squad: string
  torre?: string
  objetivo?: string
  ponto_focal?: string
  stack?: string
  cerimonias?: string
  acessos?: string
  saude?: string
  notas_sdm?: string
}) {
  const session = await auth()
  if (!session?.user?.email) return { success: false, error: "Não autenticado" }

  try {
    await prisma.squadMetadata.upsert({
      where: { squad: data.squad },
      create: { ...data, saude: data.saude ?? "BOA" },
      update: { ...data },
    })
    revalidatePath("/mapa-squads")
    return { success: true }
  } catch (error) {
    console.error("[upsertSquadMetadata]", error)
    return { success: false, error: "Erro ao salvar metadados do squad" }
  }
}
