import { createHash } from "crypto"

/**
 * Gera SHA-256 do CPF (apenas dígitos) para armazenamento seguro.
 * Usado para validação de unicidade sem expor o CPF em texto plano.
 */
export function hashCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "")
  return createHash("sha256").update(digits).digest("hex")
}

/**
 * Mascara CPF para exibição segura na UI.
 * Entrada: "12345678901" ou "123.456.789-01"
 * Saída: "***.***.789-01"
 */
export function maskCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return "***.***.***-**"
  return `***.***. ${digits.substring(6, 9)}-${digits.substring(9)}`
    .replace(" ", "") // remove espaço acidental
}

/**
 * Valida CPF com algoritmo de dígitos verificadores.
 */
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false // todos iguais

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = 11 - (sum % 11)
  if (remainder >= 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = 11 - (sum % 11)
  if (remainder >= 10) remainder = 0
  return remainder === parseInt(digits[10])
}

/**
 * Formata CPF para exibição com pontuação.
 * "12345678901" → "123.456.789-01"
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`
}
