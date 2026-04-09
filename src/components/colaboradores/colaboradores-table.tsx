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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Mail,
  Search,
  Filter,
  X,
  Clock,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ColaboradorDrawer } from "./colaborador-drawer";
import { HoraExtraModal } from "./hora-extra-modal";
import { FollowupModal } from "./followup-modal";
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
  const [selectedHoraExtraColab, setSelectedHoraExtraColab] = useState<Colaborador | null>(null);
  const [selectedFollowupColab, setSelectedFollowupColab] = useState<Colaborador | null>(null);
  
  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCargo, setSelectedCargo] = useState("all");

  const cargos = Array.from(new Set(initialData.map(c => c.cargo))).sort();

  const filteredData = data.filter(colab => {
    const matchesSearch = 
      colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (colab.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesCargo = selectedCargo === "all" || colab.cargo === selectedCargo;
    
    return matchesSearch && matchesCargo;
  });

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Buscar por nome ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-5 bg-white border-slate-200 rounded-xl text-xs focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 shadow-sm transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
                title="Limpar busca"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <Select value={selectedCargo} onValueChange={(val) => setSelectedCargo(val || "all")}>
            <SelectTrigger className="w-full sm:w-48 py-5 bg-white border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-emerald-500/20 shadow-sm transition-all">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <SelectValue placeholder="FILTRAR POR CARGO" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 rounded-xl shadow-xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-emerald-50 focus:text-emerald-700">TODOS OS CARGOS</SelectItem>
              {cargos.map((cargo) => (
                <SelectItem key={cargo} value={cargo} className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-emerald-50 focus:text-emerald-700">
                  {cargo.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchTerm !== "" || selectedCargo !== "all") && (
             <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCargo("all");
              }}
              className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-3"
             >
               Limpar Filtros
             </Button>
          )}
        </div>

        <Button 
          onClick={() => {
            setSelectedColab(null);
            setIsDrawerOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-5 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
        >
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell className="py-24 px-6 text-center" colSpan={6}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Nenhum colaborador encontrado</p>
                      <p className="text-xs text-slate-400 mt-1">Tente ajustar seus filtros ou busca.</p>
                    </div>
                    {(searchTerm !== "" || selectedCargo !== "all") && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCargo("all");
                        }}
                        className="mt-2 text-[9px] font-black uppercase tracking-widest rounded-lg"
                      >
                        Limpar todos os filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((colab) => (
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
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm border transition-all duration-300 ${
                    colab.status === "Ativo" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : colab.status === "Férias"
                      ? "bg-sky-50 text-sky-700 border-sky-100"
                      : colab.status === "Desligado"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      colab.status === "Ativo" ? "bg-emerald-500 animate-pulse" : 
                      colab.status === "Férias" ? "bg-sky-500" :
                      colab.status === "Desligado" ? "bg-rose-500" :
                      "bg-slate-400"
                    }`} />
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
                        onClick={() => setSelectedHoraExtraColab(colab)}
                        className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg cursor-pointer flex items-center gap-2 text-slate-600 hover:bg-slate-50"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Lançar H. Extra
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSelectedFollowupColab(colab)}
                        className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg cursor-pointer flex items-center gap-2 text-slate-600 hover:bg-slate-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Follow-up
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

      <HoraExtraModal 
        colaborador={selectedHoraExtraColab}
        isOpen={!!selectedHoraExtraColab}
        onClose={() => setSelectedHoraExtraColab(null)}
      />

      <FollowupModal 
        colaborador={selectedFollowupColab}
        isOpen={!!selectedFollowupColab}
        onClose={() => setSelectedFollowupColab(null)}
      />
    </div>
  );
}
