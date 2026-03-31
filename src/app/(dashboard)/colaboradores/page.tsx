import { ColaboradoresTable } from "@/components/colaboradores/colaboradores-table";
import { prisma } from "@/lib/prisma";

export default async function ColaboradoresPage() {
  let colaboradores: any[] = [];

  try {
    colaboradores = await prisma.colaborador.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        cargo: true,
        status: true,
        data_admissao: true,
        data_nascimento: true,
        torre: true,
        squad: true,
        email: true,
        // informacoes_internas propositalmente omitido aqui para performance
      }
    }) || [];
  } catch (err) {
    console.error("[colaboradores] Prisma query failed", err);
  }

  const sampleColaboradores = [
    {
      id: "sample-1",
      nome: "Ana Souza",
      cargo: "Analista de RH",
      status: "Ativo",
      data_admissao: new Date().toISOString(),
      data_nascimento: new Date(1990, 5, 10).toISOString(),
      torre: "Venice",
      squad: "Growth",
      email: "ana.souza@example.com",
      informacoes_internas: "Foco em recrutamento técnico",
    },
    {
      id: "sample-2",
      nome: "Bruno Lima",
      cargo: "Talent Partner",
      status: "Ativo",
      data_admissao: new Date().toISOString(),
      data_nascimento: new Date(1988, 10, 3).toISOString(),
      torre: "Venice",
      squad: "TA",
      email: "bruno.lima@example.com",
      informacoes_internas: "Atende squads de produto",
    },
  ];

  if (colaboradores.length === 0) {
    colaboradores = sampleColaboradores;
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Equipe Torre LM</h2>
          <p className="text-sm text-slate-500 font-medium">Gestão centralizada de talentos e squads.</p>
        </div>
        <ColaboradoresTable initialData={colaboradores} />
      </div>
    </div>
  );
}
