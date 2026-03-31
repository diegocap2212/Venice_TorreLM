import { MaterialList } from "@/components/reports/material-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let materials: any[] = [];

  try {
    materials = await prisma.material.findMany({
      orderBy: { data_upload: "desc" },
    }) || [];
  } catch (err) {
    console.error("[reports] Prisma query failed", err);
  }

  return (
    <div className="p-10 min-h-full bg-[#f8fafc]/50">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Repositório de Materiais</h2>
          <p className="text-sm text-slate-500 font-medium">Acesso rápido a documentos e apresentações oficiais.</p>
        </div>
        <MaterialList initialData={materials} />
      </div>
    </div>
  );
}
