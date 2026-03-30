"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").refine((email) => {
    const allowedDomains = ["@venicetech.com.br", "@venice.com.br"];
    return allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
  }, "Acesso restrito ao domínio corporativo Venice"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Validate input
    const validatedFields = signupSchema.safeParse({ name, email, password })
    
    if (!validatedFields.success) {
      return { 
        error: validatedFields.error.flatten().fieldErrors.email?.[0] || 
               validatedFields.error.flatten().fieldErrors.password?.[0] || 
               validatedFields.error.flatten().fieldErrors.name?.[0] || 
               "Dados inválidos" 
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado." }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "BP", // Default role
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Erro ao realizar o cadastro. Tente novamente." }
  }
}
