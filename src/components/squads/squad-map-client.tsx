"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Search, Users } from "lucide-react"
import { SaudeBadge, SaudeDot } from "./squad-saude-badge"
import { SquadEditDrawer } from "./squad-edit-drawer"
import { getMapaSquads } from "@/app/actions/squad-actions"

type SquadEntry = Awaited<ReturnType<typeof getMapaSquads>>[0]
type SquadMetadata = NonNullable<SquadEntry["metadata"]>
type SavedMetadata = Omit<SquadMetadata, "created_at" | "updated_at">

const SAUDE_OPTIONS = ["BOA", "REGULAR", "CRITICA"] as const

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-slate-100 text-slate-600",
]

function avatarColor(nome: string) {
  const sum = nome.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

interface SquadCardProps {
  entry: SquadEntry
  onEdit: (entry: SquadEntry) => void
}

function SquadCard({ entry, onEdit }: SquadCardProps) {
  const saude = entry.metadata?.saude ?? "BOA"
  const pontoFocal = entry.metadata?.ponto_focal
  const objetivo = entry.metadata?.objetivo
  const maxAvatars = 4
  const extra = entry.membros.length - maxAvatars

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SaudeDot saude={saude} />
          <span className="text-[13px] font-black text-slate-800 truncate">
            {entry.squad}
          </span>
        </div>
        <button
          onClick={() => onEdit(entry)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/10 transition-all duration-200 shrink-0 opacity-0 group-hover:opacity-100"
          title="Editar squad"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {pontoFocal && (
        <p className="text-[11px] text-slate-400 font-medium truncate">
          SDM: <span className="text-slate-600 font-bold">{pontoFocal}</span>
        </p>
      )}

      {objetivo && (
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
          {objetivo}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
        <div className="flex items-center -space-x-2">
          {entry.membros.slice(0, maxAvatars).map((m) => (
            <div
              key={m.id}
              title={m.nome}
              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black shrink-0 ${avatarColor(m.nome)}`}
            >
              {getInitials(m.nome)}
            </div>
          ))}
          {extra > 0 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 shrink-0">
              +{extra}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Users className="w-3 h-3" />
          {entry.membros.length}
        </div>
      </div>
    </div>
  )
}

interface SquadMapClientProps {
  initialSquads: SquadEntry[]
}

export function SquadMapClient({ initialSquads }: SquadMapClientProps) {
  const [squads, setSquads] = useState(initialSquads)
  const [search, setSearch] = useState("")
  const [filtroSaude, setFiltroSaude] = useState<string | null>(null)
  const [drawerEntry, setDrawerEntry] = useState<SquadEntry | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleEdit = (entry: SquadEntry) => {
    setDrawerEntry(entry)
    setDrawerOpen(true)
  }

  const handleSaved = (updated: SavedMetadata) => {
    setSquads((prev) =>
      prev.map((s) => {
        if (s.squad !== updated.squad) return s
        const merged: SquadMetadata = {
          ...updated,
          created_at: s.metadata?.created_at ?? new Date(),
          updated_at: new Date(),
        }
        return { ...s, metadata: merged }
      })
    )
    setDrawerEntry((prev) => {
      if (!prev || prev.squad !== updated.squad) return prev
      const merged: SquadMetadata = {
        ...updated,
        created_at: prev.metadata?.created_at ?? new Date(),
        updated_at: new Date(),
      }
      return { ...prev, metadata: merged }
    })
  }

  const filtered = useMemo(() => {
    return squads.filter((s) => {
      const matchSearch =
        !search ||
        s.squad.toLowerCase().includes(search.toLowerCase()) ||
        (s.metadata?.ponto_focal ?? "").toLowerCase().includes(search.toLowerCase())
      const matchSaude =
        !filtroSaude || (s.metadata?.saude ?? "BOA") === filtroSaude
      return matchSearch && matchSaude
    })
  }, [squads, search, filtroSaude])

  const byTorre = useMemo(() => {
    const map = new Map<string, SquadEntry[]>()
    for (const s of filtered) {
      const key = s.torre ?? "Sem Torre"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [filtered])

  const stats = useMemo(() => {
    const counts = { BOA: 0, REGULAR: 0, CRITICA: 0 }
    for (const s of squads) {
      const saude = (s.metadata?.saude ?? "BOA") as keyof typeof counts
      counts[saude] = (counts[saude] ?? 0) + 1
    }
    return counts
  }, [squads])

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{squads.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">squads ativos</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Saúde BOA</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{stats.BOA}</p>
          <p className="text-[11px] text-emerald-500 font-medium">squads</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Regular</p>
          <p className="text-3xl font-black text-amber-700 mt-1">{stats.REGULAR}</p>
          <p className="text-[11px] text-amber-500 font-medium">squads</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-5">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Crítica</p>
          <p className="text-3xl font-black text-red-700 mt-1">{stats.CRITICA}</p>
          <p className="text-[11px] text-red-500 font-medium">squads</p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar squad ou ponto focal..."
            className="pl-9 border-slate-200 bg-white h-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filtroSaude === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setFiltroSaude(null)}
            className="text-[11px] font-black uppercase tracking-wider h-9"
          >
            Todos
          </Button>
          {SAUDE_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={filtroSaude === s ? "default" : "ghost"}
              size="sm"
              onClick={() => setFiltroSaude(filtroSaude === s ? null : s)}
              className="text-[11px] font-black uppercase tracking-wider h-9"
            >
              {s === "CRITICA" ? "CRÍTICA" : s}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid agrupado por Torre */}
      {byTorre.size === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 text-sm font-medium">Nenhum squad encontrado.</p>
          <p className="text-slate-300 text-xs mt-1">Verifique os filtros ou o cadastro de colaboradores.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byTorre.entries()).map(([torre, entries]) => (
            <div key={torre} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {torre}
                </h3>
                <span className="text-[10px] font-black text-slate-300">
                  ({entries.length} squad{entries.length !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => (
                  <SquadCard key={entry.squad} entry={entry} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer de edição */}
      {drawerEntry && (
        <SquadEditDrawer
          squad={drawerEntry.squad}
          metadata={drawerEntry.metadata}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
