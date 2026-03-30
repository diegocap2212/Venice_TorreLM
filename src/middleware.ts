import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  // Protege todas as rotas exceto arquivos estáticos, imagens e favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|venice-logo.png|venice-logo-black.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)$).*)"],
}
