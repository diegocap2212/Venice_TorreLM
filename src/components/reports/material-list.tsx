"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  ExternalLink,
  Presentation,
  FileVideo,
  FileArchive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Material {
  id: string;
  titulo: string;
  descricao?: string;
  url: string;
  tipo: string;
  data_upload: Date | string;
}

interface MaterialListProps {
  initialData: Material[];
}

export function MaterialList({ initialData }: MaterialListProps) {
  const [materials, setMaterials] = useState(initialData);

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "apresentação": return <Presentation className="w-6 h-6 text-orange-500" />;
      case "vídeo": return <FileVideo className="w-6 h-6 text-blue-500" />;
      case "anexo": return <FileArchive className="w-6 h-6 text-purple-500" />;
      default: return <FileText className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Repositório Venice Materials</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Subir Material
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-200">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Nenhum material encontrado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">Comece subindo suas apresentações e materiais de apoio.</p>
          </div>
        ) : (
          materials.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                  {getIcon(item.tipo)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-700 transition-colors truncate">
                    {item.titulo}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {item.tipo} • {format(new Date(item.data_upload), "dd MMM yyyy")}
                  </p>
                  {item.descricao && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.descricao}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                <Button variant="ghost" className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Visualizar
                </Button>
                <Button variant="ghost" className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
