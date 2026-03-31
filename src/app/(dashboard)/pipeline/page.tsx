import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateVagaDialog } from "@/components/kanban/create-vaga-dialog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PipelinePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const { tab = "recrutamento" } = await searchParams;

  let vagas: any[] = [];

  try {
    vagas = await prisma.vaga.findMany({
      include: { responsavel: true },
      orderBy: { data_etapa_atual: "desc" },
    }) || [];
  } catch (err) {
    console.error("[pipeline] Prisma query failed", err);
    vagas = [];
  }

  const recrutamentoStages = [
    "REQUISICAO", "PREPARACAO", "TRIAGEM", "SHORTLIST", "ENTREVISTA_CLIENTE", "APROVACAO_PROPOSTA",
  ];

  const onboardingStages = [
    "CONTRATACAO", "ONB_ADMINISTRATIVO", "ONB_OPERACIONAL", "SEMANA_1", "MES_1_ALEM",
  ];

  const rsVagas = vagas.filter((v) => recrutamentoStages.includes(v.etapa_atual));
  const onboardingVagas = vagas.filter((v) => onboardingStages.includes(v.etapa_atual));

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Pipeline de Contratações</h2>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Fluxo end-to-end de Recrutamento e Onboarding.</p>
          </div>
          <CreateVagaDialog />
        </div>

        <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
          {tab === "onboarding" ? (
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Onboarding Experience</h3>
              </div>
              <KanbanBoard initialVagas={onboardingVagas} initialTab="ONBOARDING" hideHeader={true} />
            </section>
          ) : (
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">RH / Talent Recruiting</h3>
              </div>
              <KanbanBoard initialVagas={rsVagas} initialTab="RECRUTAMENTO" hideHeader={true} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
