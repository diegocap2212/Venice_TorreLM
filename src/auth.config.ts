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

      if (isAuthApi) return true

      if (!isLoggedIn && !isLoginPage) {
        return false // Redireciona para login
      }
      
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/", nextUrl))
      }

      // Restrição de Acesso para Scrum Masters (SM)
      if (isLoggedIn && (auth.user as any).role === "SM") {
        const allowedPaths = ["/ways-of-working", "/cone-locavia"]
        const isAllowed = allowedPaths.some(path => nextUrl.pathname.startsWith(path)) || nextUrl.pathname.startsWith("/_next")
        
        if (nextUrl.pathname === "/") {
          return Response.redirect(new URL("/ways-of-working", nextUrl))
        }

        if (!isAllowed) {
          return Response.redirect(new URL("/ways-of-working", nextUrl)) // Ou uma página de acesso negado
        }
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
