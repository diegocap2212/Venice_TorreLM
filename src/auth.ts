import NextAuth from "next-auth"
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    MicrosoftEntraId({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      return user.email?.endsWith("@venicetech.com.br") ?? false
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name ?? undefined },
          create: { email: user.email, name: user.name ?? "" },
          select: { id: true },
        })
        token.id = dbUser.id
        token.role = "BP_ADMIN"
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
})
