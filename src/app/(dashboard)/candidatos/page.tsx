import { prisma } from "@/lib/prisma"
import { CandidatosList } from "@/components/candidatos/candidatos-list"

export const dynamic = "force-dynamic"

export default async function CandidatosPage() {
  let candidatos: any[] = []

  try {
    candidatos = await prisma.candidato.findMany({
      include: {
        vagas: {
          include: {
            vaga: { select: { id: true, titulo: true, etapa_atual: true, squad_destino: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    }) || []
  } catch (err) {
    console.error("[candidatos] Prisma query failed", err)
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Candidatos</h2>
          <p className="text-sm text-slate-500 font-medium">
            Banco de talentos em processo — CPF e dados pessoais protegidos por LGPD.
          </p>
        </div>
        <CandidatosList initialData={candidatos} />
      </div>
    </div>
  )
}
