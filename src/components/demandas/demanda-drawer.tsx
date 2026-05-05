"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Loader2,
  Trash2,
  ShieldAlert,
  Calendar,
  Tag,
  AlignLeft,
} from "lucide-react";
import { updateDemanda, toggleBloqueio, deleteDemanda } from "@/app/actions/demanda-actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DemandaDrawerProps {
  demanda: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updated: any) => void;
  onDelete?: (id: string) => void;
}

const prioridadeColors: Record<string, string> = {
  CRITICA: "bg-red-50 text-red-600 border-red-200",
  ALTA: "bg-orange-50 text-orange-600 border-orange-200",
  NORMAL: "bg-blue-50 text-blue-600 border-blue-200",
  BAIXA: "bg-slate-50 text-slate-500 border-slate-200",
};

const tipoLabels: Record<string, string> = {
  INICIATIVA: "Iniciativa",
  PROJETO: "Projeto",
  TAREFA: "Tarefa",
  MELHORIA: "Melhoria",
};

export function DemandaDrawer({ demanda, isOpen, onClose, onUpdate, onDelete }: DemandaDrawerProps) {
  if (!demanda) return null;

  const router = useRouter();

  const [descricao, setDescricao] = useState(demanda.descricao || "");
  const [tags, setTags] = useState((demanda.tags || []).join(", "));
  const [dataPrevista, setDataPrevista] = useState(
    demanda.data_prevista
      ? new Date(demanda.data_prevista).toISOString().split("T")[0]
      : ""
  );
  const [bloqueada, setBloqueada] = useState(demanda.bloqueada || false);
  const [motivoBloqueio, setMotivoBloqueio] = useState(demanda.motivo_bloqueio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateDemanda(demanda.id, {
      descricao,
      tags,
      data_prevista: dataPrevista || null,
    });
    if (res.success) {
      onUpdate?.({ ...demanda, descricao, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean), data_prevista: dataPrevista ? new Date(dataPrevista) : null });
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleBloqueioToggle = async (checked: boolean) => {
    setBloqueada(checked);
    await toggleBloqueio(demanda.id, checked, checked ? motivoBloqueio : undefined);
    onUpdate?.({ ...demanda, bloqueada: checked, motivo_bloqueio: checked ? motivoBloqueio : null });
    router.refresh();
  };

  const handleSaveMotivo = async () => {
    await toggleBloqueio(demanda.id, bloqueada, motivoBloqueio);
    onUpdate?.({ ...demanda, motivo_bloqueio: motivoBloqueio });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    const res = await deleteDemanda(demanda.id);
    if (res.success) {
      onDelete?.(demanda.id);
      router.refresh();
    }
    setIsDeleting(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-0 border-l border-slate-200 shadow-2xl bg-white">
        <div className="h-2 w-full bg-primary/20" />

        <div className="p-8 space-y-8">
          <SheetHeader className="text-left space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {tipoLabels[demanda.tipo] || demanda.tipo}
              </span>
              <Badge
                variant="outline"
                className={`text-[9px] font-bold uppercase border rounded-md px-1.5 py-0 ${prioridadeColors[demanda.prioridade] || ""}`}
              >
                {demanda.prioridade}
              </Badge>
              {demanda.bloqueada && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                  <ShieldAlert className="w-3 h-3" />
                  Bloqueada
                </div>
              )}
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {demanda.titulo}
              </SheetTitle>
              {demanda.squad && (
                <SheetDescription className="text-slate-400 font-medium text-xs mt-1">
                  {demanda.squad} · Criado em{" "}
                  {format(new Date(demanda.data_criacao), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                </SheetDescription>
              )}
            </div>
          </SheetHeader>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Etapa", value: demanda.etapa },
              { label: "Responsável", value: demanda.responsavel?.name || "—" },
              { label: "Criado por", value: demanda.criado_por?.name || "—" },
              {
                label: "Data Prevista",
                value: demanda.data_prevista
                  ? format(new Date(demanda.data_prevista), "dd/MM/yyyy")
                  : "—",
              },
            ].map((info) => (
              <div
                key={info.label}
                className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100"
              >
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">
                  {info.label}
                </p>
                <p className="text-sm font-bold text-slate-700 tracking-tight">
                  {info.value}
                </p>
              </div>
            ))}
          </div>

          <Separator className="bg-slate-100" />

          {/* Edição */}
          <section className="space-y-5">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-primary" />
              Detalhes
            </h4>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Descrição
              </Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o objetivo, contexto e critérios de conclusão..."
                className="min-h-[120px] bg-white border-slate-200 rounded-2xl focus-visible:ring-primary/20 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Data Prevista
                </Label>
                <Input
                  type="date"
                  value={dataPrevista}
                  onChange={(e) => setDataPrevista(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Tags
                </Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="RH, infra, produto"
                  className="rounded-xl border-slate-200 text-sm h-9"
                />
              </div>
            </div>
          </section>

          <Separator className="bg-slate-100" />

          {/* Bloqueio */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Bloqueio
              </h4>
              <Checkbox
                checked={bloqueada}
                onCheckedChange={(checked) => handleBloqueioToggle(!!checked)}
                className="w-5 h-5 border-2 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
              />
            </div>

            {bloqueada && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Motivo do Bloqueio
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={motivoBloqueio}
                    onChange={(e) => setMotivoBloqueio(e.target.value)}
                    placeholder="Ex: aguardando aprovação de infra..."
                    className="rounded-xl border-red-200 text-sm h-9 focus-visible:ring-red-200"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveMotivo}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-9 text-xs font-bold shrink-0"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pb-8">
            <Button
              className="flex-[2] h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Salvar Alterações"
              )}
            </Button>
            <Button
              variant="outline"
              className={`flex-1 h-12 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                confirmDelete
                  ? "border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                  : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500"
              }`}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : confirmDelete ? (
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Confirmar
                </span>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
