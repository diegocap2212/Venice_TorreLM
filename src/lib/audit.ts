import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { headers } from "next/headers"

type AuditAction = "CREATE" | "READ" | "UPDATE" | "DELETE"

/**
 * Registra uma operação sobre dados sensíveis no AuditLog LGPD.
 * Deve ser chamado em toda Server Action que toca Candidato, CPF, FollowUp, CicloPerformance.
 */
export async function auditLog(
  acao: AuditAction,
  recurso: string,
  recurso_id?: string,
  detalhes?: string
) {
  try {
    const session = await auth()
    const userEmail = session?.user?.email ?? "anonymous"

    // Tentar obter IP do cabeçalho (best-effort)
    const headersList = await headers()
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
      headersList.get("x-real-ip") ??
      "unknown"

    await prisma.auditLog.create({
      data: {
        user_email: userEmail,
        acao,
        recurso,
        recurso_id,
        detalhes,
        ip,
      },
    })
  } catch (err) {
    // Audit log nunca deve quebrar a operação principal
    console.error("[AuditLog] Falha ao gravar log:", err)
  }
}
