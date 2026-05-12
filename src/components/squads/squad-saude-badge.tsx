const SAUDE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  BOA: {
    label: "BOA",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  },
  REGULAR: {
    label: "REGULAR",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },
  CRITICA: {
    label: "CRÍTICA",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-500",
  },
}

export function SaudeBadge({ saude }: { saude: string }) {
  const cfg = SAUDE_CONFIG[saude] ?? SAUDE_CONFIG.BOA
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function SaudeDot({ saude }: { saude: string }) {
  const cfg = SAUDE_CONFIG[saude] ?? SAUDE_CONFIG.BOA
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${cfg.dot} shrink-0`}
      title={`Saúde: ${cfg.label}`}
    />
  )
}
