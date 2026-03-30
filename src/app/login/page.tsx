"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Lock, Mail, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciais inválidas ou e-mail não corporativo.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Erro ao tentar realizar o login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Sophisticated Background Accents */}
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-foreground/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-[440px] rounded-[40px] border-border/40 shadow-[0_32px_64px_-16px_rgba(30,41,59,0.1)] relative bg-white/40 backdrop-blur-[32px] animate-in fade-in zoom-in-95 duration-1000 border-t-primary/20">
        <CardHeader className="pt-14 pb-8 px-12 text-center pointer-events-none">
          <div className="mx-auto w-48 h-12 mb-10 transform hover:scale-105 transition-all duration-700">
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
          <form onSubmit={handleLogin} className="space-y-7">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">
                Acesso Corporativo
              </Label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-all duration-300">
                  <Mail className="w-full h-full" />
                </div>
                <Input 
                  type="email" 
                  placeholder="usuario@venicetech.com.br" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 py-7 bg-white/60 border-border/40 rounded-2xl text-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-500 font-semibold placeholder:text-foreground/20 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 ml-1">
                Senha Segura
              </Label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-all duration-300">
                  <Lock className="w-full h-full" />
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 py-7 bg-white/60 border-border/40 rounded-2xl text-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-500 font-semibold placeholder:text-foreground/20"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-[11px] font-black uppercase tracking-wider text-center animate-in slide-in-from-top-3 duration-500">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-8 bg-foreground hover:bg-foreground/90 text-primary rounded-2xl text-xs font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] transition-all active:scale-[0.97] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 mt-6 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Entrar na Torre</span>
                  <Sparkles className="w-4 h-4 text-primary relative z-10 animate-pulse" />
                </>
              )}
            </Button>

            <div className="flex flex-col items-center gap-6 mt-4">
              <div className="pt-4 flex flex-col items-center gap-4 opacity-30 group">
                <div className="h-[1px] w-24 bg-foreground/20 transition-all group-hover:w-32" />
                <p className="text-center text-[9px] text-foreground font-black uppercase tracking-[0.4em]">
                  Venice Management · 2026
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
