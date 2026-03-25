"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Target } from "lucide-react";
import { useRole } from "@/components/providers/role-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const links = [
    { href: "/", label: "Pipeline (Kanban)", icon: <LayoutDashboard className="w-4 h-4" />, allowed: ["ADMIN", "SDM", "G", "BP", "DP"] },
    { href: "/squads", label: "Meus Squads", icon: <Target className="w-4 h-4" />, allowed: ["ADMIN", "SDM"] },
    { href: "/candidatos", label: "Banco de Talentos", icon: <Users className="w-4 h-4" />, allowed: ["ADMIN", "G", "BP"] },
    { href: "/configuracoes", label: "SLA Configs", icon: <Settings className="w-4 h-4" />, allowed: ["ADMIN"] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-30 flex flex-col shrink-0 min-h-screen">
      <div className="h-14 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-white font-bold tracking-wider">VENICE <span className="font-light text-slate-400">System</span></h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {links.map((link) => {
          if (!link.allowed.includes(role)) return null;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
