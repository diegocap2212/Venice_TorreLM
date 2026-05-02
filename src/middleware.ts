import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

export async function middleware(request: any) {
  const session = await auth()

  // Se o usuário está autenticado mas precisa redefinir senha, redireciona para reset
  if (session?.user) {
    const needsReset = (session.user as any).needsPasswordReset
    const isResetPage = request.nextUrl.pathname === "/reset-password"

    if (needsReset && !isResetPage && !request.nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.redirect(new URL("/reset-password", request.url))
    }

    // Se já redefiniu a senha, não pode voltar para reset
    if (!needsReset && isResetPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}
