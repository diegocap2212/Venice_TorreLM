import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === "/login"
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth")

      // APIs de auth são sempre públicas
      if (isAuthApi) return true

      // Redirecionar não-autenticados para login
      if (!isLoggedIn && !isLoginPage) {
        return false
      }

      // Redirecionar autenticados da página de login para home
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/", nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session
    },
  },
  providers: [], // Os provedores reais ficam no auth.ts (Node runtime)
} satisfies NextAuthConfig
