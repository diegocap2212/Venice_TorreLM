import { DemandaBoard } from "@/components/demandas/demanda-board";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DemandasPage() {
  let demandas: any[] = [];
  let dbError: string | null = null;

  try {
    demandas = await prisma.demanda.findMany({
      include: { responsavel: true, criado_por: true },
      orderBy: { data_criacao: "desc" },
    });
  } catch (err) {
    console.error("[demandas] Prisma query failed", err);
    dbError = err instanceof Error ? err.message : "Erro desconhecido";
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
            Gestão de Demandas
          </h2>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Projetos e iniciativas da Torre LM.
          </p>
        </div>

        {dbError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm font-medium">
            Erro ao conectar ao banco de dados: <span className="font-mono">{dbError}</span>
            <br />
            <span className="text-red-500 text-xs">Verifique os logs do servidor para mais detalhes.</span>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Quadro de Demandas
              </h3>
            </div>
            <DemandaBoard initialDemandas={demandas} />
          </div>
        )}
      </div>
    </div>
  );
}
