"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SensitiveFieldProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  prefix?: string
}

export function SensitiveField({ value, onChange, placeholder, className, prefix }: SensitiveFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-400 font-medium pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn("pr-10", prefix && "pl-8", className)}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
        title={visible ? "Ocultar" : "Revelar"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}
