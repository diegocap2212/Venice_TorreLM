import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|venice-logo.png|venice-logo-black.png|ways-of-working|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)$).*)"],
}
