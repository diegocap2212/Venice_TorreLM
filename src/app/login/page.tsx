"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleMicrosoftLogin = async () => {
    setLoading(true)
    await signIn("microsoft-entra-id", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-foreground/5 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-[440px] rounded-[40px] border-border/40 shadow-[0_32px_64px_-16px_rgba(30,41,59,0.1)] relative bg-white/40 backdrop-blur-[32px] animate-in fade-in zoom-in-95 duration-1000 border-t-primary/20">
        <CardHeader className="pt-14 pb-10 px-12 text-center pointer-events-none">
          <div className="mx-auto w-48 h-12 mb-10">
            <Image
              src="/venice-logo-black.png"
              alt="Venice Logo"
              className="w-full h-full object-contain"
              width={192}
              height={48}
              priority
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-4 bg-primary/40" />
            <CardDescription className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em]">
              Torre LM · Gestão Premium
            </CardDescription>
            <div className="h-[1px] w-4 bg-primary/40" />
          </div>
        </CardHeader>

        <CardContent className="px-12 pb-14">
          <div className="space-y-8">
            <p className="text-center text-[11px] text-foreground/40 font-black uppercase tracking-[0.2em]">
              Acesso restrito a <span className="text-primary">@venicetech.com.br</span>
            </p>

            <Button
              onClick={handleMicrosoftLogin}
              disabled={loading}
              className="w-full py-8 bg-foreground hover:bg-foreground/90 text-primary rounded-2xl text-xs font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] transition-all active:scale-[0.97] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <>
                  {/* Microsoft Icon */}
                  <svg className="w-5 h-5 relative z-10 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M11.4 2H2v9.4h9.4V2z" fill="#f25022" />
                    <path d="M22 2h-9.4v9.4H22V2z" fill="#7fba00" />
                    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00a4ef" />
                    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#ffb900" />
                  </svg>
                  <span className="relative z-10">Entrar com Microsoft</span>
                  <Sparkles className="w-4 h-4 text-primary relative z-10 animate-pulse" />
                </>
              )}
            </Button>

            <div className="flex flex-col items-center gap-4 opacity-30">
              <div className="h-[1px] w-24 bg-foreground/20" />
              <p className="text-center text-[9px] text-foreground font-black uppercase tracking-[0.4em]">
                Venice Management · 2026
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
