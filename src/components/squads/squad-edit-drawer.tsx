"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { upsertSquadMetadata } from "@/app/actions/squad-actions"
import { SaudeBadge } from "./squad-saude-badge"

interface SquadMetadata {
  id: string
  squad: string
  torre: string | null
  objetivo: string | null
  ponto_focal: string | null
  stack: string | null
  cerimonias: string | null
  acessos: string | null
  saude: string
  notas_sdm: string | null
}

type SavedMetadata = Omit<SquadMetadata, "created_at" | "updated_at">

interface SquadEditDrawerProps {
  squad: string
  metadata: SquadMetadata | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (metadata: SavedMetadata) => void
}

export function SquadEditDrawer({
  squad,
  metadata,
  open,
  onOpenChange,
  onSaved,
}: SquadEditDrawerProps) {
  const [saude, setSaude] = useState(metadata?.saude ?? "BOA")
  const [pontoFocal, setPontoFocal] = useState(metadata?.ponto_focal ?? "")
  const [objetivo, setObjetivo] = useState(metadata?.objetivo ?? "")
  const [stack, setStack] = useState(metadata?.stack ?? "")
  const [cerimonias, setCerimonias] = useState(metadata?.cerimonias ?? "")
  const [acessos, setAcessos] = useState(metadata?.acessos ?? "")
  const [notasSdm, setNotasSdm] = useState(metadata?.notas_sdm ?? "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSaude(metadata?.saude ?? "BOA")
      setPontoFocal(metadata?.ponto_focal ?? "")
      setObjetivo(metadata?.objetivo ?? "")
      setStack(metadata?.stack ?? "")
      setCerimonias(metadata?.cerimonias ?? "")
      setAcessos(metadata?.acessos ?? "")
      setNotasSdm(metadata?.notas_sdm ?? "")
    }
  }, [open, metadata])

  const handleSave = async () => {
    setIsSaving(true)
    const res = await upsertSquadMetadata({
      squad,
      saude,
      ponto_focal: pontoFocal || undefined,
      objetivo: objetivo || undefined,
      stack: stack || undefined,
      cerimonias: cerimonias || undefined,
      acessos: acessos || undefined,
      notas_sdm: notasSdm || undefined,
    })
    if (res.success) {
      onSaved({
        id: metadata?.id ?? "",
        squad,
        torre: metadata?.torre ?? null,
        saude,
        ponto_focal: pontoFocal || null,
        objetivo: objetivo || null,
        stack: stack || null,
        cerimonias: cerimonias || null,
        acessos: acessos || null,
        notas_sdm: notasSdm || null,
      })
      onOpenChange(false)
    }
    setIsSaving(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto p-0 border-l border-slate-200 shadow-2xl bg-white">
        <div className="h-2 w-full bg-primary/20" />

        <div className="p-8 space-y-6">
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-2">
              <SaudeBadge saude={saude} />
            </div>
            <SheetTitle className="text-xl font-black text-slate-800">
              {squad}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Metadados operacionais do squad
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Saúde do Squad
              </Label>
              <Select value={saude} onValueChange={(v) => setSaude(v ?? "BOA")}>
                <SelectTrigger className="w-full h-9 text-sm border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOA">BOA</SelectItem>
                  <SelectItem value="REGULAR">REGULAR</SelectItem>
                  <SelectItem value="CRITICA">CRÍTICA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ponto Focal (SDM)
              </Label>
              <Input
                value={pontoFocal}
                onChange={(e) => setPontoFocal(e.target.value)}
                placeholder="Nome do responsável"
                className="h-9 text-sm border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Objetivo do Squad
              </Label>
              <Textarea
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Descreva o objetivo principal..."
                className="text-sm border-slate-200 min-h-20 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Stack Tecnológica
              </Label>
              <Textarea
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder="Ex: React, Node.js, PostgreSQL..."
                className="text-sm border-slate-200 min-h-16 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cerimônias
              </Label>
              <Textarea
                value={cerimonias}
                onChange={(e) => setCerimonias(e.target.value)}
                placeholder="Planning, Daily, Review, Retro..."
                className="text-sm border-slate-200 min-h-16 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Acessos e Ferramentas
              </Label>
              <Textarea
                value={acessos}
                onChange={(e) => setAcessos(e.target.value)}
                placeholder="Jira, Confluence, Datadog..."
                className="text-sm border-slate-200 min-h-16 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Notas SDM
              </Label>
              <Textarea
                value={notasSdm}
                onChange={(e) => setNotasSdm(e.target.value)}
                placeholder="Observações internas, alertas, contexto..."
                className="text-sm border-slate-200 min-h-20 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
