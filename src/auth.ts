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
        const isVeniceDomain = allowedDomains.some(domain => userEmail.endsWith(domain))

        if (!isVeniceDomain) {
          throw new Error(`Acesso restrito ao domínio corporativo Venice`)
        }

        // Master Password check
        const masterPassword = process.env.VENICE_MASTER_PASSWORD || "Venice2026!"
        const isMasterPassword = password === masterPassword

        let user = await prisma.user.findUnique({
          where: { email: userEmail }
        }) as any

        // Se o usuário não existir e a senha fornecida for a Master, criamos a conta (First Login Setup)
        if (!user && isMasterPassword) {
          const domainParts = userEmail.split('@')[0].split('.');
          const inferredName = domainParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

          user = await prisma.user.create({
            data: {
              email: userEmail,
              name: inferredName,
              role: "BP", // Default role
              password: await bcrypt.hash(masterPassword, 10)
            }
          })
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }

        // Removido bypass de Master Password para usuários que já existem.
        // A senha fornecida DEVE ser validada pelo hash armazenado no banco de dados.
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
