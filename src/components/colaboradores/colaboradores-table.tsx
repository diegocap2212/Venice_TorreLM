"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Briefcase, 
  User,
  Building2,
  Users as UsersIcon,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ColaboradorDrawer } from "./colaborador-drawer";
import { deleteColaborador } from "@/app/actions/colaborador-actions";

interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  status: string;
  data_admissao: Date | string;
  data_nascimento: Date | string;
  torre?: string;
  squad?: string;
  email?: string;
  informacoes_internas?: string;
}

interface ColaboradoresTableProps {
  initialData: Colaborador[];
}

export function ColaboradoresTable({ initialData }: ColaboradoresTableProps) {
  const [data, setData] = useState(initialData);
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleEdit = (colab: Colaborador) => {
    setSelectedColab(colab);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este colaborador?")) {
      await deleteColaborador(id);
      setData(data.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="relative w-72">
          {/* Search placeholder */}
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Colaborador
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 px-6">Colaborador</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 px-6">Cargo / Torre</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 px-6">Squad</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 px-6">Email</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 px-6 text-center">Status</TableHead>
              <TableHead className="w-[80px] py-4 px-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell className="py-12 px-6 text-center text-sm text-slate-400" colSpan={6}>
                  Nenhum colaborador encontrado. Use o botão "Novo Colaborador" para começar.
                </TableCell>
              </TableRow>
            ) : (
              data.map((colab) => (
                <TableRow key={colab.id} className="border-slate-100 hover:bg-slate-50/30 transition-colors group">
                <TableCell className="py-4 px-6 text-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shadow-sm border border-emerald-100 group-hover:scale-105 transition-transform">
                      {colab.nome.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{colab.nome}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">Adm: {format(new Date(colab.data_admissao), "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Briefcase className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs font-bold">{colab.cargo}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{colab.torre || "-"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UsersIcon className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-xs font-bold">{colab.squad || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-xs font-medium truncate max-w-[150px]">{colab.email || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm ${
                    colab.status === "Ativo" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${colab.status === "Ativo" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    {colab.status}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border-slate-200 rounded-xl p-1 shadow-xl">
                      <DropdownMenuItem 
                        onClick={() => handleEdit(colab)}
                        className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg cursor-pointer flex items-center gap-2 text-slate-600 hover:bg-slate-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(colab.id)}
                        className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
          </TableBody>
        </Table>
      </div>

      <ColaboradorDrawer 
        colaborador={selectedColab}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedColab(null);
        }}
      />
    </div>
  );
}
