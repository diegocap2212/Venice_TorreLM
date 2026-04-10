"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Briefcase, ChevronDown, UserRound,
  ClipboardCheck, TrendingUp, ShieldCheck, ClipboardList, LogOut, Target
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  children?: { label: string; href: string; color?: string }[]
  badge?: number
  badgeAlert?: boolean
}

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [pipelineOpen, setPipelineOpen] = useState(false)

  useEffect(() => {
    if (pathname.startsWith("/pipeline")) setPipelineOpen(true)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Visão Geral",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      id: "candidatos",
      label: "Candidatos & Vagas",
      icon: UserRound,
      href: "/candidatos",
    },
    {
      id: "pipeline",
      label: "Pipeline",
      icon: Briefcase,
      children: [
        { label: "Recrutamento", href: "/pipeline?tab=recrutamento", color: "bg-emerald-500" },
        { label: "Onboarding", href: "/pipeline?tab=onboarding", color: "bg-orange-500" },
      ]
    },
    {
      id: "pos-admissao",
      label: "Pós-Admissão",
      icon: ClipboardCheck,
      href: "/pos-admissao",
    },
    {
      id: "colaboradores",
      label: "Colaboradores",
      icon: Users,
      href: "/colaboradores",
    },
    {
      id: "performance",
      label: "Performance",
      icon: TrendingUp,
      href: "/performance",
    },
    {
      id: "reports",
      label: "Repositório",
      icon: ShieldCheck,
      href: "/reports",
    },
    {
      id: "ways-of-working",
      label: "Ways of Working",
      icon: Target,
      href: "/ways-of-working",
    },
    {
      id: "cone-locavia",
      label: "Cone Locavia",
      icon: ClipboardList,
      href: "/cone-locavia",
    },
  ]

  return (
    <aside className="w-72 bg-background border-r border-border flex flex-col h-full overflow-hidden transition-all duration-300 relative z-10">
      <div className="flex-1 overflow-y-auto pt-6 pb-28 px-4 space-y-1 custom-scrollbar scroll-smooth">

        {navItems.map(item => {
          const Icon = item.icon

          // Item com sub-menu (Pipeline)
          if (item.children) {
            const isParentActive = pathname.startsWith("/pipeline")

            return (
              <div key={item.id} className="space-y-1">
                <button
                  id={`nav-${item.id}`}
                  onClick={() => setPipelineOpen(!pipelineOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isParentActive
                      ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50"
                      : "text-foreground/50 hover:text-foreground hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-all duration-500 ${
                      isParentActive ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${pipelineOpen ? "rotate-180" : ""}`} />
                </button>

                {pipelineOpen && (
                  <div className="ml-10 pr-2 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
                    {item.children.map(child => {
                      // Detectar tab ativa pela query string
                      const tabName = child.href.split("tab=")[1]
                      const tabActive = isParentActive &&
                        (typeof window !== "undefined"
                          ? new URLSearchParams(window.location.search).get("tab") === tabName
                          : false)

                      return (
                        <Link
                          key={child.href}
                          id={`nav-pipeline-${tabName}`}
                          href={child.href}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                            tabActive ? "text-foreground bg-white shadow-sm border border-border/30" : "text-foreground/40 hover:text-foreground/70"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${child.color} ${tabActive ? "scale-125 shadow-sm" : "opacity-40"}`} />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Item simples
          const active = isActive(item.href!)

          return (
            <Link
              key={item.id}
              id={`nav-${item.id}`}
              href={item.href!}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${
                active
                  ? "bg-white text-foreground shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] border border-border/50"
                  : "text-foreground/50 hover:text-foreground hover:bg-white/60"
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-500 ${
                active ? "bg-primary text-foreground shadow-md shadow-primary/20" : "bg-secondary text-foreground/40 group-hover:bg-secondary/80"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  item.badgeAlert ? "bg-rose-100 text-rose-600" : "bg-primary/10 text-primary"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer Profile */}
      <div className="absolute bottom-0 w-full p-6 border-t border-border bg-white/40 backdrop-blur-xl">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-border/50 shadow-sm transition-all duration-500 group hover:shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center text-primary text-xs font-black border border-border shadow-inner transition-all duration-500 shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-black text-foreground/40 uppercase tracking-tighter">Logado como</span>
              <span className="text-[11px] font-black text-foreground -mt-0.5 truncate">{session?.user?.name || "Usuário"}</span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all duration-300 shrink-0"
            title="Sair do Sistema"
            id="btn-signout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
