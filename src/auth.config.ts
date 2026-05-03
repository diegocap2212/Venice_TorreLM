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

      if (!isLoggedIn && !isLoginPage) return false

      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/", nextUrl))
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
