import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

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

        const email = credentials.email as string
        const password = credentials.password as string

        // Rigorosa validação de domínio Venice
        const allowedDomains = ["@venicetech.com.br", "@venice.com.br"]
        const userEmail = email.toLowerCase()
        const isAllowed = allowedDomains.some(domain => userEmail.endsWith(domain))

        if (!isAllowed) {
          throw new Error(`Acesso restrito ao domínio corporativo Venice`)
        }

        const user = await prisma.user.findUnique({
          where: { email }
        }) as any

        if (!user || !user.password) {
          return null
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
  },
  secret: process.env.AUTH_SECRET,
})
