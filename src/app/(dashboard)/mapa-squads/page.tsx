import { SquadMapClient } from "@/components/squads/squad-map-client"
import { getMapaSquads } from "@/app/actions/squad-actions"

export const dynamic = "force-dynamic"

export default async function MapaSquadsPage() {
  let squads: Awaited<ReturnType<typeof getMapaSquads>> = []
  let dbError: string | null = null

  try {
    squads = await getMapaSquads()
  } catch (err) {
    console.error("[mapa-squads] Prisma query failed", err)
    dbError = err instanceof Error ? err.message : "Erro desconhecido"
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
            Mapa de Squads
          </h2>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Visão operacional dos squads da Torre LM.
          </p>
        </div>

        {dbError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm font-medium">
            Erro ao conectar ao banco:{" "}
            <span className="font-mono">{dbError}</span>
            <br />
            <span className="text-red-500 text-xs">
              Verifique os logs do servidor para mais detalhes.
            </span>
          </div>
        ) : (
          <SquadMapClient initialSquads={squads} />
        )}
      </div>
    </div>
  )
}
