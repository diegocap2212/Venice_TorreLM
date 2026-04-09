import { prisma } from "@/lib/prisma"
import { PosAdmissaoDashboard } from "@/components/pos-admissao/pos-admissao-dashboard"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function PosAdmissaoPage() {
  const mesAtual = format(new Date(), "yyyy-MM")

  let colaboradoresAtivos: any[] = []
  let followUpsPendentes: any[] = []
  let horasExtrasMes: any[] = []

  try {
    const [colaboradores, followUps, horasExtras] = await Promise.all([
      prisma.colaborador.findMany({
        where: { status: "Ativo" },
        select: {
          id: true, nome: true, cargo: true, squad: true, email: true,
          data_admissao: true,
          follow_ups: { orderBy: { data_prevista: "asc" } },
          horas_extras: { where: { mes_referencia: mesAtual } }
        },
        orderBy: { data_admissao: "desc" }
      }),
      prisma.followUp.findMany({
        where: { status: "PENDENTE" },
        include: {
          colaborador: { select: { id: true, nome: true, cargo: true, squad: true, data_admissao: true } }
        },
        orderBy: { data_prevista: "asc" },
        take: 20
      }),
      prisma.horaExtra.findMany({
        where: { mes_referencia: mesAtual },
        include: {
          colaborador: { select: { id: true, nome: true, cargo: true, squad: true } }
        },
        orderBy: { colaborador: { nome: "asc" } }
      })
    ])

    colaboradoresAtivos = colaboradores
    followUpsPendentes = followUps
    horasExtrasMes = horasExtras
  } catch (err) {
    console.error("[pos-admissao] Prisma query failed", err)
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Pós-Admissão</h2>
          <p className="text-sm text-slate-500 font-medium">
            Acompanhamento de onboarding, follow-ups e horas extras dos colaboradores ativos.
          </p>
        </div>
        <PosAdmissaoDashboard
          colaboradores={colaboradoresAtivos}
          followUpsPendentes={followUpsPendentes}
          horasExtrasMes={horasExtrasMes}
          mesAtual={mesAtual}
        />
      </div>
    </div>
  )
}
