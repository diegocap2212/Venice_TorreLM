"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  ExternalLink,
  Presentation,
  FileVideo,
  FileArchive,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMaterial } from "@/app/actions/material-actions";
import { format } from "date-fns";
import { MaterialDrawer } from "./material-drawer";
import { deleteMaterial } from "@/app/actions/material-actions";

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
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDelete = async (id: string, titulo: string) => {
    if (confirm(`Excluir material "${titulo}"?`)) {
      setMaterials(materials.filter(m => m.id !== id));
      await deleteMaterial(id);
    }
  };

  const getUploadType = (file: File) => {
    if (file.type.includes("video")) return "vídeo";
    if (file.type.includes("pdf") || file.type.includes("officedocument")) return "anexo";
    if (file.type.includes("presentation") || file.name.match(/\.(pptx?|pdf)$/i)) return "apresentação";
    return "documento";
  };

  const toDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Não foi possível ler arquivo"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const url = await toDataURL(file);
      const newMaterial = await createMaterial({
        titulo: file.name,
        descricao: `Upload local via PC (${file.type || "sem tipo"})`,
        url,
        tipo: getUploadType(file),
      });

      setMaterials((prev) => [newMaterial as Material, ...prev]);
      router.refresh();
    } catch (error) {
      console.error("Falha ao enviar material:", error);
      alert("Erro ao subir arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

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

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            onClick={openFilePicker}
            disabled={isUploading}
            variant="outline"
            className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Enviando..." : "Subir do PC"}
          </Button>

          <Button 
            onClick={() => {
              setSelectedMaterial(null);
              setIsDrawerOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar URL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-10 animate-in fade-in duration-700">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-200">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">Nenhum material encontrado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px] font-medium">Comece subindo suas apresentações ou adicionando links externos.</p>
          </div>
        ) : (
          materials.map((item) => (
            <div key={item.id} className="group bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  onClick={() => handleDelete(item.id, item.titulo)}
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors shadow-inner">
                  {getIcon(item.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-700 transition-colors truncate">
                    {item.titulo}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.tipo}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {format(new Date(item.data_upload), "dd MMM yyyy")}
                    </span>
                  </div>
                  {item.descricao && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed font-medium">
                      {item.descricao}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between gap-3">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="ghost" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Visualizar
                  </Button>
                </a>
                <Button variant="ghost" className="h-10 w-10 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <MaterialDrawer 
        material={selectedMaterial}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedMaterial(null);
        }}
      />
    </div>
  );
}
