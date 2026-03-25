"use client";

import { useRole, Role } from "@/components/providers/role-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  const { role, setRole } = useRole();

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-slate-800">Pipeline de Talentos</h2>
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">Torre LM</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Testar como:</span>
          <Select value={role} onValueChange={(r) => setRole(r as Role)}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BP">BP (RH)</SelectItem>
              <SelectItem value="G">Gerente (G)</SelectItem>
              <SelectItem value="SDM">Torre/Delivery (SDM)</SelectItem>
              <SelectItem value="DP">Dep. Pessoal (DP)</SelectItem>
              <SelectItem value="ADMIN">Admin Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-white text-xs">{role}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
