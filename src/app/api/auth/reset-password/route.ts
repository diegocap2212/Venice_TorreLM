import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const ResetPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const validation = ResetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: "Validação falhou",
        issues: validation.error.issues
      }, { status: 400 })
    }

    const { currentPassword, newPassword } = validation.data

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Validar senha atual
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Hash nova senha e atualizar
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        password_changed_at: new Date(),
      }
    })

    return NextResponse.json({
      message: "Senha alterada com sucesso"
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({
      error: "Erro ao redefinir senha"
    }, { status: 500 })
  }
}
