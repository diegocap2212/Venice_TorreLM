import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

// ─── WHITELIST LGPD ──────────────────────────────────────────────────────────
// Apenas estes 3 usuários têm acesso ao sistema BP Hub.
// Qualquer outro email — mesmo que do domínio venice — é rejeitado.
const AUTHORIZED_EMAILS = [
  "diego.caporusso@venicetech.com.br",
  "leticia.almeida@venicetech.com.br",
  "lucas.rodrigues@venicetech.com.br",
] as const
// ─────────────────────────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Credentials({
      name: "Venice Login",
      credentials: {
        email: { label: "E-mail Venice", type: "email", placeholder: "usuario@venicetech.com.br" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        // Rejeitar qualquer email fora da whitelist
        if (!(AUTHORIZED_EMAILS as readonly string[]).includes(email)) {
          throw new Error("Acesso não autorizado. Este sistema é restrito à equipe de Gestão de Contas.")
        }

        // Buscar usuário — deve existir previamente, sem auto-criação
        const user = await prisma.user.findUnique({ where: { email } }) as any

        if (!user || !user.password) {
          throw new Error("Conta não encontrada. Entre em contato com o administrador do sistema.")
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // Sessão expira em 8 horas (jornada de trabalho)
  },
  secret: process.env.AUTH_SECRET,
})
