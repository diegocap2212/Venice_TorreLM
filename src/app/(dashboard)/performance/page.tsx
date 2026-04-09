import { prisma } from "@/lib/prisma"
import { PerformanceDashboard } from "@/components/performance/performance-dashboard"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function PerformancePage() {
  const anoAtual = new Date().getFullYear()
  const mesAtual = new Date().getMonth() + 1
  const periodoAtual = mesAtual >= 10 ? `${anoAtual}-S2` : `${anoAtual}-S1`

  let colaboradores: any[] = []
  let ciclosPendentes: any[] = []

  try {
    const [cols, ciclos] = await Promise.all([
      prisma.colaborador.findMany({
        where: { status: "Ativo" },
        select: {
          id: true, nome: true, cargo: true, squad: true, torre: true,
          data_admissao: true,
          ciclos_performance: {
            where: { periodo: periodoAtual },
            orderBy: { data_prevista: "asc" }
          }
        },
        orderBy: { nome: "asc" }
      }),
      prisma.cicloPerformance.findMany({
        where: {
          status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
          periodo: periodoAtual
        },
        include: {
          colaborador: { select: { id: true, nome: true, cargo: true, squad: true } }
        },
        orderBy: { data_prevista: "asc" }
      })
    ])

    colaboradores = cols
    ciclosPendentes = ciclos
  } catch (err) {
    console.error("[performance] Prisma query failed", err)
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Ciclo de Performance</h2>
          <p className="text-sm text-slate-500 font-medium">
            {periodoAtual.endsWith("S1") ? "Período: Março a Maio" : "Período: Outubro a Dezembro"} · {anoAtual}
          </p>
        </div>
        <PerformanceDashboard
          colaboradores={colaboradores}
          ciclosPendentes={ciclosPendentes}
          periodoAtual={periodoAtual}
        />
      </div>
    </div>
  )
}
